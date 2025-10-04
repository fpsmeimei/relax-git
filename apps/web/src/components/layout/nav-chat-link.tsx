'use client';

import { Button } from '@/components/ui/button';
import { useChatFriendsStore } from '@/stores/chat-friends-store';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export function NavChatLink() {
  const { unreadRequestCount, loadFriendRequests } = useChatFriendsStore();

  useEffect(() => {
    // 初始加载好友申请数量
    void loadFriendRequests('PENDING');
  }, [loadFriendRequests]);

  const displayCount = unreadRequestCount > 99 ? '99' : unreadRequestCount;

  return (
    <Link href="/chatroom">
      <Button variant="ghost" size="sm" className="relative">
        <div className="relative mr-2">
          <MessageSquare className="h-4 w-4" />
          {unreadRequestCount > 0 && (
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-primary-foreground">
              {displayCount}
            </span>
          )}
        </div>
        聊天室
      </Button>
    </Link>
  );
}
