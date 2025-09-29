'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/services/apiClient';
import { useChatStore } from '@/stores/chat-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

// ---- 通知类型 ----
interface NotificationDto {
  id: string;
  type: 'COMMENT_REPLY';
  commentId: string;
  parentId?: string | null;
  snapshotId?: string | null;
  content?: string | null;
  actor?: { id: string; username: string; avatar?: string };
  createdAt: string;
  comment?: {
    id: string;
    snapshotId: string;
    commitSha?: string | null;
    filePath?: string | null;
    lineStart?: number | null;
    lineEnd?: number | null;
  };
}
interface NotificationListResp {
  items: NotificationDto[];
  total: number;
  page: number;
  limit: number;
}

// ---- 页面 ----
export default function MessagesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'notifications' | 'chat'>('notifications');

  // 通知数据
  const { unreadCount, setUnreadCount, incrementUnread } =
    useNotificationsStore();
  const [notiData, setNotiData] = useState<NotificationListResp>({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
  });
  const [loadingNoti, setLoadingNoti] = useState(false);

  // 聊天数据
  const { chats, loadChats, loadingChats, markRead, setCurrentChat } =
    useChatStore();
  const [creating, setCreating] = useState(false);
  const [directUserId, setDirectUserId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupMemberIds, setGroupMemberIds] = useState('');

  useEffect(() => {
    void reloadNotifications(1);
    void loadChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildAnchorHash = (
    fp?: string | null,
    ls?: number | null,
    le?: number | null
  ) => {
    try {
      if (!fp) return '';
      const s =
        typeof ls === 'number'
          ? typeof le === 'number'
            ? `${ls}-${le}`
            : `${ls}`
          : '';
      const payload = s ? `${fp}:${s}` : `${fp}`;
      return `#code=${encodeURIComponent(payload)}`;
    } catch {
      return '';
    }
  };

  const reloadNotifications = async (page = 1) => {
    try {
      setLoadingNoti(true);
      const res = await apiClient.get<NotificationListResp>('/notifications', {
        params: { page, limit: 20 },
      });
      setNotiData(res.data);
    } finally {
      setLoadingNoti(false);
    }
  };

  const markAllRead = async () => {
    await apiClient.patch('/notifications/read-all');
    setUnreadCount(0);
    await reloadNotifications(notiData.page);
  };

  const markOneRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      // 成功后本地未读数-1（最小为0），并刷新列表
      incrementUnread(-1);
      await reloadNotifications(notiData.page);
    } catch {}
  };

  const openNotification = async (n: NotificationDto) => {
    try {
      await markOneRead(n.id);
      const hash = buildAnchorHash(
        n.comment?.filePath,
        n.comment?.lineStart,
        n.comment?.lineEnd
      );
      const href = n.snapshotId
        ? `/snapshots/${n.snapshotId}${hash}`
        : undefined;
      if (href) router.push(href);
    } catch {}
  };

  // 聊天创建
  const handleCreateDirect = async () => {
    const uid = directUserId.trim();
    if (!uid) return;
    try {
      setCreating(true);
      const { data } = await apiClient.post<{ id: string }>(`/chats/direct`, {
        userId: uid,
      });
      router.push(`/chat/${(data as any)?.id ?? ''}`);
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
      router.push(`/chat/${(data as any)?.id ?? ''}`);
    } finally {
      setCreating(false);
    }
  };

  const chatUnread = useMemo(
    () => chats.reduce((s, c) => s + (c.unreadCount || 0), 0),
    [chats]
  );

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container-responsive flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold">消息</span>
            <span className="text-sm text-muted-foreground">
              未读：通知 {unreadCount} · 聊天 {chatUnread}
            </span>
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
        <div className="flex items-center gap-3 mb-4">
          <Button
            size="sm"
            variant={tab === 'notifications' ? 'default' : 'outline-subtle'}
            onClick={() => setTab('notifications')}
          >
            通知
          </Button>
          <Button
            size="sm"
            variant={tab === 'chat' ? 'default' : 'outline-subtle'}
            onClick={() => setTab('chat')}
          >
            聊天
          </Button>
        </div>

        {tab === 'notifications' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                未读：{unreadCount} 条
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline-subtle"
                  onClick={() => void reloadNotifications(notiData.page)}
                  disabled={loadingNoti}
                >
                  刷新
                </Button>
                <Button
                  size="sm"
                  onClick={() => void markAllRead()}
                  disabled={loadingNoti || unreadCount === 0}
                >
                  全部标为已读
                </Button>
              </div>
            </div>
            {loadingNoti ? (
              <div className="text-sm text-muted-foreground">加载中…</div>
            ) : notiData.items.length === 0 ? (
              <div className="empty-state">
                <h3 className="empty-state-title">暂无通知</h3>
                <p className="empty-state-desc">
                  收到评论回复等事件会显示在这里
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {notiData.items.map(n => {
                  const hash = buildAnchorHash(
                    n.comment?.filePath,
                    n.comment?.lineStart,
                    n.comment?.lineEnd
                  );
                  const href = (n as any).repoId
                    ? `/repositories/${(n as any).repoId}?tab=branches`
                    : undefined;
                  return (
                    <li
                      key={n.id}
                      className="border rounded p-3 flex items-start justify-between gap-3 hover-lift cursor-pointer"
                      onClick={() => void openNotification(n)}
                      role="button"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium">
                          {n.actor?.username ?? '有人'}
                        </div>
                        <div className="text-sm text-foreground break-words">
                          {n.content ?? '有新的回复'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {href ? (
                          <Link
                            href={href}
                            className="text-sm text-primary smooth-underline"
                            onClick={e => {
                              e.stopPropagation();
                              void markOneRead(n.id);
                            }}
                          >
                            查看
                          </Link>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
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
                  <div className="p-4 text-sm text-muted-foreground">
                    加载中…
                  </div>
                ) : chats.length === 0 ? (
                  <div className="empty-state">
                    <h3 className="empty-state-title">暂无会话</h3>
                    <p className="empty-state-desc">
                      先新建一个私聊或群聊开始沟通吧
                    </p>
                  </div>
                ) : (
                  chats.map(c => (
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
        )}
      </main>
    </div>
  );
}
