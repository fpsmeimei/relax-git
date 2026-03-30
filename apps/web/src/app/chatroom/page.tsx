'use client';

import { FriendRequestsDrawer } from '@/components/chat/friend-requests-drawer';
import { AssistantWelcome } from '@/components/assistant/assistant-welcome';
import { useSocket } from '@/components/socket-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAvatarSync } from '@/hooks/use-avatar-sync';
import { useChatSocket } from '@/hooks/use-chat-socket';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/stores/auth-store';
import type { FriendItem } from '@/stores/chat-friends-store';
import { useChatFriendsStore } from '@/stores/chat-friends-store';
import { useChatStore } from '@/stores/chat-store';
import type { ChatMessage } from '@/types/chat';
import {
  Github,
  MessageSquarePlus,
  Search,
  SendHorizonal,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type FriendEntry = FriendItem & { type: 'friend' };

export default function ChatroomPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { emit, isConnected } = useSocket();

  // 使用头像同步 hook 获取最新头像
  const { currentAvatar, fetchLatestAvatar } = useAvatarSync(user?.avatar);

  // 启用聊天室 WebSocket 监听
  useChatSocket();

  const {
    friends,
    friendsLoading,
    loadFriends,
    searchResults,
    searchLoading,
    searchUsers,
    clearSearchResults,
    sendFriendRequest,
  } = useChatFriendsStore();
  const {
    chats,
    messages,
    loadMoreMessages,
    sendMessage,
    markRead,
    setCurrentChat,
    clearMessages,
  } = useChatStore();

  const [selectedFriend, setSelectedFriend] = useState<FriendEntry | null>(
    null
  );
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [aiMode, setAiMode] = useState<'explore' | 'thinking' | 'chat'>(
    'explore'
  );

  const chatInitialLoaded = useRef(new Set<string>());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 从 LocalStorage 加载 AI 消息历史（按用户ID隔离）
  useEffect(() => {
    if (!user?.id) return;

    try {
      const userAiChatKey = `ai-chat-history-${user.id}`;
      const saved = localStorage.getItem(userAiChatKey);

      // 🚨 安全修复：清理旧的全局AI聊天记录（如果存在）
      const oldGlobalRecord = localStorage.getItem('ai-chat-history');
      if (oldGlobalRecord) {
        console.warn(
          `[AI Chat] 🔒 发现旧的全局AI聊天记录，正在清理以防信息泄露`
        );
        localStorage.removeItem('ai-chat-history');
      }

      if (saved) {
        const parsed = JSON.parse(saved);
        setAiMessages(parsed);
        console.log(
          `[AI Chat] 加载用户 ${user.id} 的AI消息历史:`,
          parsed.length,
          '条'
        );
      } else {
        // 如果没有该用户的AI消息，添加欢迎消息
        const welcomeMessage: ChatMessage = {
          id: `ai-welcome-${Date.now()}`,
          chatId: 'ai-chat',
          content:
            '你好！我是你的项目 AI 助手，由 DeepSeek v3.2 驱动。\n\n我可以帮你：\n- 解释毕业设计项目结构\n- 梳理启动步骤和依赖\n- 生成汇报/PPT 说明\n- 协助排查报错和运行问题\n\n直接告诉我你想了解什么。',
          senderId: 'ai-assistant',
          createdAt: new Date().toISOString(),
          type: 'text',
          isRead: true,
          readAt: new Date().toISOString(),
        };
        setAiMessages([welcomeMessage]);
        console.log(`[AI Chat] 用户 ${user.id} 初始化AI聊天，添加欢迎消息`);
      }
    } catch (error) {
      console.error('Failed to load AI chat history:', error);
      setAiMessages([]);
    }
  }, [user?.id]);

  // 保存 AI 消息到 LocalStorage（按用户ID隔离）
  useEffect(() => {
    if (!user?.id) return;

    try {
      const userAiChatKey = `ai-chat-history-${user.id}`;
      localStorage.setItem(userAiChatKey, JSON.stringify(aiMessages));
      console.log(
        `[AI Chat] 保存用户 ${user.id} 的AI消息:`,
        aiMessages.length,
        '条'
      );
    } catch (error) {
      console.error('Failed to save AI chat history:', error);
    }
  }, [aiMessages, user?.id]);

  useEffect(() => {
    void loadFriends();
  }, [loadFriends]);

  // 组件加载时获取最新头像（仅在已登录时）
  useEffect(() => {
    if (user?.id) {
      void fetchLatestAvatar();
    }
  }, [fetchLatestAvatar, user?.id]);

  useEffect(() => {
    const trimmed = keyword.trim();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (!trimmed) {
      debounceRef.current = setTimeout(() => {
        clearSearchResults();
      }, 150);
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }

    debounceRef.current = setTimeout(() => {
      void searchUsers(trimmed);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [clearSearchResults, keyword, searchUsers]);

  const allFriends: FriendEntry[] = useMemo(() => {
    // 创建虚拟的 AI 助手项（置顶）
    const aiBot: FriendEntry = {
      id: 'ai-assistant',
      username: '项目助手 🤖',
      avatar: 'https://octodex.github.com/images/nyantocat.gif',
      chatId: 'ai-chat',
      unreadCount: 0,
      lastMessage: null,
      createdAt: '2025-01-01T00:00:00.000Z', // 固定日期避免 Hydration 错误
      isOnline: true, // AI 助手永久在线
      type: 'friend' as const,
    };

    // 将聊天数据中的未读数映射到好友数据
    const friendsWithUnread = friends.map(f => {
      // 查找对应的聊天室数据
      const chat = chats.find(
        (c: any) =>
          c.type === 'DIRECT' && c.members.some((m: any) => m.id === f.id)
      );

      const unreadCount = chat?.unreadCount || 0;

      return {
        ...f,
        unreadCount,
        type: 'friend' as const,
      };
    });

    // AI 助手始终显示在第一位
    return [aiBot, ...friendsWithUnread];
  }, [friends, chats]);

  const filteredFriends = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return allFriends;
    return allFriends.filter(friend =>
      friend.username.toLowerCase().includes(trimmed)
    );
  }, [allFriends, keyword]);

  const externalResults = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return [] as typeof searchResults;
    return (searchResults || []).filter(result => {
      if (result.status === 'friend') return false;
      return !allFriends.some(friend => friend.id === result.id);
    });
  }, [allFriends, keyword, searchResults]);

  const handleSendFriendRequest = useCallback(
    async (userId: string) => {
      try {
        await sendFriendRequest(userId);
        toast({
          title: '好友申请已发送',
          description: '等待对方通过申请',
        });
      } catch (error: any) {
        toast({
          title: '发送失败',
          description: error?.message || '请稍后重试',
          variant: 'destructive',
        });
      }
    },
    [sendFriendRequest, toast]
  );

  const selectedChatMessages: ChatMessage[] = useMemo(() => {
    if (!selectedChatId) return [];
    // AI 助手使用独立的本地消息数组
    if (selectedChatId === 'ai-chat') {
      return aiMessages;
    }
    return messages[selectedChatId] ?? [];
  }, [messages, selectedChatId, aiMessages]);

  const scrollToBottom = useCallback((smooth = true) => {
    const node = messagesEndRef.current;
    if (!node) return;
    try {
      node.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!selectedFriend) return;
    scrollToBottom();
  }, [selectedFriend, selectedChatMessages, scrollToBottom]);

  useEffect(() => {
    if (!selectedChatId) return;

    // AI 助手不需要 WebSocket 加入/离开
    if (selectedChatId === 'ai-chat') {
      setCurrentChat(selectedChatId);
      return;
    }

    if (!isConnected) {
      setCurrentChat(selectedChatId);
      return;
    }

    emit('join:chat', { chatId: selectedChatId });
    setCurrentChat(selectedChatId);

    return () => {
      emit('leave:chat', { chatId: selectedChatId });
      setCurrentChat(null);
    };
  }, [emit, isConnected, selectedChatId, setCurrentChat]);

  useEffect(() => {
    if (!selectedChatId) return;
    if (chatInitialLoaded.current.has(selectedChatId)) return;

    // AI 助手不需要加载消息历史
    if (selectedChatId === 'ai-chat') {
      chatInitialLoaded.current.add(selectedChatId);
      scrollToBottom(false);
      return;
    }

    chatInitialLoaded.current.add(selectedChatId);
    void loadMoreMessages(selectedChatId).then(() => {
      // 只有当用户主动选择聊天室时才标记已读，不要自动标记
      // void markRead(selectedChatId);
      scrollToBottom(false);
    });
  }, [loadMoreMessages, markRead, scrollToBottom, selectedChatId]);

  const handleSelectFriend = useCallback(
    async (friend: FriendEntry) => {
      setSelectedFriend(friend);
      setMessageInput('');

      // AI 助手使用虚拟 chatId，不需要创建真实聊天
      if (friend.id === 'ai-assistant') {
        setSelectedChatId('ai-chat');
        return;
      }

      // 如果好友已经有chatId，直接使用；否则创建新聊天室
      if (friend.chatId) {
        console.log('[handleSelectFriend] 使用已存在的聊天室:', friend.chatId);
        setSelectedChatId(friend.chatId);
        // 点击好友时自动标记该聊天室为已读
        void markRead(friend.chatId);
        return;
      }

      setCreatingChat(true);
      try {
        console.log('[handleSelectFriend] 创建新聊天室，好友ID:', friend.id);

        const res = await apiClient.post<{ chatId: string }>('/chats/direct', {
          userId: friend.id,
        });
        const chatId = res.data?.chatId;
        if (chatId) {
          setSelectedChatId(chatId);
          // 点击好友时自动标记该聊天室为已读
          void markRead(chatId);
        }
      } catch (error: any) {
        console.error('创建聊天失败:', error);
        toast({
          title: '创建聊天失败',
          description: error?.message ?? '请稍后重试',
          variant: 'destructive',
        });
      } finally {
        setCreatingChat(false);
      }
    },
    [toast, markRead]
  );

  // 自动选择第一个好友
  useEffect(() => {
    if (!selectedFriend && allFriends.length > 0) {
      const firstFriend = allFriends[0];
      if (firstFriend) {
        void handleSelectFriend(firstFriend);
      }
    }
  }, [allFriends, selectedFriend, handleSelectFriend]);

  const handleSendChatMessage = useCallback(async () => {
    if (!selectedChatId) return;
    const text = messageInput.trim();
    if (!text || sending) return;

    try {
      setSending(true);

      // 检查是否是 AI 助手
      if (selectedFriend?.id === 'ai-assistant') {
        // AI 对话完全在本地管理，不调用后端聊天 API
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          chatId: 'ai-chat',
          content: text,
          senderId: user?.id || '',
          createdAt: new Date().toISOString(),
          type: 'text',
          isRead: true,
          readAt: new Date().toISOString(),
        };

        // 添加用户消息到本地状态
        setAiMessages(prev => [...prev, userMessage]);
        setMessageInput('');
        scrollToBottom();

        // 添加"思考中"状态消息
        const thinkingMessage: ChatMessage = {
          id: `thinking-${Date.now()}`,
          chatId: 'ai-chat',
          content: '思考中...',
          senderId: 'ai-assistant',
          createdAt: new Date().toISOString(),
          type: 'text',
          isRead: true,
          readAt: new Date().toISOString(),
        };

        setAiMessages(prev => [...prev, thinkingMessage]);
        scrollToBottom();

        // 根据模式调整对话历史数量
        const historyCount = aiMode === 'thinking' ? 15 : 30; // 思考模式用15条，其他30条
        const conversationHistory = aiMessages
          .slice(-historyCount)
          .map(msg => ({
            role: msg.senderId === user?.id ? 'user' : 'assistant',
            content: msg.content,
          }));

        try {
          // 调用 AI API，传递当前模式
          const response = await apiClient.post<{
            reply: string;
            reasoning?: string;
            timestamp: string;
          }>('/ai/chat', {
            message: text,
            conversationHistory,
            mode: aiMode === 'explore' ? 'chat' : aiMode,
          });

          // 移除"思考中"消息，添加思考过程（如果有）和 AI 回复
          setAiMessages(prev => {
            const withoutThinking = prev.filter(
              msg => msg.id !== thinkingMessage.id
            );
            const newMessages: ChatMessage[] = [];

            // 如果有思考过程，先添加思考消息
            if (response.data.reasoning) {
              const reasoningMessage: ChatMessage = {
                id: `ai-reasoning-${Date.now()}`,
                chatId: 'ai-chat',
                content: response.data.reasoning,
                senderId: 'ai-assistant',
                createdAt: new Date().toISOString(),
                type: 'text',
                isRead: true,
                readAt: new Date().toISOString(),
              };
              newMessages.push(reasoningMessage);
            }

            // 添加最终回复
            const aiMessage: ChatMessage = {
              id: `ai-${Date.now()}`,
              chatId: 'ai-chat',
              content: response.data.reply || '抱歉，我暂时无法回答。',
              senderId: 'ai-assistant',
              createdAt: new Date().toISOString(),
              type: 'text',
              isRead: true,
              readAt: new Date().toISOString(),
            };
            newMessages.push(aiMessage);

            return [...withoutThinking, ...newMessages];
          });
          scrollToBottom();
        } catch (aiError) {
          console.error('AI response error:', aiError);

          // 移除"思考中"消息，添加错误消息
          setAiMessages(prev => {
            const withoutThinking = prev.filter(
              msg => msg.id !== thinkingMessage.id
            );
            const errorMessage: ChatMessage = {
              id: `ai-error-${Date.now()}`,
              chatId: 'ai-chat',
              content: '抱歉，我遇到了一些技术问题。请稍后再试。',
              senderId: 'ai-assistant',
              createdAt: new Date().toISOString(),
              type: 'text',
              isRead: true,
              readAt: new Date().toISOString(),
            };
            return [...withoutThinking, errorMessage];
          });
        }
      } else {
        // 发送给真实用户
        await sendMessage(selectedChatId, text);
        setMessageInput('');
        // 移除自动标记已读，让用户主动控制
        // void markRead(selectedChatId);
        scrollToBottom();
      }
    } catch (error: any) {
      toast({
        title: '消息发送失败',
        description: error?.message ?? '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  }, [
    aiMessages,
    aiMode,
    messageInput,
    scrollToBottom,
    selectedChatId,
    selectedFriend,
    sendMessage,
    sending,
    toast,
    user?.id,
  ]);

  const handleSend = useCallback(() => {
    if (!selectedFriend) return;
    void handleSendChatMessage();
  }, [handleSendChatMessage, selectedFriend]);

  const onTextareaKeyDown: React.KeyboardEventHandler<
    HTMLTextAreaElement
  > = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = useCallback(async () => {
    if (!selectedChatId) return;
    try {
      setClearing(true);

      // 检查是否是 AI 助手
      if (selectedChatId === 'ai-chat') {
        // 清除 AI 消息的本地存储，并添加欢迎消息
        const welcomeMessage: ChatMessage = {
          id: `ai-welcome-${Date.now()}`,
          chatId: 'ai-chat',
          content:
            '你好！我是你的项目 AI 助手，由 DeepSeek v3.2 驱动。\n\n我可以帮你：\n- 解释毕业设计项目结构\n- 梳理启动步骤和依赖\n- 生成汇报/PPT 说明\n- 协助排查报错和运行问题\n\n直接告诉我你想了解什么。',
          senderId: 'ai-assistant',
          createdAt: new Date().toISOString(),
          type: 'text',
          isRead: true,
          readAt: new Date().toISOString(),
        };
        setAiMessages([welcomeMessage]);

        const userAiChatKey = `ai-chat-history-${user?.id}`;
        localStorage.removeItem(userAiChatKey);

        toast({
          title: '清屏成功',
          description: 'AI 助手聊天记录已清除',
        });
      } else {
        // 调用 API 删除数据库中的消息
        await clearMessages(selectedChatId);

        toast({
          title: '清屏成功',
          description: '聊天记录已清除',
        });
      }
    } catch (error: any) {
      toast({
        title: '清屏失败',
        description: error?.message ?? '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setClearing(false);
      setClearConfirmOpen(false);
    }
  }, [selectedChatId, clearMessages, toast, user?.id]);

  const renderMessageBubble = (
    message: ChatMessage,
    isSelf: boolean,
    avatarUrl?: string | null
  ) => {
    const time =
      'createdAt' in message
        ? new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';
    const content = 'content' in message ? message.content : '';
    const isThinking = message.id.startsWith('thinking-');
    const isReasoning = message.id.startsWith('ai-reasoning-');

    // 检查是否是AI消息并包含电影推荐
    const isAiMessage = message.senderId === 'ai-assistant';

    return (
      <div
        className={cn(
          'flex gap-2 mb-4',
          isSelf ? 'justify-end' : 'justify-start'
        )}
      >
        {!isSelf && (
          <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="avatar"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-semibold">
                <Github className="h-5 w-5" />
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col max-w-[70%]">
          {isReasoning && (
            <div className="text-xs text-muted-foreground mb-1 px-2 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              思考过程
            </div>
          )}
          <div
            className={cn(
              'rounded-2xl px-4 py-2 text-lg relative',
              isSelf && 'ml-auto',
              isThinking &&
                'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700',
              isReasoning &&
                'bg-blue-50/80 dark:bg-blue-950/30 border-l-4 border-blue-500',
              !isThinking && !isReasoning && 'bg-muted'
            )}
          >
            <div
              className={cn(
                'whitespace-pre-wrap leading-relaxed',
                isThinking && 'flex items-center gap-2',
                isReasoning &&
                  'text-blue-900 dark:text-blue-100 italic text-sm opacity-80'
              )}
            >
              {isThinking ? (
                <>
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-slate-600 dark:text-slate-400">
                    思考中...
                  </span>
                </>
              ) : (
                content
              )}
            </div>
          </div>
        </div>
        {isSelf && (
          <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="me"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary text-sm font-semibold">
                {user?.username?.charAt(0).toUpperCase() ?? '我'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderConversation = () => {
    if (!selectedFriend) {
      return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          请选择左侧的好友开始聊天
        </div>
      );
    }

    const friendAvatar = selectedFriend.avatar ?? null;
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <div className="h-full w-full rounded-full overflow-hidden bg-muted">
                {friendAvatar ? (
                  <Image
                    src={friendAvatar}
                    alt={selectedFriend.username}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-semibold">
                    {selectedFriend.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {selectedFriend.isOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
              )}
            </div>
            <div>
              <div className="text-base font-semibold">
                {selectedFriend.username}
              </div>
              <div className="text-base text-muted-foreground">
                {selectedFriend.isOnline ? '在线' : '离线'}
              </div>
            </div>

            {/* AI 模式切换 - 仅 AI 助手显示 */}
            {selectedFriend?.id === 'ai-assistant' && (
              <div className="flex items-center gap-1.5 ml-4">
                <button
                  onClick={() => setAiMode('explore')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all shadow-sm ${
                    aiMode === 'explore'
                      ? 'bg-[#88C0D0] text-white shadow-[#88C0D0]/30'
                      : 'bg-[#3B4252] text-[#D8DEE9] hover:bg-[#434C5E] hover:shadow-md'
                  }`}
                >
                  探索
                </button>
                <button
                  onClick={() => setAiMode('thinking')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all shadow-sm ${
                    aiMode === 'thinking'
                      ? 'bg-[#B48EAD] text-white shadow-[#B48EAD]/30'
                      : 'bg-[#3B4252] text-[#D8DEE9] hover:bg-[#434C5E] hover:shadow-md'
                  }`}
                >
                  思考
                </button>
                <button
                  onClick={() => setAiMode('chat')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all shadow-sm ${
                    aiMode === 'chat'
                      ? 'bg-[#A3BE8C] text-white shadow-[#A3BE8C]/30'
                      : 'bg-[#3B4252] text-[#D8DEE9] hover:bg-[#434C5E] hover:shadow-md'
                  }`}
                >
                  聊天
                </button>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setClearConfirmOpen(true)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            清屏
          </Button>
        </div>

        <div
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto pr-2 py-4 scrollbar-hide"
        >
          {creatingChat && (
            <div className="flex justify-center">
              <div className="rounded-full bg-muted px-4 py-2 text-xs text-muted-foreground">
                正在创建会话...
              </div>
            </div>
          )}
          {selectedFriend?.id === 'ai-assistant' &&
          selectedChatMessages.length <= 1 ? (
            // AI助手的精美欢迎界面（消息为空或只有欢迎消息时显示）
            <AssistantWelcome />
          ) : selectedChatMessages.length === 0 && !creatingChat ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              还没有消息，发送第一条吧！
            </div>
          ) : (
            selectedChatMessages.map(message => {
              const isSelf = message.senderId === user?.id;
              return (
                <div key={message.id}>
                  {renderMessageBubble(
                    message,
                    isSelf,
                    isSelf ? currentAvatar : friendAvatar
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 功能按钮 - 仅AI助手显示 */}
        {selectedFriend?.id === 'ai-assistant' && (
          <div className="border-t pt-3 pb-2">
            {/* 功能快捷按钮 */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setMessageInput('请帮我梳理这个毕业设计项目的启动步骤');
                  setTimeout(() => void handleSendChatMessage(), 100);
                }}
                className="px-3 py-1.5 text-sm bg-muted hover:bg-accent rounded-full transition-colors"
              >
                ⭐ 启动步骤
              </button>
              <button
                onClick={() => {
                  setMessageInput('请帮我总结这个项目的技术栈和模块结构');
                  setTimeout(() => void handleSendChatMessage(), 100);
                }}
                className="px-3 py-1.5 text-sm bg-muted hover:bg-accent rounded-full transition-colors"
              >
                🧩 技术结构
              </button>
              <button
                onClick={() => {
                  setMessageInput('请帮我生成一段毕业答辩介绍文案');
                  setTimeout(() => void handleSendChatMessage(), 100);
                }}
                className="px-3 py-1.5 text-sm bg-muted hover:bg-accent rounded-full transition-colors"
              >
                📝 答辩文案
              </button>
            </div>
          </div>
        )}

        <div className="border-t pt-3">
          <div className="flex items-start gap-3">
            <textarea
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              onKeyDown={onTextareaKeyDown}
              rows={4}
              placeholder="输入消息，按 Enter 发送，Shift+Enter 换行"
              className="flex-1 resize-none rounded-md border bg-background px-3 py-3 text-lg"
              disabled={sending}
            />
            <Button
              onClick={handleSend}
              disabled={!messageInput.trim() || sending}
              size="lg"
              className="h-12 w-12 rounded-full p-0"
            >
              {sending ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <SendHorizonal className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            WebSocket 状态：{isConnected ? '已连接' : '未连接'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container-responsive flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">聊天室</span>
          </div>
          <div className="flex items-center gap-2">
            <FriendRequestsDrawer />
          </div>
        </div>
      </nav>

      <div className="flex-1 py-4">
        <div className="container-responsive max-w-6xl mx-auto h-[1200px] flex gap-6">
          <aside className="w-72 border border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl flex flex-col overflow-hidden text-foreground">
            <div className="px-4 py-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="搜索用户"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {friendsLoading || searchLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {friendsLoading ? '正在加载好友...' : '正在搜索...'}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 好友列表 */}
                  {filteredFriends.length > 0 && (
                    <div className="px-3 py-3">
                      <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
                        我的好友
                      </div>
                      <div className="space-y-1">
                        {filteredFriends.map(friend => {
                          const isSelected = selectedFriend?.id === friend.id;
                          const avatar = friend.avatar ?? null;
                          return (
                            <button
                              key={friend.id}
                              onClick={() => void handleSelectFriend(friend)}
                              className={cn(
                                'w-full h-16 rounded-xl px-3 py-2 transition-colors flex items-center gap-3 text-left',
                                isSelected
                                  ? 'bg-primary/10 text-primary-foreground'
                                  : 'hover:bg-muted/60'
                              )}
                            >
                              <div className="relative h-11 w-11 flex-shrink-0">
                                <div className="h-full w-full rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                                  {avatar ? (
                                    <Image
                                      src={avatar}
                                      alt={friend.username}
                                      width={44}
                                      height={44}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-base font-semibold">
                                      {friend.username.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                {friend.isOnline && (
                                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1 flex flex-col justify-between py-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium truncate text-card-foreground flex-1 pr-2">
                                    {friend.username}
                                  </span>
                                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    {friend.lastMessage?.createdAt && (
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(
                                          friend.lastMessage.createdAt
                                        ).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </span>
                                    )}
                                    {friend.unreadCount > 0 && (
                                      <span className="inline-flex h-3.5 min-w-[14px] px-1 items-center justify-center rounded-full bg-destructive text-[9px] font-medium text-destructive-foreground mt-0.5">
                                        {friend.unreadCount > 99
                                          ? '99+'
                                          : friend.unreadCount}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-base text-muted-foreground truncate leading-tight mt-0.5">
                                  {friend.lastMessage?.content ?? '暂无消息'}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 搜索到的外部用户 */}
                  {keyword.trim() && externalResults.length > 0 && (
                    <div className="px-3 py-3">
                      <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
                        搜索结果
                      </div>
                      <div className="space-y-1">
                        {externalResults.map(user => (
                          <div
                            key={user.id}
                            className="w-full rounded-xl px-3 py-2 border bg-card/50 flex items-center gap-3"
                          >
                            <div className="relative h-10 w-10 flex-shrink-0">
                              <div className="h-full w-full rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                                {user.avatar ? (
                                  <Image
                                    src={user.avatar}
                                    alt={user.username}
                                    width={40}
                                    height={40}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-semibold">
                                    {user.username.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-card-foreground">
                                {user.username}
                              </div>
                              {(user.status === 'pendingOutgoing' ||
                                user.status === 'pendingIncoming') && (
                                <div className="text-xs text-muted-foreground">
                                  {user.status === 'pendingOutgoing'
                                    ? '等待对方通过'
                                    : '请求通过你'}
                                </div>
                              )}
                            </div>
                            <div>
                              {user.status === 'none' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    void handleSendFriendRequest(user.id)
                                  }
                                  className="text-xs"
                                >
                                  添加好友
                                </Button>
                              )}
                              {user.status === 'pendingOutgoing' && (
                                <span className="text-xs text-muted-foreground">
                                  等待通过
                                </span>
                              )}
                              {user.status === 'pendingIncoming' && (
                                <span className="text-xs text-primary">
                                  待处理
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 无结果提示 */}
                  {!friendsLoading &&
                    !searchLoading &&
                    filteredFriends.length === 0 &&
                    (!keyword.trim() || externalResults.length === 0) && (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        {keyword.trim() ? '未找到匹配的用户' : '暂无好友'}
                      </div>
                    )}
                </div>
              )}
            </div>
          </aside>

          <main className="flex-1 bg-background">
            <div className="h-full flex flex-col rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/20">
                <h2 className="text-lg font-semibold">聊天</h2>
                <div className="flex items-center gap-2"></div>
              </div>
              <div className="flex-1 overflow-hidden rounded-b-2xl bg-card p-6">
                {renderConversation()}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* 清屏确认对话框 */}
      <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认清屏</DialogTitle>
            <DialogDescription>
              此操作将清除当前聊天中的所有消息记录（仅对你可见），对方不会受到影响，且无法恢复。确定要继续吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClearConfirmOpen(false)}
              disabled={clearing}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearChat}
              disabled={clearing}
            >
              {clearing ? '清除中...' : '确认清屏'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
