'use client';

import { Button } from '@/components/ui/button';
import {
  Bell,
  Bot,
  GitBranch,
  LayoutDashboard,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const coreModules = [
  {
    title: '仓库导入与管理',
    description: '支持导入仓库、查看成员关系、维护基础仓库信息。',
    icon: GitBranch,
  },
  {
    title: '快照浏览与协作评论',
    description: '基于 Git Worktree 进行代码快照浏览，并支持讨论与行级评论。',
    icon: MessageSquare,
  },
  {
    title: '权限与通知',
    description: '围绕成员身份、访问权限和评论反馈建立基础协作闭环。',
    icon: Shield,
  },
];

const supportModules = [
  {
    title: 'AI 助手',
    description: '作为辅助亮点保留，用于项目问答和协作辅助，不作为主系统展开。',
    icon: Bot,
  },
  {
    title: '运营控制台',
    description: '后续补充简洁实用的管理视角，展示平台数据与运行状态。',
    icon: LayoutDashboard,
  },
  {
    title: '实时反馈',
    description: '通过通知能力提升协作体验，帮助用户及时接收项目动态。',
    icon: Bell,
  },
];

export default function AboutPage() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-background">
      <main className="container-responsive py-16 md:py-24">
        <section className="mx-auto max-w-5xl space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-4 py-1.5 text-sm text-muted-foreground">
              毕业设计项目介绍
            </div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Relax-Git
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
              一个围绕仓库导入、代码快照浏览、协作评论与社区展示构建的全栈项目。
              这一版本的目标不是继续堆叠功能，而是把系统收敛成一个更适合毕业答辩与本地稳定演示的完整产品。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link
                href={
                  isAuthenticated
                    ? '/community'
                    : '/auth/login?callbackUrl=%2Fcommunity'
                }
              >
                进入社区
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link
                href={
                  isAuthenticated
                    ? '/repositories/import'
                    : '/auth/login?callbackUrl=%2Frepositories%2Fimport'
                }
              >
                导入仓库
              </Link>
            </Button>
            {isAdmin && (
              <Button asChild variant="secondary" size="lg">
                <Link href="/console">进入控制台</Link>
              </Button>
            )}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-5xl">
          <div className="mb-8 space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              当前主链路
            </h2>
            <p className="text-muted-foreground">
              这部分是项目在答辩和演示中应该重点展开的能力。
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {coreModules.map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-5xl">
          <div className="mb-8 space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              辅助与扩展能力
            </h2>
            <p className="text-muted-foreground">
              这些能力会保留，但不再抢占主叙事。
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {supportModules.map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-background p-3 text-muted-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {isAdmin && (
            <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    管理员演示入口已就绪
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    你当前账号具备管理员权限，可以直接进入控制台查看平台概览、仓库动态、内容动态与系统状态。
                  </p>
                </div>
                <Button asChild>
                  <Link href="/console">打开控制台</Link>
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className="mx-auto mt-16 max-w-5xl rounded-3xl border border-border/60 bg-muted/20 p-8 md:p-10">
          <h2 className="text-2xl font-semibold tracking-tight">技术实现</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
            当前仓库采用 Next.js 前端、NestJS API、Go Worker、PostgreSQL 与
            Redis
            的组合。后续将继续围绕“仓库更干净、主线更清楚、控制台更实用、本地
            演示更稳定”四个方向收敛实现。
          </p>
        </section>
      </main>
    </div>
  );
}
