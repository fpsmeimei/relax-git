'use client';

import { buildMessageThreadHref } from '@/lib/messages-route';
import { Button } from '@/components/ui/button';
import { useContactsStore } from '@/stores/contacts-store';
import { Loader2, MessageCircle, UserMinus, Github } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function FriendsList() {
  const { friends, friendsLoading, loadFriends, removeFriend } =
    useContactsStore();
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    void loadFriends();
  }, [loadFriends]);

  const handleRemove = async (friendId: string) => {
    if (!confirm('确定要删除这位好友吗？')) return;

    setRemovingId(friendId);
    try {
      await removeFriend(friendId);
    } finally {
      setRemovingId(null);
    }
  };

  if (friendsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 内置的 relax-git 机器人用户
  const relaxGitBot = {
    id: 'relax-git-bot',
    username: 'relax-git',
    isOnline: true,
    unreadCount: 0,
    lastMessage: {
      type: 'SYSTEM' as const,
      content: '欢迎使用 Relax-Git 消息中心！',
    },
    chatId: null,
  };

  // 合并机器人和真实好友
  const allFriends = [relaxGitBot, ...friends];

  return (
    <div className="space-y-2">
      {allFriends.map(friend => {
        const isRemoving = removingId === friend.id;

        return (
          <div
            key={friend.id}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
          >
            <div className="relative flex-shrink-0">
              {friend.id === 'relax-git-bot' ? (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                  <Github className="h-6 w-6" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {friend.username.charAt(0).toUpperCase()}
                </div>
              )}
              {/* 在线状态指示器 - 右下角绿色小球 */}
              {friend.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="font-medium truncate">{friend.username}</div>
                {friend.unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full bg-destructive px-1.5 min-w-[20px] h-5 text-[10px] text-destructive-foreground font-medium">
                    {friend.unreadCount > 99 ? '99+' : friend.unreadCount}
                  </span>
                )}
              </div>
              {friend.lastMessage && (
                <div className="text-xs text-muted-foreground truncate max-w-[300px] mt-0.5">
                  {friend.lastMessage.type === 'SYSTEM' ? (
                    <span className="italic">{friend.lastMessage.content}</span>
                  ) : (
                    friend.lastMessage.content
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {friend.id === 'relax-git-bot' ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    // 与仓库助手对话
                    window.location.href = `/messages?assistant=repo`;
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              ) : (
                <>
                  {friend.chatId ? (
                    <Link href={buildMessageThreadHref(friend.chatId)}>
                      <Button size="sm" variant="ghost">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        // 创建私聊会话
                        window.location.href = `/messages?createDirect=${friend.id}`;
                      }}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void handleRemove(friend.id)}
                    disabled={isRemoving}
                  >
                    {isRemoving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserMinus className="h-4 w-4" />
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
