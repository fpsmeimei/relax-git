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
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
      <main className="container-responsive">
        {/* Hero 区域 - 更大气的布局 */}
        <div className="text-center space-y-16 py-32 px-6">
          <div className="space-y-8">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-tight">
              基于 Git Worktree 的
              <span className="text-primary block mt-4 font-medium">
                开发者代码社区
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              现代化的代码协作平台，让团队开发更高效、更智能
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-lg">
            <span className="px-6 py-3 bg-muted/20 rounded-full border border-muted/30 backdrop-blur-sm">
              代码讨论
            </span>
            <span className="px-6 py-3 bg-muted/20 rounded-full border border-muted/30 backdrop-blur-sm">
              社区互动
            </span>
            <span className="px-6 py-3 bg-muted/20 rounded-full border border-muted/30 backdrop-blur-sm">
              知识分享
            </span>
          </div>

          <div className="flex justify-center pt-8">
            <Button
              asChild
              variant="soft"
              size="lg"
              className="text-2xl px-12 py-4 h-auto rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link
                href={
                  isAuthenticated
                    ? '/repositories/import'
                    : '/auth/login?intent=login'
                }
              >
                <span className="inline-flex items-center">
                  <Zap className="mr-3 h-7 w-7" />
                  开始使用
                </span>
              </Link>
            </Button>
          </div>
        </div>

        {/* 特性展示区域 - 更大气的布局 */}
        <div className="py-24 px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
              核心功能
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              为现代开发团队打造的全方位协作体验
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* 实时代码浏览 */}
            <div className="group card p-8 text-center space-y-6 hover-lift border-0 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                快速代码浏览
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                基于 Git Worktree 技术，无需分支切换即可浏览不同版本代码
              </p>
            </div>

            {/* 实时通知 */}
            <div className="group card p-8 text-center space-y-6 hover-lift border-0 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                实时通知
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                基于 WebSocket 的实时消息推送，及时获取评论回复等重要信息
              </p>
            </div>

            {/* 行级评论 */}
            <div className="group card p-8 text-center space-y-6 hover-lift border-0 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                代码行级评论
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                支持在代码任意行添加评论，进行多层级回复讨论
              </p>
            </div>

            {/* 即时聊天 */}
            <div className="group card p-8 text-center space-y-6 hover-lift border-0 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                即时聊天
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                内置聊天功能，支持私聊和群组讨论，方便团队实时沟通
              </p>
            </div>

            {/* 代码搜索 */}
            <div className="group card p-8 text-center space-y-6 hover-lift border-0 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                代码搜索
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                支持全文搜索和正则表达式搜索，快速定位代码内容
              </p>
            </div>

            {/* 成员与权限 */}
            <div className="group card p-8 text-center space-y-6 hover-lift border-0 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                权限管理
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                支持仓库成员管理和角色权限控制，确保团队协作安全
              </p>
            </div>
          </div>
        </div>

        {/* 技术栈展示区域 - 更大气的布局 */}
        <div className="py-24 px-6">
          <div className="text-center space-y-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
                技术架构
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                基于现代化技术栈构建，确保高性能与可扩展性
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
              <div className="badge badge-secondary text-base py-3 px-6 rounded-full hover:scale-105 transition-transform duration-200">
                Next.js 15
              </div>
              <div className="badge badge-secondary text-base py-3 px-6 rounded-full hover:scale-105 transition-transform duration-200">
                React 19
              </div>
              <div className="badge badge-secondary text-base py-3 px-6 rounded-full hover:scale-105 transition-transform duration-200">
                TypeScript
              </div>
              <div className="badge badge-secondary text-base py-3 px-6 rounded-full hover:scale-105 transition-transform duration-200">
                Tailwind CSS
              </div>
              <div className="badge badge-secondary text-base py-3 px-6 rounded-full hover:scale-105 transition-transform duration-200">
                NestJS
              </div>
              <div className="badge badge-secondary text-base py-3 px-6 rounded-full hover:scale-105 transition-transform duration-200">
                PostgreSQL
              </div>
              <div className="badge badge-secondary text-base py-3 px-6 rounded-full hover:scale-105 transition-transform duration-200">
                Redis
              </div>
              <div className="badge badge-secondary text-base py-3 px-6 rounded-full hover:scale-105 transition-transform duration-200">
                Go Worker
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
