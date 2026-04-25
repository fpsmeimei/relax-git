'use client';

import { buildMessagesHref } from '@/lib/messages-route';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function ChatListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    router.replace(buildMessagesHref(searchParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container-responsive py-12">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            正在进入消息中心...
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ChatListPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <main className="container-responsive py-12">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-muted-foreground">加载中...</div>
              </div>
            </div>
          </main>
        </div>
      }
    >
      <ChatListPageContent />
    </Suspense>
  );
}
