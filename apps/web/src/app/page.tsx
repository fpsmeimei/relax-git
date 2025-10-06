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

/**
 * 首页组件 - 社区页面
 *
 * 直接显示社区内容，让用户立即看到活跃的项目和讨论
 */
function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const didInitFromUrl = useRef(false);
  const pendingRepoIdRef = useRef<string | null>(null);

  const [repositories, setRepositories] = useState<CommunityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<FilterType>({
    sort: 'latest',
  });
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [selectedRepository, setSelectedRepository] = useState<
    CommunityFeedItem | undefined
  >(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [targetCommentId, setTargetCommentId] = useState<string | null>(null);

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
    const search = searchParams.get('search') || undefined;
    setFilters({ sort, search });
    setNextCursor(null);

    // 处理仓库ID和评论ID参数
    const repoId = searchParams.get('repoId');
    const commentId = searchParams.get('commentId');
    if (repoId) {
      setTargetCommentId(commentId);
      pendingRepoIdRef.current = repoId;
      // 如果数据已经加载出来，则尝试立即打开
      const targetRepo = repositories.find(repo => repo.id === repoId);
      if (targetRepo) {
        setSelectedRepository(targetRepo);
        setModalOpen(true);
        pendingRepoIdRef.current = null;
      }
    }
  }, [searchParams, repositories]);

  // 当仓库列表更新且存在待打开的仓库时自动打开详情
  useEffect(() => {
    if (!pendingRepoIdRef.current) return;
    const repo = repositories.find(r => r.id === pendingRepoIdRef.current);
    if (!repo) return;
    setSelectedRepository(repo);
    setModalOpen(true);
    pendingRepoIdRef.current = null;
  }, [repositories]);

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

  const handleFiltersChange = useCallback(
    (newFilters: FilterType) => {
      setFilters(newFilters);
      setNextCursor(null);
      syncUrl(newFilters);
    },
    [syncUrl]
  );

  // 处理点赞变化
  const handleLikeChange = useCallback(
    (repoId: string, newStars: number, isLiked: boolean) => {
      setRepositories(prev =>
        prev.map(repo =>
          repo.id === repoId ? { ...repo, stars: newStars, isLiked } : repo
        )
      );
    },
    []
  );

  // 处理浏览记录
  const handleView = useCallback((repoId: string) => {
    setRepositories(prev =>
      prev.map(repo =>
        repo.id === repoId ? { ...repo, viewCount: repo.viewCount + 1 } : repo
      )
    );
  }, []);

  const handleRepositoryClick = useCallback((repository: CommunityFeedItem) => {
    setSelectedRepository(repository);
    setModalOpen(true);
  }, []);

  // 加载更多
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadFeed(false);
    }
  }, [loadingMore, hasMore, loadFeed]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedRepository(undefined);
    setTargetCommentId(null);
    // 清理URL参数
    const params = new URLSearchParams(window.location.search);
    params.delete('repoId');
    params.delete('commentId');
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?', { scroll: false });
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container-responsive py-8">
        {/* 页面标题和操作区 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">社区</h1>
            <p className="text-muted-foreground mt-2">
              发现优秀的开源项目，参与代码讨论
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/repositories/import">
                <GitBranch className="h-4 w-4 mr-2" />
                导入仓库
              </Link>
            </Button>
          </div>
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

        {/* 无限滚动哨兵 */}
        {hasMore && <div ref={loadMoreRef} className="h-px" />}

        {/* 仓库卡片流 */}
        {!loading && (
          <>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
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
              <div className="flex justify-center mt-12">
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

      {/* 仓库详情模态框 */}
      <RepositoryDetailModal
        repository={selectedRepository || null}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onLikeChange={handleLikeChange}
        highlightCommentId={targetCommentId}
      />
    </div>
  );
}

export default function HomePage() {
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
      <HomePageContent />
    </Suspense>
  );
}
