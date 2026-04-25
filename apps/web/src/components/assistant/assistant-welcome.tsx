'use client';

import { Sparkles } from 'lucide-react';

export function AssistantWelcome() {
  return (
    <div className="flex min-h-[500px] items-center justify-center px-6 py-12">
      <div className="w-full max-w-3xl space-y-8">
        <div className="space-y-4 text-center">
          <div className="relative inline-flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#88C0D0] to-[#81A1C1] shadow-lg shadow-[#88C0D0]/20">
              <Sparkles className="h-10 w-10 text-white" strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-light tracking-wide text-[#ECEFF4]">
              仓库发现助手
            </h1>
            <p className="text-sm font-light text-[#D8DEE9]/50">
              面向 Relax-Git 社区的仓库推荐、方向检索与仓库简介生成 · 由
              DeepSeek v3.2 驱动
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#4C566A]/30 bg-[#3B4252]/70 p-4 text-sm text-[#D8DEE9]/80">
            我可以根据社区数据推荐热门仓库，或者帮你按 AI Agent、前端工程化、Go
            并发这类方向寻找值得看的项目。
          </div>
          <div className="rounded-2xl border border-[#4C566A]/30 bg-[#3B4252]/70 p-4 text-sm text-[#D8DEE9]/80">
            如果你已经选中某个仓库，我也可以先给出一个简洁介绍，帮助你判断它适不适合继续深入阅读和讨论。
          </div>
        </div>
      </div>
    </div>
  );
}
