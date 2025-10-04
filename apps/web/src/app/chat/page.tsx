'use client';

import { apiClient } from '@/services/apiClient';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function ChatListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const createDirect = searchParams.get('createDirect');
    if (createDirect) {
      void handleCreateDirect(createDirect);
    } else {
      // 重定向到新的聊天室页面
      router.replace('/chatroom');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  const handleCreateDirect = async (uid: string) => {
    if (!uid) return;
    try {
      setCreating(true);
      const { data } = await apiClient.post<{ id: string }>(`/chats/direct`, {
        userId: uid,
      });
      router.replace(`/chat/${(data as any)?.id ?? ''}`);
    } catch (e) {
      console.error('Create direct chat failed:', e);
      router.replace('/chatroom');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container-responsive py-12">
        <div className="flex items-center justify-center">
          {creating ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              正在创建聊天...
            </div>
          ) : (
            <div className="text-center">
              <div className="text-muted-foreground">正在跳转到聊天室...</div>
            </div>
          )}
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
