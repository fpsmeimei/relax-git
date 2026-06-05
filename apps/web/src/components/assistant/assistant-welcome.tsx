'use client';

import { Sparkles } from 'lucide-react';

const ASSISTANT_MODEL_LABEL = 'DeepSeek V4 Flash';

export function AssistantWelcome() {
  return (
    <div className="flex min-h-[240px] items-center justify-center px-4 py-6">
      <div className="w-full max-w-2xl space-y-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
            <Sparkles className="h-7 w-7" strokeWidth={1.8} />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold text-foreground">
              仓库发现助手
            </h1>
            <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground">
              {`面向 Relax-Git 社区的仓库推荐、方向检索与仓库简介生成 · 由 ${ASSISTANT_MODEL_LABEL} 驱动`}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-muted/35 p-3 text-sm leading-6 text-foreground shadow-sm">
            <div className="mb-2 h-1 w-10 rounded-full bg-primary/60" />
            我可以根据社区数据推荐热门仓库，或者帮你按 AI Agent、前端工程化、Go
            并发这类方向寻找值得看的项目。
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/35 p-3 text-sm leading-6 text-foreground shadow-sm">
            <div className="mb-2 h-1 w-10 rounded-full bg-primary/60" />
            如果你已经选中某个仓库，我也可以先给出一个简洁介绍，帮助你判断它适不适合继续深入阅读和讨论。
          </div>
        </div>
      </div>
    </div>
  );
}
