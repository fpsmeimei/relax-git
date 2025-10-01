'use client';

import { useSocket } from '@/components/socket-provider';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useChatStore } from '@/stores/chat-store';
import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';

interface NavChatLinkProps {
  className?: string;
}

export function NavChatLink({ className }: NavChatLinkProps) {
  const { isConnected, emit, on } = useSocket();
  const { user, isAuthenticated } = useAuth();
  const { chats, loadChats, updateOnNewMessage } = useChatStore();

  // 初次加载会话列表（仅已登录时）
  useEffect(() => {
    if (isAuthenticated) {
      void loadChats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // 加入所有会话房间（用于全局未读与列表实时更新）
  const joinedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    try {
      const next = new Set<string>(chats.map(c => c.chatId));
      // 退出已不存在的房间
      for (const id of joinedRef.current) {
        if (!next.has(id)) {
          emit('leave:chat', { chatId: id });
          joinedRef.current.delete(id);
        }
      }
      // 加入新的房间
      for (const id of next) {
        if (!joinedRef.current.has(id)) {
          emit('join:chat', { chatId: id });
          joinedRef.current.add(id);
        }
      }
    } catch {
      // ignore
    }
  }, [chats, emit, isConnected]);

  // 监听新消息事件，实时更新未读与置顶
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

  // 计算未读总数
  const unreadTotal = useMemo(
    () => chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [chats]
  );

  return (
    <div className={cn('relative flex items-center', className)}>
      <Link
        href="/chat"
        className={cn(
          'relative text-sm text-muted-foreground hover:text-foreground hover:underline'
        )}
      >
        聊天
        {unreadTotal > 0 && (
          <span className="absolute -top-2 -right-3 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-medium text-destructive-foreground">
            {unreadTotal > 99 ? '99+' : unreadTotal}
          </span>
        )}
      </Link>
    </div>
  );
}
