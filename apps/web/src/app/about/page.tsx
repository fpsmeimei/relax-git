'use client';

import {
  Bell,
  Bot,
  GitBranch,
  LayoutDashboard,
  MessageSquare,
  Shield,
} from 'lucide-react';

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
    description: '作为辅助亮点保留，围绕仓库发现、问答和项目理解提供支持。',
    icon: Bot,
  },
  {
    title: '运营控制台',
    description: '提供简洁实用的管理视角，用于展示平台数据与系统运行状态。',
    icon: LayoutDashboard,
  },
  {
    title: '实时反馈',
    description: '通过通知能力提升协作体验，帮助用户及时接收项目动态。',
    icon: Bell,
  },
];

export default function AboutPage() {
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
        </section>

        <section className="mx-auto mt-16 max-w-5xl">
          <div className="mb-8 space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              当前主链路
            </h2>
            <p className="text-muted-foreground">
              这部分构成了项目当前最完整、最适合展示的核心能力。
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
        </section>

        <section className="mx-auto mt-16 max-w-5xl rounded-3xl border border-border/60 bg-muted/20 p-8 md:p-10">
          <h2 className="text-2xl font-semibold tracking-tight">技术实现</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
            当前仓库采用 Next.js 前端、NestJS API、Go Worker、PostgreSQL 与
            Redis
            的组合。当前版本已经围绕“主线清晰、结构完整、本地运行稳定”的目标完成了阶段性收口。
          </p>
        </section>
      </main>
    </div>
  );
}
