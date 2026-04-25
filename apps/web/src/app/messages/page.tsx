'use client';

import MessagesCenterPage from '@/components/messages/messages-center-page';
import { buildMessageThreadHref } from '@/lib/messages-route';
import { apiClient } from '@/services/apiClient';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function MessagesPageLoading({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="container-responsive py-16">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            {label}
          </div>
        </div>
      </main>
    </div>
  );
}

function MessagesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [creating, setCreating] = useState(false);
  const createDirect = searchParams.get('createDirect');

  useEffect(() => {
    if (createDirect) {
      void handleCreateDirect(createDirect);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createDirect, router]);

  const handleCreateDirect = async (uid: string) => {
    if (!uid) return;
    try {
      setCreating(true);
      const { data } = await apiClient.post<{ id?: string; chatId?: string }>(
        '/chats/direct',
        {
          userId: uid,
        }
      );
      const chatId = data?.chatId ?? data?.id;
      if (chatId) {
        router.replace(buildMessageThreadHref(chatId));
      } else {
        router.replace('/messages');
      }
    } catch (error) {
      console.error('Create direct chat failed:', error);
      router.replace('/messages');
    }
  };

  if (createDirect || creating) {
    return <MessagesPageLoading label="正在创建私信会话..." />;
  }

  return <MessagesCenterPage />;
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesPageLoading label="正在加载消息中心..." />}>
      <MessagesPageContent />
    </Suspense>
  );
}
