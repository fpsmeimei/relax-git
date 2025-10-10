'use client';

import {
  CommunityFilters,
  CommunityFilters as FilterType,
} from '@/components/community/community-filters';
import { RepositoryCard } from '@/components/community/repository-card';
import { Button } from '@/components/ui/button';
import { CommunityAPI, CommunityFeedItem } from '@/lib/api/community';
import { GitBranch, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { EmptyHint } from '@/components/snapshot/empty-hint';
import { FeedbackBanner } from '@/components/snapshot/feedback-banner';
import { LoadingHint } from '@/components/snapshot/loading-hint';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

function CommunityPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const didInitFromUrl = useRef(false);

  const [repositories, setRepositories] = useState<CommunityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<FilterType>({
    sort: 'latest',
  });
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // 加载社区feed
  const loadFeed = useCallback(
    async (reset = false) => {
      try {
        if (reset) {
          setLoading(true);
          setRepositories([]);
        } else {
          setLoadingMore(true);
        }

        const query = {
          ...filters,
          cursor: reset ? undefined : nextCursor || undefined,
          limit: 12,
        };

        const response = await CommunityAPI.getFeed(query);

        if (reset) {
          setRepositories(response.items);
        } else {
          setRepositories(prev => [...prev, ...response.items]);
        }

        setNextCursor(response.nextCursor);
        setHasMore(response.hasMore);
        setError(null);
      } catch (err) {
        console.error('加载社区feed失败:', err);
        const msg = (err as any)?.message || String(err);
        setError(msg);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, nextCursor]
  );

  // 初始加载
  useEffect(() => {
    void loadFeed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // 从URL初始化一次筛选条件
  useEffect(() => {
    if (didInitFromUrl.current) return;
    didInitFromUrl.current = true;
    const sort = (searchParams.get('sort') as FilterType['sort']) || 'latest';
    const search = searchParams.get('search') || undefined;
    setFilters({ sort, search });
    setNextCursor(null);
  }, [searchParams]);

  // 无限滚动
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore || loading) return;
    let pending = false;
    const io = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (first && first.isIntersecting && !pending && !loadingMore) {
          pending = true;
          Promise.resolve(loadFeed(false)).finally(() => {
            pending = false;
          });
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, loadingMore, loadFeed]);

  // 处理过滤器变化
  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    setNextCursor(null);
    syncUrl(newFilters);
  };

  // 同步URL
  const syncUrl = useCallback(
    (f: FilterType) => {
      const params = new URLSearchParams();
      if (f.sort && f.sort !== 'latest') params.set('sort', f.sort);
      if (f.search) params.set('search', f.search);
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '?', { scroll: false });
    },
    [router]
  );

  // 处理点赞变化
  const handleLikeChange = (
    repoId: string,
    newStars: number,
    isLiked: boolean
  ) => {
    setRepositories(prev =>
      prev.map(repo =>
        repo.id === repoId ? { ...repo, stars: newStars, isLiked } : repo
      )
    );
  };

  // 处理浏览记录
  const handleView = (repoId: string) => {
    setRepositories(prev =>
      prev.map(repo =>
        repo.id === repoId ? { ...repo, viewCount: repo.viewCount + 1 } : repo
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-responsive py-8 lg:py-12">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">社区</h1>
          <p className="text-muted-foreground text-lg">
            发现优秀的开源项目，像刷视频一样学技术
          </p>
        </div>

        {/* 过滤器 */}
        <div className="mb-8">
          <CommunityFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            loading={loading}
          />

          {/* 错误状态 */}
          {!!error && !loading && (
            <div className="mb-8">
              <FeedbackBanner
                variant="error"
                message={<>社区列表加载失败：{error}</>}
                retryLabel="重试"
                onRetry={() => void loadFeed(true)}
              />
            </div>
          )}
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingHint
              message={'加载中...'}
              withSpinner
              className="text-base"
              iconClassName="h-5 w-5"
            />
          </div>
        )}

        {/* 仓库卡片流 */}
        {!loading && (
          <>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {repositories.map(repo => (
                <RepositoryCard
                  key={repo.id}
                  repository={repo}
                  onLikeChange={handleLikeChange}
                  onView={handleView}
                />
              ))}
            </div>

            {/* 无限滚动哨兵 - 放在列表底部 */}
            {hasMore && repositories.length > 0 && (
              <div ref={loadMoreRef} className="h-px mt-12" />
            )}

            {/* 加载更多指示器 */}
            {loadingMore && (
              <div className="flex justify-center mt-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {/* 空状态提示 */}
            {repositories.length === 0 && (
              <div className="text-center py-16">
                <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-lg font-medium mb-4">暂无项目</h3>
                <EmptyHint
                  className="mb-6"
                  message={
                    filters.search
                      ? '没有找到符合条件的项目，试试调整搜索关键词'
                      : '还没有公开的项目，快去导入一个仓库并设为公开吧！'
                  }
                />
                {!filters.search && (
                  <Button asChild variant="soft">
                    <Link href="/repositories/import">导入仓库</Link>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-12">
          <LoadingHint
            message={'加载中...'}
            withSpinner
            className="text-base"
            iconClassName="h-5 w-5"
          />
        </div>
      }
    >
      <CommunityPageContent />
    </Suspense>
  );
}
