'use client';

import { SearchPage as SearchPageComponent } from '@/components/search';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

function SearchRoutePageInner() {
  const params = useSearchParams();
  const router = useRouter();

  const repoId = useMemo(() => params.get('repoId') || '', [params]);
  const [repoIdInput, setRepoIdInput] = useState<string>(repoId);

  useEffect(() => {
    setRepoIdInput(repoId);
  }, [repoId]);

  const goToRepoSearch = (id: string) => {
    const rid = id.trim();
    if (!rid) return;
    router.push(`/search?repoId=${encodeURIComponent(rid)}`);
  };

  return (
    <div className="min-h-screen brand-hero relative">
      <main className="container-responsive py-16 space-y-10">
        {!repoId ? (
          <div className="relative mx-auto max-w-2xl glass-lg border border-border p-10 shadow-spotify-card hover-lift">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
            <h2 className="text-2xl font-semibold tracking-tight">
              按仓库开始搜索
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              请输入目标仓库的编号（ID），开始进行代码搜索。
            </p>
            <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
              <Input
                placeholder="仓库编号（ID）"
                value={repoIdInput}
                onChange={e => setRepoIdInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') goToRepoSearch(repoIdInput);
                }}
                className="glass-input"
              />
              <Button
                variant="soft"
                onClick={() => goToRepoSearch(repoIdInput)}
                disabled={!repoIdInput.trim()}
                className="md:w-auto"
              >
                <SearchIcon className="h-4 w-4 mr-2" />
                前往
              </Button>
            </div>
          </div>
        ) : (
          <div className="glass-lg border border-border p-4">
            <SearchPageComponent
              repositoryId={repoId}
              repositoryName={repoId}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchRoutePage() {
  return (
    <Suspense fallback={<div />}>
      <SearchRoutePageInner />
    </Suspense>
  );
}
