'use client';

import { buildMessagesHref } from '@/lib/messages-route';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ChatroomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    router.replace(buildMessagesHref(searchParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container-responsive py-16">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            正在跳转到消息中心...
          </div>
        </div>
      </main>
    </div>
  );
}
