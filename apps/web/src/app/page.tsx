'use client';

import { Button } from '@/components/ui/button';
import {
  Bell,
  GitBranch,
  MessageCircle,
  MessageSquare,
  Search,
  Shield,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

/**
 * 首页组件 - 营销展示页面
 * 
 * 策略：
 * - 未登录用户 → 跳转到登录页
 * - 已登录用户 → 显示完整的营销展示页面
 */
export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔥 不再强制跳转 - 允许未登录用户查看首页
  // 认证状态加载中
  if (status === 'loading' || !mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  // 已登录/未登录用户都可以查看首页
  const isAuthenticated = !!session?.user;

  return (
    <div className="min-h-screen bg-background">
      {/* 主要内容 */}
      <main className="container-responsive py-20">
        {/* Hero 区域 */}
        <div className="text-center space-y-8 mb-16 brand-hero rounded-2xl p-10">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-medium tracking-tight">
              基于 Git worktree 的
              <span className="text-primary block">现代化协作平台</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              告别传统分支切换的性能痛点，享受秒级快照创建、实时协作时间线和智能代码评论的全新体验
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            产品方向：聚焦社交/社区能力（不提供 Diff/PR 审核流）
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="soft" size="lg" className="text-lg px-8">
              <Link
                href={
                  isAuthenticated
                    ? '/repositories/import'
                    : '/auth/login?intent=login'
                }
              >
                <span className="inline-flex items-center">
                  <GitBranch className="mr-2 h-5 w-5" />
                  导入仓库
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline-subtle"
              size="lg"
              className="text-lg px-8"
            >
              <Link href="/repositories">浏览仓库</Link>
            </Button>
          </div>
        </div>

        {/* 特性展示（与当前版本能力对齐） */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* 实时代码浏览 */}
          <div className="card p-6 text-center space-y-4 hover-lift">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">实时代码浏览</h3>
            <p className="text-muted-foreground">
              基于 Git worktree，秒级响应的代码浏览体验
            </p>
          </div>

          {/* 实时通知 */}
          <div className="card p-6 text-center space-y-4 hover-lift">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">实时通知</h3>
            <p className="text-muted-foreground">
              WebSocket 推送评论回复等事件，断线自动重连与增量补拉
            </p>
          </div>

          {/* 行级评论 */}
          <div className="card p-6 text-center space-y-4 hover-lift">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">行级评论</h3>
            <p className="text-muted-foreground">
              文件行级锚点、楼中楼回复、@提及与快捷交互（B站风格）
            </p>
          </div>

          {/* 即时聊天 */}
          <div className="card p-6 text-center space-y-4 hover-lift">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">即时聊天</h3>
            <p className="text-muted-foreground">
              会话置顶、未读统计、房间订阅，配合通知实现轻量协作
            </p>
          </div>

          {/* 代码搜索 */}
          <div className="card p-6 text-center space-y-4 hover-lift">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">代码搜索</h3>
            <p className="text-muted-foreground">
              支持内容/文件名/正则搜索，历史记录与一键打开文件
            </p>
          </div>

          {/* 成员与权限 */}
          <div className="card p-6 text-center space-y-4 hover-lift">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">成员与权限</h3>
            <p className="text-muted-foreground">
              仓库成员管理与角色权限控制，确保协作安全可控
            </p>
          </div>
        </div>

        {/* 技术栈展示 */}
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold">现代化技术栈</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="badge badge-secondary text-sm py-2 px-4">
              Next.js 15
            </div>
            <div className="badge badge-secondary text-sm py-2 px-4">
              React 19
            </div>
            <div className="badge badge-secondary text-sm py-2 px-4">
              TypeScript
            </div>
            <div className="badge badge-secondary text-sm py-2 px-4">
              Tailwind CSS
            </div>
            <div className="badge badge-secondary text-sm py-2 px-4">
              NestJS
            </div>
            <div className="badge badge-secondary text-sm py-2 px-4">
              PostgreSQL
            </div>
            <div className="badge badge-secondary text-sm py-2 px-4">Redis</div>
            <div className="badge badge-secondary text-sm py-2 px-4">
              Go Worker
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t bg-muted/50 mt-16">
        <div className="container-responsive py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <GitBranch className="h-5 w-5 text-primary" />
              <span className="font-semibold">Relax-Git</span>
              <span className="text-muted-foreground">v0.1.0</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 Relax-Git Team. 基于 MIT 许可证开源.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
