'use client';

import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container-responsive flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold">消息</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              href="/repositories"
            >
              返回仓库
            </Link>
          </div>
        </div>
      </nav>

      <main className="container-responsive py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <MessageSquare className="h-16 w-16 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">聊天功能</h1>
            <p className="text-lg text-muted-foreground">
              此功能正在开发中，敬请期待
            </p>
          </div>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              即将支持：私聊、群聊、实时消息通知等功能
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
