'use client';

import { useSocket } from '@/components/socket-provider';
import { cn } from '@/lib/utils';
import { useAuth } from '@/stores/auth-store';
import { useChatStore } from '@/stores/chat-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';

interface NavMessagesLinkProps {
  className?: string;
}

export function NavMessagesLink({ className }: NavMessagesLinkProps) {
  const { isAuthenticated, user } = useAuth();
  const { unreadCount } = useNotificationsStore();
  const { chats, loadChats, updateOnNewMessage } = useChatStore();
  const { on } = useSocket();

  // 初次加载聊天会话（登录态）
  useEffect(() => {
    if (isAuthenticated) {
      void loadChats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

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

  // 合并未读：通知 + 聊天
  const chatUnread = useMemo(
    () => chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [chats]
  );
  const totalUnread = (unreadCount || 0) + (chatUnread || 0);

  return (
    <div className={cn('relative flex items-center', className)}>
      <Link
        href="/messages"
        className={cn(
          'relative text-sm text-muted-foreground hover:text-foreground hover:underline'
        )}
      >
        消息
        {totalUnread > 0 && (
          <span className="absolute -top-2 -right-3 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-medium text-white">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </Link>
    </div>
  );
}
