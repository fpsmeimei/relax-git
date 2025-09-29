'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/stores/auth-store';
import {
  Activity,
  Clock,
  FileText,
  GitBranch,
  Plus,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuth();

  // 检查认证状态
  useEffect(() => {
    // 等待认证状态初始化完成后再检查
    if (isInitialized && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, isInitialized, router]);

  // 认证状态未初始化时显示加载状态
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在加载...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      title: '活跃仓库',
      value: '12',
      change: '+2',
      icon: GitBranch,
      color: 'text-primary',
    },
    {
      title: '今日快照',
      value: '28',
      change: '+8',
      icon: Zap,
      color: 'text-success',
    },
    {
      title: '协作成员',
      value: '6',
      change: '+1',
      icon: Users,
      color: 'text-info',
    },
    {
      title: '代码评论',
      value: '45',
      change: '+12',
      icon: FileText,
      color: 'text-warning',
    },
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'snapshot',
      title: '创建快照：用户认证优化',
      time: '5分钟前',
      status: 'completed',
    },
    {
      id: '2',
      type: 'comment',
      title: '在 auth.service.ts 添加评论',
      time: '12分钟前',
      status: 'completed',
    },
    {
      id: '3',
      type: 'collaboration',
      title: '张三加入了项目协作',
      time: '1小时前',
      status: 'completed',
    },
    {
      id: '4',
      type: 'snapshot',
      title: '创建快照：API性能优化',
      time: '2小时前',
      status: 'processing',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container-responsive flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <GitBranch className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Relax-Git</span>
            </Link>
            <span className="text-sm text-muted-foreground">控制台</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              欢迎回来，{user?.displayName ?? user?.username ?? ''}
            </span>
            {/* 已废弃：差异对比入口移除 */}
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="container-responsive py-8">
        <div className="space-y-8">
          {/* 欢迎区域 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                欢迎回来，{user?.displayName ?? user?.username ?? ''}！
              </h1>
              <p className="text-muted-foreground mt-2">
                这里是您的协作工作台，管理您的项目和团队
              </p>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="card p-6 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-success mr-1" />
                      <span className="text-sm text-success">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 最近活动 */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="card p-6 hover-lift">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">最近活动</h2>
                <Button variant="outline-subtle" size="sm">
                  查看全部
                </Button>
              </div>
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex-shrink-0">
                      <Activity className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        activity.status === 'completed' ? 'success' : 'info'
                      }
                    >
                      {activity.status === 'completed' ? '已完成' : '处理中'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* 快速操作 */}
            <div className="card p-6 hover-lift">
              <h2 className="text-xl font-semibold mb-6">快速操作</h2>
              <div className="space-y-4">
                <Button
                  className="w-full justify-start"
                  variant="outline-subtle"
                  asChild
                >
                  <Link href="/repositories/import">
                    <Plus className="h-4 w-4 mr-2" />
                    导入仓库
                  </Link>
                </Button>
                {/* 已废弃：创建差异对比入口移除 */}
                <Button
                  className="w-full justify-start"
                  variant="outline-subtle"
                >
                  <Users className="h-4 w-4 mr-2" />
                  邀请团队成员
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline-subtle"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  查看项目文档
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
