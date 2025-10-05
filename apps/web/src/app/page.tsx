'use client';

import { Button } from '@/components/ui/button';
import {
  Bell,
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-foreground">
            加载中... (状态: {status}, 挂载: {mounted ? '是' : '否'})
          </p>
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
        <div className="text-center space-y-9 mb-18 pt-18 pb-9 px-9">
          <div>
            <h1 className="text-5xl md:text-6xl font-medium tracking-tight">
              基于 Git Worktree 的
              <span className="text-primary block mt-1">开发者代码社区</span>
            </h1>
          </div>

          <div className="flex flex-wrap justify-center gap-5 text-base text-muted-foreground">
            <span className="px-4 py-2 bg-muted/30 rounded-full">代码讨论</span>
            <span className="px-4 py-2 bg-muted/30 rounded-full">社区互动</span>
            <span className="px-4 py-2 bg-muted/30 rounded-full">知识分享</span>
          </div>

          <div className="flex justify-center">
            <Button
              asChild
              variant="soft"
              size="lg"
              className="text-xl px-10 py-3"
            >
              <Link
                href={
                  isAuthenticated
                    ? '/repositories/import'
                    : '/auth/login?intent=login'
                }
              >
                <span className="inline-flex items-center">
                  <Zap className="mr-2 h-6 w-6" />
                  开始使用
                </span>
              </Link>
            </Button>
          </div>
        </div>

        {/* 特性展示（与当前版本能力对齐） */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-18 max-w-6xl mx-auto">
          {/* 实时代码浏览 */}
          <div className="card p-6 text-center space-y-4 hover-lift border-0 bg-card/50 backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mx-auto">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              快速代码浏览
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              基于 Git Worktree 技术，无需分支切换即可浏览不同版本代码
            </p>
          </div>

          {/* 实时通知 */}
          <div className="card p-6 text-center space-y-4 hover-lift border-0 bg-card/50 backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mx-auto">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">实时通知</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              基于 WebSocket 的实时消息推送，及时获取评论回复等重要信息
            </p>
          </div>

          {/* 行级评论 */}
          <div className="card p-6 text-center space-y-4 hover-lift border-0 bg-card/50 backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mx-auto">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              代码行级评论
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              支持在代码任意行添加评论，进行多层级回复讨论
            </p>
          </div>

          {/* 即时聊天 */}
          <div className="card p-6 text-center space-y-4 hover-lift border-0 bg-card/50 backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mx-auto">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">即时聊天</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              内置聊天功能，支持私聊和群组讨论，方便团队实时沟通
            </p>
          </div>

          {/* 代码搜索 */}
          <div className="card p-6 text-center space-y-4 hover-lift border-0 bg-card/50 backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mx-auto">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">代码搜索</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              支持全文搜索和正则表达式搜索，快速定位代码内容
            </p>
          </div>

          {/* 成员与权限 */}
          <div className="card p-6 text-center space-y-4 hover-lift border-0 bg-card/50 backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mx-auto">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">权限管理</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              支持仓库成员管理和角色权限控制，确保团队协作安全
            </p>
          </div>
        </div>

        {/* 技术栈展示 */}
        <div className="text-center space-y-9 mt-24">
          <h2 className="text-4xl font-bold">技术架构</h2>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
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
    </div>
  );
}
