'use client';

import { FriendRequestsDrawer } from '@/components/chat/friend-requests-drawer';
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

  const chatInitialLoaded = useRef(new Set<string>());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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
    return friends.map(f => ({
      ...f,
      type: 'friend' as const,
    }));
  }, [friends]);

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
    return messages[selectedChatId] ?? [];
  }, [messages, selectedChatId]);

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
    chatInitialLoaded.current.add(selectedChatId);
    void loadMoreMessages(selectedChatId).then(() => {
      void markRead(selectedChatId);
      scrollToBottom(false);
    });
  }, [loadMoreMessages, markRead, scrollToBottom, selectedChatId]);

  const handleSelectFriend = useCallback(
    async (friend: FriendEntry) => {
      setSelectedFriend(friend);
      setMessageInput('');

      if (friend.chatId) {
        setSelectedChatId(friend.chatId);
        return;
      }

      try {
        setCreatingChat(true);
        const { data } = await apiClient.post<{ id: string }>('/chats/direct', {
          userId: friend.id,
        });
        const newChatId = (data as any)?.id as string;
        await loadFriends();
        setSelectedChatId(newChatId);
      } catch (error) {
        toast({
          title: '创建聊天失败',
          description: '请稍后重试',
          variant: 'destructive',
        });
      } finally {
        setCreatingChat(false);
      }
    },
    [loadFriends, toast]
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
      await sendMessage(selectedChatId, text);
      setMessageInput('');
      void markRead(selectedChatId);
      scrollToBottom();
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
    markRead,
    messageInput,
    scrollToBottom,
    selectedChatId,
    sendMessage,
    sending,
    toast,
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
      // 调用 API 删除数据库中的消息
      await clearMessages(selectedChatId);

      toast({
        title: '清屏成功',
        description: '聊天记录已清除',
      });
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
  }, [selectedChatId, clearMessages, toast]);

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
          <div
            className={cn(
              'rounded-2xl px-4 py-2 text-sm relative bg-muted',
              isSelf && 'ml-auto'
            )}
          >
            <div className="whitespace-pre-wrap leading-relaxed">{content}</div>
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
              <div className="text-xs text-muted-foreground">
                {selectedFriend.isOnline ? '在线' : '离线'}
              </div>
            </div>
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
          {selectedChatMessages.length === 0 && !creatingChat ? (
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

        <div className="border-t pt-3">
          <div className="flex items-start gap-3">
            <textarea
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              onKeyDown={onTextareaKeyDown}
              rows={4}
              placeholder="输入消息，按 Enter 发送，Shift+Enter 换行"
              className="flex-1 resize-none rounded-md border bg-background px-3 py-3 text-sm"
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
        <div className="container-responsive max-w-6xl mx-auto h-[calc(100vh-10rem)] flex gap-6">
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
                                'w-full rounded-xl px-3 py-2 transition-colors flex items-center gap-3 text-left',
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
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium truncate text-card-foreground">
                                    {friend.username}
                                  </span>
                                  {friend.lastMessage?.createdAt && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {new Date(
                                        friend.lastMessage.createdAt
                                      ).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground truncate">
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
