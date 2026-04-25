'use client';

import { lazy, Suspense } from 'react';

// 懒加载消息中心页面组件
const ChatroomRedirectPage = lazy(() => import('./page'));

export default function ChatroomPageLazy() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">正在加载消息中心...</p>
          </div>
        </div>
      }
    >
      <ChatroomRedirectPage />
    </Suspense>
  );
}
