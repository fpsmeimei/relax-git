'use client';

import { Sparkles } from 'lucide-react';

export function AIWelcome() {
  return (
    <div className="flex items-center justify-center min-h-[500px] px-6 py-12">
      <div className="max-w-3xl w-full space-y-8">
        {/* Logo + 标题 */}
        <div className="text-center space-y-4">
          {/* 简约Logo */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#88C0D0] to-[#81A1C1] flex items-center justify-center shadow-lg shadow-[#88C0D0]/20">
              <Sparkles className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
          </div>

          {/* 标题组 */}
          <div className="space-y-2">
            <h1 className="text-3xl font-light text-[#ECEFF4] tracking-wide">
              电影 AI 顾问
            </h1>
            <p className="text-[#D8DEE9]/50 text-sm font-light">
              专业的电影推荐与分析平台 · 由 DeepSeek v3.2 驱动
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
