'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BotChatPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/messages?assistant=repo');
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container-responsive py-16">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            正在跳转到仓库助手...
          </div>
        </div>
      </main>
    </div>
  );
}
