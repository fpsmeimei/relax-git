'use client';

import { Button } from '@/components/ui/button';
import { useChatFriendsStore } from '@/stores/chat-friends-store';
import { MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export function NavChatLink() {
  const { unreadRequestCount, loadFriendRequests } = useChatFriendsStore();

  useEffect(() => {
    // 初始加载好友申请数量
    void loadFriendRequests('PENDING');
  }, [loadFriendRequests]);

  return (
    <Link href="/chatroom">
      <Button variant="ghost" size="sm" className="relative">
        <MessageSquarePlus className="h-4 w-4 mr-2" />
        聊天室
        {unreadRequestCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium">
            {unreadRequestCount > 99 ? '99+' : unreadRequestCount}
          </span>
        )}
      </Button>
    </Link>
  );
}
