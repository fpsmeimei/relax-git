'use client';

import { SnapshotCodeViewer } from '@/components/snapshot/snapshot-code-viewer';
import { FeedbackBanner } from '@/components/snapshot/feedback-banner';
import { LoadingHint } from '@/components/snapshot/loading-hint';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/services/apiClient';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SnapshotPage() {
  const params = useParams();
  const snapshotId = String(params['id'] || '');

  const [commitSha, setCommitSha] = useState<string>('');
  const [repoName, setRepoName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await apiClient.get(`/snapshots/${snapshotId}`);
        // 支持 base/session 两种响应结构
        const type = (data as any)?.type as string | undefined;
        if (type === 'session') {
          const base = (data as any)?.baseSnapshot || {};
          if (typeof base?.commitSha === 'string') setCommitSha(base.commitSha);
          if (typeof base?.repository?.name === 'string')
            setRepoName(base.repository.name);
        } else {
          if (typeof (data as any)?.commitSha === 'string')
            setCommitSha((data as any).commitSha);
          if (typeof (data as any)?.repository?.name === 'string')
            setRepoName((data as any).repository.name);
        }
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || '加载快照失败';
        if (!cancelled) setError(String(msg));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (snapshotId) void load();
    return () => {
      cancelled = true;
    };
  }, [snapshotId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingHint
          message="加载快照中..."
          withSpinner
          className="text-base"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-xl space-y-4">
          <FeedbackBanner
            variant="error"
            message={<>无法打开快照：{error}</>}
          />
          <div className="flex items-center gap-2">
            <Button asChild variant="outline-subtle" size="sm">
              <Link href="/me/comments">
                <ArrowLeft className="h-4 w-4 mr-1" /> 返回我的评论
              </Link>
            </Button>
            <Button asChild variant="soft" size="sm">
              <Link href="/repositories">浏览仓库</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container-responsive flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/me/comments">
                <ArrowLeft className="h-4 w-4 mr-1" /> 返回我的评论
              </Link>
            </Button>
            {repoName && (
              <div className="text-sm text-muted-foreground">{repoName}</div>
            )}
          </div>
        </div>
      </header>

      <main className="container-responsive py-6">
        <SnapshotCodeViewer snapshotId={snapshotId} commitSha={commitSha} />
      </main>
    </div>
  );
}
