'use client';

import { Button } from '@/components/ui/button';
import { useChatStore } from '@/stores/chat-store';
import { useAuth } from '@/hooks/use-auth';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';

export function NavChatLink() {
  const { chats, loadChats } = useChatStore();
  const { isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    // 初始加载聊天列表（仅在已登录且初始化完成时）
    if (!isInitialized || !isAuthenticated) return;
    void loadChats();
  }, [loadChats, isAuthenticated, isInitialized]);

  // 计算总未读消息数量
  const totalUnreadCount = useMemo(() => {
    return chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
  }, [chats]);

  const displayCount = totalUnreadCount > 99 ? '99' : totalUnreadCount;

  return (
    <Link href="/chatroom" className="relative">
      <div className="flex items-center text-base font-medium text-muted-foreground hover:text-foreground rounded-full px-5 py-2 transition-colors duration-200 hover:bg-accent">
        <MessageSquare className="h-5 w-5 mr-2" />
        <span className="mr-2">聊天室</span>
        {totalUnreadCount > 0 && (
          <span className="inline-flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
            {displayCount}
          </span>
        )}
      </div>
    </Link>
  );
}
