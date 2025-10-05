'use client';

import { useSocket } from '@/components/socket-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useChatSocket } from '@/hooks/use-chat-socket';
import { apiClient } from '@/services/apiClient';
import { useChatStore } from '@/stores/chat-store';
import { ArrowLeft, SendHorizonal, Check, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = String(params?.['id'] ?? '');
  const { isConnected, emit } = useSocket();

  // 启用聊天 WebSocket 监听
  useChatSocket();

  const {
    messages,
    nextCursor,
    loadMoreMessages,
    sendMessage,
    markRead,
    setCurrentChat,
  } = useChatStore();
  const { toast } = useToast();

  const list = messages[chatId] || [];
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  // 最小可用：邀请成员（仅群管理员接口可用，非管理员会被后端拒绝）
  const [inviteText, setInviteText] = useState('');
  const [inviting, setInviting] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // 加入房间；currentChatId 设置（依赖全局 NavChatLink 的 WS 监听做实时更新）
  useEffect(() => {
    if (!chatId) return;
    emit('join:chat', { chatId });
    setCurrentChat(chatId);
    return () => {
      setCurrentChat(null);
      emit('leave:chat', { chatId });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, isConnected]);

  // 初次加载历史消息
  useEffect(() => {
    if (!chatId || initialLoaded) return;
    setInitialLoaded(true);
    void loadMoreMessages(chatId).then(() => {
      // 滚动到底部
      setTimeout(() => scrollToBottomInstant(), 0);
      // 标记已读
      void markRead(chatId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, initialLoaded]);

  const canLoadMore = useMemo(
    () => (nextCursor[chatId] ?? null) !== null,
    [nextCursor, chatId]
  );

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    try {
      setSending(true);
      await sendMessage(chatId, text);
      setInput('');
      scrollToBottomSmooth();
      // 移除自动标记已读，让用户主动控制
      // void markRead(chatId);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      void handleSend();
    }
  };

  const scrollToBottomInstant = () => {
    try {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    } catch {}
  };
  const scrollToBottomSmooth = () => {
    try {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container-responsive flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/chat" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-xl font-bold">会话</span>
            </Link>
          </div>
          {/* 最小可用：邀请成员（输入逗号/空格分隔的用户ID），后端会校验管理员权限 */}
          <div className="hidden lg:flex items-center gap-2">
            <Input
              placeholder="邀请成员（输入用户ID，逗号/空格分隔）"
              value={inviteText}
              onChange={e => setInviteText(e.target.value)}
              className="w-64 h-8"
            />
            <Button
              size="sm"
              variant="outline-subtle"
              disabled={inviting || !inviteText.trim()}
              onClick={async () => {
                const ids = inviteText
                  .split(/[,\s]+/)
                  .map(s => s.trim())
                  .filter(Boolean);
                if (ids.length === 0) return;
                try {
                  setInviting(true);
                  await apiClient.post(`/chats/${chatId}/members`, {
                    memberIds: ids,
                  });
                  setInviteText('');
                  toast({
                    title: '已发出邀请',
                    description: `成员数：${ids.length}`,
                  });
                } catch (e: any) {
                  toast({
                    title: '邀请失败',
                    description: e?.message || '仅群管理员可操作',
                    variant: 'destructive',
                  });
                } finally {
                  setInviting(false);
                }
              }}
            >
              邀请成员
            </Button>
          </div>
        </div>
      </nav>

      <main className="container-responsive flex-1 py-4">
        <div className="card h-[72vh] flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div className="text-sm font-medium">聊天详情</div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void markRead(chatId)}
            >
              全部已读
            </Button>
          </div>

          <div
            ref={scrollerRef}
            className="flex-1 overflow-auto px-4 py-3 space-y-3"
          >
            {canLoadMore && (
              <div className="flex justify-center">
                <Button
                  size="sm"
                  variant="outline-subtle"
                  onClick={() => void loadMoreMessages(chatId)}
                >
                  加载更多
                </Button>
              </div>
            )}

            {list.map(m => {
              const isSystem = m.type === 'SYSTEM';
              const showReadStatus = m.senderId && !isSystem;

              return (
                <div key={m.id} className="flex flex-col space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {new Date(m.createdAt).toLocaleString('zh-CN')}
                  </div>
                  <div
                    className={`inline-block max-w-[80%] rounded-md px-3 py-2 text-sm ${
                      isSystem
                        ? 'bg-muted/50 text-muted-foreground italic text-center'
                        : 'bg-accent'
                    }`}
                  >
                    {m.content}
                  </div>
                  {showReadStatus && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                      {m.isRead ? (
                        <>
                          <CheckCheck className="h-3 w-3" />
                          已读
                          {m.readAt && (
                            <span className="ml-1">
                              {new Date(m.readAt).toLocaleString('zh-CN')}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <Check className="h-3 w-3" />
                          未读
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="border-t p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="输入消息，Ctrl/⌘+Enter 发送"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button
                onClick={() => void handleSend()}
                disabled={sending || !input.trim()}
                size="sm"
              >
                {sending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <SendHorizonal className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              WebSocket: {isConnected ? '已连接' : '未连接'} • 会话ID: {chatId}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
