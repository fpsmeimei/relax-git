'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/services/apiClient';
import { useChatStore } from '@/stores/chat-store';
import type { ChatSummary } from '@/types/chat';
import { Loader2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ChatListPage() {
  const { chats, loadChats, loadingChats, markRead, setCurrentChat } =
    useChatStore();
  const [directUserId, setDirectUserId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupMemberIds, setGroupMemberIds] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void loadChats();
  }, [loadChats]);

  const handleCreateDirect = async () => {
    const uid = directUserId.trim();
    if (!uid) return;
    try {
      setCreating(true);
      const { data } = await apiClient.post<{ id: string }>(`/chats/direct`, {
        userId: uid,
      });
      // 跳转到会话
      if (typeof window !== 'undefined') {
        window.location.href = `/chat/${(data as any)?.id ?? ''}`;
      }
    } catch (e) {
      // ignore: 错误提示由 apiClient 统一处理
    } finally {
      setCreating(false);
    }
  };

  const handleCreateGroup = async () => {
    const name = groupName.trim();
    if (!name) return;
    try {
      setCreating(true);
      const members = groupMemberIds
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const { data } = await apiClient.post<{ id: string }>(`/chats/group`, {
        name,
        memberIds: members,
      });
      if (typeof window !== 'undefined') {
        window.location.href = `/chat/${(data as any)?.id ?? ''}`;
      }
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container-responsive flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">消息</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              className="text-sm text-muted-foreground smooth-underline"
              href="/repositories"
            >
              返回仓库
            </Link>
          </div>
        </div>
      </nav>

      <main className="container-responsive py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">新建会话</h2>
            <div className="card p-4 space-y-3 hover-lift">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="对方用户ID（私聊）"
                  value={directUserId}
                  onChange={e => setDirectUserId(e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={() => void handleCreateDirect()}
                  disabled={creating}
                >
                  {creating && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  创建私聊
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="群聊名称"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline-subtle"
                    onClick={() => void handleCreateGroup()}
                    disabled={creating}
                  >
                    {creating && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    创建群聊
                  </Button>
                </div>
                <Input
                  placeholder="群成员用户ID，逗号分隔（可选）"
                  value={groupMemberIds}
                  onChange={e => setGroupMemberIds(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">会话列表</h2>
            <div className="card p-0 divide-y">
              {loadingChats ? (
                <div className="p-4 text-sm text-muted-foreground">加载中…</div>
              ) : chats.length === 0 ? (
                <div className="empty-state">
                  <h3 className="empty-state-title">暂无会话</h3>
                  <p className="empty-state-desc">
                    先新建一个私聊或群聊开始沟通吧
                  </p>
                </div>
              ) : (
                chats.map((c: ChatSummary) => (
                  <Link
                    key={c.chatId}
                    href={`/chat/${c.chatId}`}
                    className="flex items-center justify-between px-4 py-3 hover-lift"
                    onClick={() => {
                      setCurrentChat(c.chatId);
                      void markRead(c.chatId);
                    }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium truncate max-w-[380px]">
                          {c.type === 'GROUP'
                            ? c.name || '群聊'
                            : c.members[0]?.username || '私聊'}
                        </div>
                        {c.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center rounded-full bg-destructive px-1 min-w-[20px] h-5 text-[11px] text-destructive-foreground">
                            {c.unreadCount > 99 ? '99+' : c.unreadCount}
                          </span>
                        )}
                      </div>
                      {c.lastMessage && (
                        <div className="text-xs text-muted-foreground truncate max-w-[420px]">
                          {c.lastMessage.content}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(c.updatedAt).toLocaleString('zh-CN')}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
