'use client';

import { useSocket } from '@/components/socket-provider';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useChatStore } from '@/stores/chat-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';

interface NavMessagesLinkProps {
  className?: string;
}

export function NavMessagesLink({ className }: NavMessagesLinkProps) {
  const { isAuthenticated, user, isInitialized } = useAuth();
  const { unreadCount } = useNotificationsStore();
  const { chats, loadChats, updateOnNewMessage } = useChatStore();
  const { on } = useSocket();

  // 初次加载聊天会话（登录态且已初始化）
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      void loadChats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isInitialized]);

  // 监听新消息事件，保持未读数实时
  useEffect(() => {
    const off = on('chat:message:new', (msg: any) => {
      try {
        if (!msg?.chatId) return;
        const isSelf = user?.id && String(msg.senderId) === String(user.id);
        updateOnNewMessage(
          {
            id: String(msg.id),
            chatId: String(msg.chatId),
            senderId: String(msg.senderId),
            content: String(msg.content ?? ''),
            createdAt: String(msg.createdAt ?? new Date().toISOString()),
          },
          !!isSelf
        );
      } catch {
        // ignore
      }
    });
    return () => off?.();
  }, [on, updateOnNewMessage, user?.id]);

  // 合并未读：通知 + 聊天（hooks 必须在条件语句之前）
  const chatUnread = useMemo(
    () => chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [chats]
  );
  const totalUnread = (unreadCount || 0) + (chatUnread || 0);

  // 未登录时不显示消息链接
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={cn('relative flex items-center', className)}>
      <Link
        href="/messages"
        className={cn(
          'relative rounded-full px-3 py-1 text-sm text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground'
        )}
      >
        消息
        {totalUnread > 0 && (
          <span className="absolute -top-2 -right-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-medium text-white">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </Link>
    </div>
  );
}
