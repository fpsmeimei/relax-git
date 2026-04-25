'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { formatDateTime } from '@/lib/utils';
import { apiClient } from '@/services/apiClient';
import {
  Activity,
  Database,
  FolderGit2,
  MessageSquare,
  MessageSquareText,
  Shield,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type ConsoleData = {
  overview: {
    users: number;
    admins: number;
    repositories: number;
    publishedRepositories: number;
    comments: number;
    baseSnapshots: number;
    sessionSnapshots: number;
    activeSessionSnapshots: number;
  };
  repositories: {
    recent: Array<{
      id: string;
      name: string;
      owner: string;
      visibility: string;
      isPublished: boolean;
      updatedAt: string;
    }>;
    popular: Array<{
      id: string;
      name: string;
      owner: string;
      viewCount: number;
      stars: number;
      isPublished: boolean;
    }>;
  };
  comments: {
    recent: Array<{
      id: string;
      content: string;
      anchorType: string;
      createdAt: string;
      isResolved: boolean;
      author: string;
      repositoryId: string;
      repositoryName: string;
    }>;
  };
  health: {
    api: {
      status: string;
      responseTime?: string;
      environment?: string;
    };
    worker: {
      healthy: boolean;
      status: string;
      message?: string;
      uptime?: string;
    };
    database: {
      healthy: boolean;
      counts?: Record<string, number>;
    };
    redis: {
      healthy: boolean;
      stats?: Record<string, unknown>;
    };
  };
  generatedAt: string;
};

const summaryCards = [
  { key: 'users', title: '用户总数', icon: Users },
  { key: 'repositories', title: '仓库总数', icon: FolderGit2 },
  { key: 'publishedRepositories', title: '已发布仓库', icon: Activity },
  { key: 'comments', title: '评论总数', icon: MessageSquare },
  { key: 'activeSessionSnapshots', title: '活跃会话快照', icon: Database },
  { key: 'admins', title: '管理员', icon: Shield },
] as const;

function StatusBadge({ healthy, label }: { healthy: boolean; label: string }) {
  return <Badge variant={healthy ? 'success' : 'destructive'}>{label}</Badge>;
}

export default function ConsolePage() {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const [data, setData] = useState<ConsoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<ConsoleData>(
          '/admin/console/overview'
        );
        setData(response.data);
        setError(null);
      } catch (err: any) {
        setError(err?.message || '控制台数据加载失败');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [isAuthenticated, isInitialized, user?.role]);

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container-responsive py-16">
          <div className="text-muted-foreground">控制台加载中...</div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container-responsive py-16">
          <Card>
            <CardHeader>
              <CardTitle>请先登录</CardTitle>
              <CardDescription>控制台仅对登录后的管理员开放。</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background">
        <main className="container-responsive py-16">
          <Card>
            <CardHeader>
              <CardTitle>暂无访问权限</CardTitle>
              <CardDescription>
                当前控制台只对管理员开放。你可以先返回
                <Link href="/community" className="ml-1 underline">
                  社区首页
                </Link>
                继续浏览。
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container-responsive py-16">
          <Card>
            <CardHeader>
              <CardTitle>控制台暂时不可用</CardTitle>
              <CardDescription>{error ?? '暂无数据'}</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container-responsive py-10 space-y-8">
        <section className="space-y-3">
          <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-4 py-1.5 text-sm text-muted-foreground">
            运营与管理控制台
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                平台概览
              </h1>
              <p className="text-muted-foreground">
                面向开发者的简洁管理视角，聚焦真实业务数据与系统状态。
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              数据生成时间：{formatDateTime(data.generatedAt)}
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map(item => {
            const Icon = item.icon;
            const value = data.overview[item.key];
            return (
              <Card key={item.key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold tracking-tight">
                    {value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">系统状态</CardTitle>
              <CardDescription>只展示当前最实用的运行信号。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                <div>
                  <div className="font-medium">API 服务</div>
                  <div className="text-sm text-muted-foreground">
                    状态：{data.health.api.status} · 响应：
                    {data.health.api.responseTime ?? '未知'}
                  </div>
                </div>
                <StatusBadge
                  healthy={data.health.api.status === 'healthy'}
                  label={data.health.api.status}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                <div>
                  <div className="font-medium">Worker 服务</div>
                  <div className="text-sm text-muted-foreground">
                    {data.health.worker.message ??
                      `状态：${data.health.worker.status}${data.health.worker.uptime ? ` · 运行时长：${data.health.worker.uptime}` : ''}`}
                  </div>
                </div>
                <StatusBadge
                  healthy={data.health.worker.healthy}
                  label={data.health.worker.status}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                <div>
                  <div className="font-medium">数据库</div>
                  <div className="text-sm text-muted-foreground">
                    用户 {data.overview.users} · 仓库{' '}
                    {data.overview.repositories} · 评论 {data.overview.comments}
                  </div>
                </div>
                <StatusBadge
                  healthy={data.health.database.healthy}
                  label={data.health.database.healthy ? 'healthy' : 'unhealthy'}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                <div>
                  <div className="font-medium">Redis</div>
                  <div className="text-sm text-muted-foreground">
                    {data.health.redis.stats
                      ? `运行统计已获取`
                      : '当前未返回额外统计'}
                  </div>
                </div>
                <StatusBadge
                  healthy={data.health.redis.healthy}
                  label={data.health.redis.healthy ? 'healthy' : 'unhealthy'}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">最近更新的仓库</CardTitle>
              <CardDescription>方便快速查看近期平台活动。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.repositories.recent.map(repo => (
                <div
                  key={repo.id}
                  className="rounded-xl border border-border/60 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium">{repo.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {repo.owner} · {repo.visibility} ·{' '}
                        {formatDateTime(repo.updatedAt)}
                      </div>
                    </div>
                    <Badge variant={repo.isPublished ? 'success' : 'outline'}>
                      {repo.isPublished ? '已发布' : '未发布'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">热门仓库</CardTitle>
                <CardDescription>基于浏览量和点赞做轻量展示。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.repositories.popular.map(repo => (
                  <div
                    key={repo.id}
                    className="flex flex-col gap-2 rounded-xl border border-border/60 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="font-medium">{repo.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {repo.owner} · 浏览 {repo.viewCount} · 点赞 {repo.stars}
                      </div>
                    </div>
                    <Badge variant={repo.isPublished ? 'soft' : 'outline'}>
                      {repo.isPublished ? '社区展示中' : '未上架社区'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">最近评论</CardTitle>
                <CardDescription>
                  快速感知社区内容动态与讨论活跃度。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.comments.recent.map(comment => (
                  <div
                    key={comment.id}
                    className="rounded-xl border border-border/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MessageSquareText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{comment.author}</span>
                          <span className="text-sm text-muted-foreground">
                            @ {comment.repositoryName}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-sm text-foreground/90">
                          {comment.content}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {comment.anchorType} ·{' '}
                          {formatDateTime(comment.createdAt)}
                        </div>
                      </div>
                      <Badge variant={comment.isResolved ? 'outline' : 'soft'}>
                        {comment.isResolved ? '已解决' : '讨论中'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
