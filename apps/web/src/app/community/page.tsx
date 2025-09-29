'use client';

import {
  CommunityFilters,
  CommunityFilters as FilterType,
} from '@/components/community/community-filters';
import { RepositoryCard } from '@/components/community/repository-card';
import { RepositoryDetailModal } from '@/components/community/repository-detail-modal';
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
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterType>({
    sort: 'latest',
    tags: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedRepository, setSelectedRepository] =
    useState<CommunityFeedItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
    loadFeed(true);
  }, [filters, loadFeed]);

  // 从URL初始化一次筛选条件
  useEffect(() => {
    if (didInitFromUrl.current) return;
    didInitFromUrl.current = true;
    const sort = (searchParams.get('sort') as FilterType['sort']) || 'latest';
    const language = searchParams.get('language') || undefined;
    const tagsStr = searchParams.get('tags');
    const search = searchParams.get('search') || undefined;
    const tags = tagsStr ? tagsStr.split(',').filter(Boolean) : [];
    setFilters({ sort, language, tags, search });
    setNextCursor(null);
  }, [searchParams]);

  // 同步URL
  const syncUrl = useCallback(
    (f: FilterType) => {
      const params = new URLSearchParams();
      if (f.sort) params.set('sort', f.sort);
      if (f.language) params.set('language', f.language);
      if (f.tags && f.tags.length) params.set('tags', f.tags.join(','));
      if (f.search) params.set('search', f.search);
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '?', { scroll: false });
    },
    [router]
  );
  //
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

  // 处理仓库卡片点击
  const handleRepositoryClick = (repository: CommunityFeedItem) => {
    setSelectedRepository(repository);
    setShowDetailModal(true);
  };

  // 处理收藏状态变化
  const handleCollectChange = (
    repoId: string,
    collectionsCount: number,
    isCollected: boolean
  ) => {
    setRepositories(prev =>
      prev.map(repo => (repo.id === repoId ? { ...repo, isCollected } : repo))
    );
  };

  // 加载更多
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadFeed(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-responsive py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">社区</h1>
          <p className="text-muted-foreground">
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
            <div className="mb-6">
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

        {/* 无限滚动哨兵 */}
        {hasMore && <div ref={loadMoreRef} className="h-px" />}

        {/* 仓库卡片流 */}
        {!loading && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {repositories.map(repo => (
                <RepositoryCard
                  key={repo.id}
                  repository={repo}
                  onLikeChange={handleLikeChange}
                  onView={handleView}
                  onClick={() => handleRepositoryClick(repo)}
                />
              ))}
            </div>

            {/* 加载更多 */}
            {hasMore && repositories.length > 0 && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      加载中...
                    </>
                  ) : (
                    '加载更多'
                  )}
                </Button>
              </div>
            )}

            {/* 空状态提示 */}
            {repositories.length === 0 && (
              <div className="text-center py-12">
                <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无项目</h3>
                <EmptyHint
                  className="mb-4"
                  message={
                    filters.search ||
                    filters.language ||
                    filters.tags.length > 0
                      ? '没有找到符合条件的项目，试试调整筛选条件'
                      : '还没有公开的项目，快去导入一个仓库并设为公开吧！'
                  }
                />
                {!filters.search &&
                  !filters.language &&
                  filters.tags.length === 0 && (
                    <Button asChild variant="soft">
                      <Link href="/repositories/import">导入仓库</Link>
                    </Button>
                  )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 仓库详情模态框 */}
      <RepositoryDetailModal
        repository={selectedRepository}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onLikeChange={handleLikeChange}
        onCollectChange={handleCollectChange}
      />
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
