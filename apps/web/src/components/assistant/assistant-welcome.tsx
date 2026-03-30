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
              项目 AI 助手
            </h1>
            <p className="text-sm font-light text-[#D8DEE9]/50">
              面向毕业设计项目的结构梳理、汇报辅助与问题排查 · 由 DeepSeek v3.2
              驱动
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#4C566A]/30 bg-[#3B4252]/70 p-4 text-sm text-[#D8DEE9]/80">
            我可以帮你梳理项目启动步骤、解释代码结构、整理答辩话术，也可以直接帮你总结当前页面在做什么。
          </div>
          <div className="rounded-2xl border border-[#4C566A]/30 bg-[#3B4252]/70 p-4 text-sm text-[#D8DEE9]/80">
            如果你遇到运行报错、构建错误或配置问题，直接把信息发给我，我会优先给出可执行的排查步骤。
          </div>
        </div>
      </div>
    </div>
  );
}
