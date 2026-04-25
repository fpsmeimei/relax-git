'use client';

import { buildMessageThreadHref } from '@/lib/messages-route';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = String(params?.['id'] ?? '');

  useEffect(() => {
    if (!chatId) {
      router.replace('/messages');
      return;
    }

    router.replace(buildMessageThreadHref(chatId, searchParams));
  }, [chatId, router, searchParams]);

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
