'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/stores/auth-store';
import { Loader2, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { EmptyHint } from '@/components/snapshot/empty-hint';
import { FeedbackBanner } from '@/components/snapshot/feedback-banner';
import { LoadingHint } from '@/components/snapshot/loading-hint';

interface RepoCommentItem {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export function RepositoryCommentsPanel({
  repoId,
  latestSnapshotId,
}: {
  repoId: string;
  latestSnapshotId: string | null;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RepoCommentItem[]>([]);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get<{ comments: any[] }>('/comments', {
        params: { repoId, anchorType: 'SNAPSHOT', page: 1, limit: 100 },
      });
      const list: any[] = Array.isArray((data as any)?.comments)
        ? (data as any).comments
        : [];
      const mapped: RepoCommentItem[] = list
        .filter((c: any) => !c.parentId)
        .map((c: any) => ({
          id: c.id,
          content: c.content,
          author: c.author?.username || '未知用户',
          createdAt: c.createdAt,
        }));
      setItems(mapped);
      setError(null);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, [repoId]);

  useEffect(() => {
    void load();
  }, [load]);

  const formatTime = useCallback((s: string) => {
    const d = new Date(s);
    return d.toLocaleString('zh-CN');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || submitting) return;
    if (!user?.id) {
      toast({ title: '请先登录', variant: 'destructive' });
      return;
    }
    if (!latestSnapshotId) {
      toast({
        title: '无法发布',
        description: '暂无快照可关联，请先创建一个快照。',
        variant: 'destructive',
      });
      return;
    }
    try {
      setSubmitting(true);
      const { data } = await apiClient.post('/comments', {
        snapshotId: latestSnapshotId,
        content: text.trim(),
        anchorType: 'SNAPSHOT',
      });
      setItems(it => [
        ...it,
        {
          id: (data as any)?.id,
          content: (data as any)?.content,
          author: user?.username || '匿名用户',
          createdAt: (data as any)?.createdAt,
        },
      ]);
      setText('');
      setTimeout(() => textareaRef.current?.focus(), 0);
    } catch (e: any) {
      toast({
        title: '发布失败',
        description: e?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }, [text, submitting, latestSnapshotId, toast, user?.username, user?.id]);

  const sorted = useMemo(() => {
    return [...items].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [items]);

  return (
    <div className="mt-4 glass-panel">
      <div className="glass-panel-header">
        <span className="text-foreground/85">项目级评论</span>
        <span className="text-xs text-muted-foreground">
          {sorted.length ? `${sorted.length} 条` : '欢迎留下你的想法'}
        </span>
      </div>
      <div className="glass-panel-body space-y-4">
        {loading ? (
          <LoadingHint message={'加载中...'} />
        ) : error ? (
          <FeedbackBanner
            variant="error"
            message={<>评论加载失败：{error}</>}
            retryLabel="重试"
            onRetry={() => void load()}
          />
        ) : sorted.length > 0 ? (
          <div className="space-y-3">
            {sorted.map(it => (
              <div key={it.id} className="flex gap-3">
                <Avatar className="h-8 w-8 border border-border bg-accent/5 backdrop-blur">
                  <AvatarFallback className="text-[10px] font-medium text-foreground/85">
                    {it.author.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">
                    <span className="mr-2 font-medium text-foreground/85">
                      {it.author}
                    </span>
                    <span
                      title={new Date(it.createdAt).toLocaleString('zh-CN', {
                        hour12: false,
                      })}
                    >
                      {formatTime(it.createdAt)}
                    </span>
                  </div>
                  <div className="my-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                    {it.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyHint message={'暂无评论'} />
        )}

        <div className="border-t border-border pt-4">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 border border-border bg-accent/5 backdrop-blur">
              <AvatarFallback className="text-[10px] font-medium text-foreground/85">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={
                  latestSnapshotId
                    ? '添加项目级评论... Ctrl/⌘+Enter 发表'
                    : '暂无就绪快照，创建后即可发表评论'
                }
                className="glass-input min-h-[96px] mb-2"
                onKeyDown={e => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    void handleSubmit();
                  }
                }}
                disabled={!latestSnapshotId}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => void handleSubmit()}
                  disabled={!text.trim() || submitting || !latestSnapshotId}
                  className="halo-accent halo-accent-pulse"
                >
                  {submitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <Send className="h-4 w-4 mr-2" /> 发布评论
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
