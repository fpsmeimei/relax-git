'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import { Bell, MessageCircle, Reply, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NotificationDto {
  id: string;
  type: 'COMMENT_REPLY';
  commentId: string;
  parentId?: string | null;
  snapshotId?: string | null;
  content?: string | null; // 格式："{actor}: {snippet}"
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

interface CommentAuthorDto {
  id: string;
  username: string;
  avatar?: string;
}
interface CommentRespDto {
  id: string;
  snapshotId: string;
  content: string;
  anchorType: 'SNAPSHOT' | 'COMMIT' | 'FILE' | 'LINE';
  commitSha?: string | null;
  filePath?: string | null;
  lineStart?: number | null;
  lineEnd?: number | null;
  createdAt: string;
  author?: CommentAuthorDto;
}

export default function MePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<'notifications' | 'my-comments' | 'overview'>(
    'overview'
  );

  const [notiData, setNotiData] = useState<NotificationListResp>({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
  });
  const [loadingNoti, setLoadingNoti] = useState(false);
  const { unreadCount, setUnreadCount } = useNotificationsStore();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const [myComments, setMyComments] = useState<CommentRespDto[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    void reloadNotifications(1);
    void reloadMyComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

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
    } catch {
      // ignore
    } finally {
      setLoadingNoti(false);
    }
  };

  const reloadMyComments = async () => {
    if (!user?.id) return;
    try {
      setLoadingComments(true);
      const res = await apiClient.get<{
        items: CommentRespDto[];
        total: number;
        page: number;
        limit: number;
      }>('/comments/me/comments' as any);
      const items = (res.data as any)?.items ?? [];
      // 时间正序展示
      const sorted = items
        .slice()
        .sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      setMyComments(sorted);
    } catch {
      // ignore
    } finally {
      setLoadingComments(false);
    }
  };

  const markAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setUnreadCount(0);
      await reloadNotifications(notiData.page);
    } catch {
      // ignore
    }
  };

  // 单条标为已读（乐观更新）
  const markOneRead = async (id: string) => {
    try {
      if (readIds.has(id)) return;
      setReadIds(prev => new Set(prev).add(id));
      setUnreadCount(Math.max(0, (unreadCount || 0) - 1));
      await apiClient.patch(`/notifications/${id}/read`);
    } catch {
      // 忽略失败（不回滚），刷新列表时会以服务端为准
    }
  };

  // 点击通知：标记已读并跳转（若可跳）
  const handleOpenNotification = async (n: NotificationDto) => {
    try {
      await markOneRead(n.id);
      const hash = buildAnchorHash(
        n.comment?.filePath,
        n.comment?.lineStart,
        n.comment?.lineEnd
      );
      const href = (n as any).repoId
        ? `/repositories/${(n as any).repoId}?tab=branches`
        : undefined;
      if (href) {
        router.push(href);
      } else {
        toast({
          title: '已标为已读',
          description: '该通知缺少定位信息，无法跳转',
          variant: 'default',
        } as any);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">个人中心</h1>

      <div className="flex items-center gap-2 mb-6">
        <Button
          variant={tab === 'overview' ? 'soft' : 'outline-subtle'}
          size="sm"
          onClick={() => setTab('overview')}
        >
          概览
        </Button>
        <Button
          variant={tab === 'notifications' ? 'soft' : 'outline-subtle'}
          size="sm"
          onClick={() => setTab('notifications')}
        >
          通知
        </Button>
        <Button
          variant={tab === 'my-comments' ? 'soft' : 'outline-subtle'}
          size="sm"
          onClick={() => setTab('my-comments')}
        >
          我的评论
        </Button>
      </div>

      {tab === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 通知概览 */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">通知</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadCount}</div>
              <p className="text-xs text-muted-foreground">未读通知</p>
              <Button asChild className="w-full mt-4" variant="outline-subtle">
                <Link
                  href="/me?tab=notifications"
                  onClick={() => setTab('notifications')}
                >
                  查看全部
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* 我的回复 */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">我的回复</CardTitle>
              <Reply className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">回复他人的评论</p>
              <Button asChild className="w-full mt-4" variant="outline-subtle">
                <Link href="/me/replies">查看全部</Link>
              </Button>
            </CardContent>
          </Card>

          {/* 我的评论 */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">我的评论</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myComments.length}</div>
              <p className="text-xs text-muted-foreground">发表的评论</p>
              <Button asChild className="w-full mt-4" variant="outline-subtle">
                <Link href="/me/comments">查看全部</Link>
              </Button>
            </CardContent>
          </Card>

          {/* 个人设置 */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">个人设置</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                管理头像、用户名等个人信息
              </div>
              <Button asChild className="w-full" variant="outline-subtle">
                <Link href="/me/settings">前往设置</Link>
              </Button>
            </CardContent>
          </Card>

          {/* 用户信息卡片 */}
          <Card className="md:col-span-2 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                用户信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">用户名:</span>
                  <span className="text-sm font-medium">
                    {user?.username || '未设置'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">邮箱:</span>
                  <span className="text-sm font-medium">
                    {user?.email || '未设置'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">用户ID:</span>
                  <span className="text-sm font-mono">
                    {user?.id || '未知'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : tab === 'notifications' ? (
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
            <div className="text-sm text-muted-foreground">暂无通知</div>
          ) : (
            <ul className="space-y-2">
              {notiData.items.map(n => {
                const hash = buildAnchorHash(
                  n.comment?.filePath,
                  n.comment?.lineStart,
                  n.comment?.lineEnd
                );
                const href = n.snapshotId
                  ? `/snapshots/${n.snapshotId}${hash}`
                  : undefined;
                return (
                  <li
                    key={n.id}
                    className="border rounded p-3 flex items-start justify-between gap-3 hover:bg-muted/30 cursor-pointer"
                    onClick={() => void handleOpenNotification(n)}
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              共 {myComments.length} 条
            </div>
            <Button
              size="sm"
              variant="outline-subtle"
              onClick={() => void reloadMyComments()}
              disabled={loadingComments}
            >
              刷新
            </Button>
          </div>

          {loadingComments ? (
            <div className="text-sm text-muted-foreground">加载中…</div>
          ) : myComments.length === 0 ? (
            <div className="text-sm text-muted-foreground">暂无评论</div>
          ) : (
            <ul className="space-y-2">
              {myComments.map(c => {
                const hash = buildAnchorHash(
                  c.filePath,
                  c.lineStart,
                  c.lineEnd
                );
                const href = (c as any).repoId
                  ? `/repositories/${(c as any).repoId}?tab=branches`
                  : undefined;
                return (
                  <li
                    key={c.id}
                    className="border rounded p-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm text-foreground break-words">
                        {c.content}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(c.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {href ? (
                        <Link
                          href={href}
                          className="text-sm text-primary smooth-underline"
                        >
                          查看
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          该评论缺少定位信息，无法跳转
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
