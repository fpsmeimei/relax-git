'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import {
  Bell,
  MessageCircle,
  Settings,
  User,
  UserCheck,
  UserX,
  Sparkles,
} from 'lucide-react';
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
  const [myCommentsTotal, setMyCommentsTotal] = useState(0);
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
      const total = (res.data as any)?.total ?? 0;
      // 时间正序展示
      const sorted = items
        .slice()
        .sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      setMyComments(sorted);
      setMyCommentsTotal(total);
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
      </div>

      {tab === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 通知概览 */}
          <Card className="hover:shadow-md transition-shadow h-[220px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">通知</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="text-2xl font-bold">{unreadCount}</div>
              <p className="text-xs text-muted-foreground">未读通知</p>
              <Button
                asChild
                className="w-full mt-auto"
                variant="outline-subtle"
              >
                <Link
                  href="/me?tab=notifications"
                  onClick={() => setTab('notifications')}
                >
                  查看全部
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* 我的评论 - 注意：/me/comments 才是目前主要使用的页面 */}
          <Card className="hover:shadow-md transition-shadow h-[220px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">我的评论</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="text-2xl font-bold">{myCommentsTotal}</div>
              <p className="text-xs text-muted-foreground">发表的评论</p>
              <Button
                asChild
                className="w-full mt-auto"
                variant="outline-subtle"
              >
                <Link href="/me/comments">查看全部</Link>
              </Button>
            </CardContent>
          </Card>

          {/* 个人设置 */}
          <Card className="hover:shadow-md transition-shadow h-[220px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">个人设置</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="text-sm text-muted-foreground">
                管理头像、用户名等个人信息
              </div>
              <Button
                asChild
                className="w-full mt-auto"
                variant="outline-subtle"
              >
                <Link href="/me/settings">前往设置</Link>
              </Button>
            </CardContent>
          </Card>

          {/* 用户信息卡片 */}
          <Card className="hover:shadow-md transition-shadow h-[220px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                用户信息
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="space-y-2 flex-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">用户名:</span>
                  <span className="text-sm font-medium">
                    {user?.username || '未设置'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">用户ID:</span>
                  <span className="text-sm font-medium">
                    {user?.uid || '未设置'}
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
            <ul className="space-y-3">
              {notiData.items.map(n => {
                // 构建跳转链接（参考 /me/comments 页面的实现）
                const href = (() => {
                  if (!n.snapshotId || !n.commentId) return undefined;

                  // 如果有文件路径和行号，构建完整的查询参数
                  if (n.comment?.filePath) {
                    const params = new URLSearchParams();
                    params.set('file', n.comment.filePath);

                    if (n.comment.lineStart) {
                      params.set('line', String(n.comment.lineStart));
                    }

                    // 使用评论ID而不是通知ID
                    params.set('commentId', n.commentId);

                    return `/snapshots/${n.snapshotId}?${params.toString()}`;
                  }

                  // 如果只有评论ID，直接定位到评论
                  return `/snapshots/${n.snapshotId}?commentId=${n.commentId}`;
                })();

                const getNotificationIcon = () => {
                  if (n.type === 'COMMENT_REPLY')
                    return <MessageCircle className="h-3.5 w-3.5" />;
                  return <Bell className="h-3.5 w-3.5" />;
                };

                const getNotificationColor = () => {
                  if (n.type === 'COMMENT_REPLY')
                    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
                  return 'bg-primary/10 text-primary';
                };

                return (
                  <li
                    key={n.id}
                    className="group relative border border-border rounded-lg p-4 flex items-start gap-4 hover:bg-accent/20 hover:border-accent/50 hover:shadow-sm transition-all duration-200"
                  >
                    {/* 头像区域 */}
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12 border-2 border-background shadow-sm ring-1 ring-border">
                        <AvatarImage
                          src={n.actor?.avatar || undefined}
                          alt={n.actor?.username ?? '有人'}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-semibold">
                          {(n.actor?.username ?? '有')
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* 通知类型徽章 */}
                      <div
                        className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center shadow-sm border-2 border-background ${getNotificationColor()}`}
                      >
                        {getNotificationIcon()}
                      </div>
                    </div>

                    {/* 内容区域 */}
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {n.actor?.username ?? '有人'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          回复了你
                        </span>
                        {!readIds.has(n.id) && (
                          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground break-words leading-relaxed line-clamp-2">
                        {n.content ?? '有新的回复'}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                        <span>
                          {new Date(n.createdAt).toLocaleString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* 操作按钮区域 */}
                    <div className="shrink-0">
                      {href ? (
                        <Link
                          href={href}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary/90 text-primary-foreground shadow-sm hover:bg-primary hover:shadow transition-all"
                          onClick={() => void markOneRead(n.id)}
                        >
                          <Sparkles className="h-3 w-3" />
                          查看详情
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
        // 注意：这个标签页保留用于兼容，实际主要使用 /me/comments 页面
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

                // 根据评论类型生成不同的跳转链接
                let href: string | undefined;
                if (c.anchorType === 'LINE' || c.filePath || c.lineStart) {
                  // 行级评论：跳转到快照页面
                  href = c.snapshotId
                    ? `/snapshots/${c.snapshotId}${hash}`
                    : undefined;
                } else {
                  // 社区评论：跳转到社区页面并打开对应仓库
                  const repoId = (c as any).repoId;
                  href = repoId
                    ? `/community?repoId=${repoId}&commentId=${c.id}`
                    : undefined;
                }
                return (
                  <li
                    key={c.id}
                    className="border rounded p-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            // 行评论使用蓝色（主色调）
                            c.anchorType === 'LINE' || c.filePath || c.lineStart
                              ? 'bg-primary/10 text-primary'
                              : // 社区评论使用绿色（强调色）
                                'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          }`}
                        >
                          {c.anchorType === 'LINE' || c.filePath || c.lineStart
                            ? '行评论'
                            : '社区评论'}
                        </span>
                      </div>
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
