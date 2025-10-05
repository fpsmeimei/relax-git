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
    <Link href="/chatroom">
      <Button variant="ghost" size="sm" className="relative">
        <MessageSquare className="h-4 w-4 mr-2" />
        <span className="mr-1">聊天室</span>
        <div className="relative">
          {totalUnreadCount > 0 ? (
            <span className="inline-flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {displayCount}
            </span>
          ) : (
            <div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
          )}
        </div>
      </Button>
    </Link>
  );
}
