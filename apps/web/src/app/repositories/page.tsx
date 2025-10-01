'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { isJoinNeeded } from '@/lib/repo-access';
import { apiClient } from '@/services/apiClient';
import { useAppStore } from '@/stores/app-store';
import { useAuth } from '@/stores/auth-store';
import {
  Calendar,
  GitBranch,
  Globe,
  Loader2,
  Lock,
  Plus,
  Search,
  Settings,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import RepositorySettingsDialog from '@/components/repository/repository-settings-dialog';

interface Repository {
  id: string;
  name: string;
  description?: string;
  gitUrl: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INTERNAL';
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    username: string;
  };
  coverImage?: string | null;
  isPublished?: boolean;
  publishedAt?: string | null;
  // 受限访问相关字段
  isRestricted?: boolean;
  restrictionReason?: string;
}

interface RepositoryListApiResponse {
  repositories: Repository[];
  total: number;
  limit?: number;
}

export default function RepositoriesPage() {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuth();
  const { setCurrentRepository } = useAppStore();

  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 设置对话框
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsRepo, setSettingsRepo] = useState<{
    id: string;
    name: string;
    description?: string | null;
    visibility: 'PUBLIC' | 'PRIVATE' | 'INTERNAL';
    coverImage?: string | null;
    isPublished?: boolean;
    publishedAt?: string | null;
  } | null>(null);

  const [repoIdInput, setRepoIdInput] = useState('');
  // 受限仓库占位（按编号直达但无权限时在列表顶展示）
  const [restrictedRepoId, setRestrictedRepoId] = useState<string | null>(null);

  // 加入申请相关状态
  const [applyingRepoId, setApplyingRepoId] = useState<string | null>(null);
  const [joinStatuses, setJoinStatuses] = useState<
    Record<string, 'none' | 'pending' | 'approved' | 'rejected'>
  >({});
  const [cancellingRepoId, setCancellingRepoId] = useState<string | null>(null);

  // 检查认证状态
  useEffect(() => {
    // 临时禁用自动跳转，方便调试
    console.log('=== REPOSITORIES PAGE AUTH CHECK ===', {
      isInitialized,
      isAuthenticated,
    });
    // if (isInitialized && !isAuthenticated) {
    //   router.push('/auth/login');
    //   return;
    // }
  }, [isAuthenticated, isInitialized, router]);

  // 加载仓库列表
  useEffect(() => {
    if (!isAuthenticated) return;
    void loadRepositories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentPage, searchQuery]);

  const loadRepositories = async () => {
    try {
      setLoading(true);

      console.log('[RepositoriesPage] Loading repositories...', {
        currentPage,
        limit: 10,
        searchQuery,
        isAuthenticated,
        userId: user?.id,
        username: user?.username,
        user,
      });

      const { data } = await apiClient.get<RepositoryListApiResponse>(
        `/repositories`,
        {
          params: {
            page: currentPage,
            limit: 10,
            ...(searchQuery ? { search: searchQuery } : {}),
          },
        }
      );

      console.log('[RepositoriesPage] Loaded repositories:', {
        total: data.total,
        count: data.repositories.length,
        repositories: data.repositories,
      });

      setRepositories(data.repositories);
      const computedTotalPages = Math.max(
        1,
        Math.ceil((data.total ?? 0) / (data.limit ?? 10))
      );
      setTotalPages(computedTotalPages);
    } catch (error) {
      console.error('[RepositoriesPage] Failed to load repositories:', error);
      setRepositories([]);
    } finally {
      setLoading(false);
    }
  };

  // 查询“我在该仓库的加入状态”并写入 joinStatuses
  const loadMyJoinStatus = async (repoId: string) => {
    try {
      if (!isAuthenticated) return;
      const { data } = await apiClient.get<{ status: string }>(
        `/repositories/${repoId}/join-requests/me`
      );
      const s = String((data as any)?.status || 'none').toLowerCase();
      setJoinStatuses(prev => ({
        ...prev,
        [repoId]: ['pending', 'approved', 'rejected'].includes(s)
          ? (s as any)
          : 'none',
      }));
    } catch {
      setJoinStatuses(prev => ({ ...prev, [repoId]: 'none' }));
    }
  };

  // 按编号跳转：若无权限（403），在列表顶部展示受限卡片 + CTA
  const handleGoToRepositoryId = async (id: string) => {
    const repoId = id.trim();
    if (!repoId) return;
    try {
      // 尝试读取详情（拥有权限则正常跳转）
      await apiClient.get(`/repositories/${repoId}`);
      router.push(`/repositories/${repoId}`);
    } catch (e: any) {
      const status = e?.response?.status ?? 0;
      if (status === 403) {
        // 无权限：展示受限占位卡片，并尝试加载“我的加入状态”
        setRestrictedRepoId(repoId);
        void loadMyJoinStatus(repoId);
      } else if (status === 404) {
        toast({ title: '未找到该仓库ID' });
      } else {
        toast({
          title: '访问失败',
          description: e?.response?.data?.message || undefined,
        });
      }
    }
  };

  const handleRepositoryClick = (repository: Repository) => {
    // 如果是受限仓库，不允许直接点击进入
    if (repository.isRestricted) {
      return;
    }

    setCurrentRepository({
      id: repository.id,
      name: repository.name,
      ...(repository.description
        ? { description: repository.description }
        : {}),
      url: repository.gitUrl,
      visibility: repository.visibility,
      defaultBranch: repository.defaultBranch,
      createdAt: repository.createdAt,
      updatedAt: repository.updatedAt,
    });
    router.push(`/repositories/${repository.id}`);
  };

  // 打开设置对话框
  const openSettings = (repository: Repository) => {
    setSettingsRepo({
      id: repository.id,
      name: repository.name,
      description: repository.description ?? null,
      visibility: repository.visibility,
      coverImage: repository.coverImage ?? null,
      isPublished: repository.isPublished ?? false,
      publishedAt: repository.publishedAt ?? null,
    });
    setSettingsOpen(true);
  };

  // 申请加入仓库（统一封装）
  const handleApplyToJoin = async (repoId: string) => {
    try {
      setApplyingRepoId(repoId);
      const { applyToJoin } = await import('@/lib/join-requests');
      const { nextStatus, message } = await applyToJoin(repoId);
      setJoinStatuses(prev => ({ ...prev, [repoId]: nextStatus as any }));
      toast({ title: message });
    } catch (error: any) {
      console.error('申请失败:', error);
      toast({
        title: '申请失败',
        description: error?.response?.data?.message || '请稍后重试',
      });
    } finally {
      setApplyingRepoId(null);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC':
        return <Globe className="h-4 w-4" />;
      case 'PRIVATE':
        return <Lock className="h-4 w-4" />;
      case 'INTERNAL':
        return <Users className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  // 撤回加入申请（统一封装）
  const handleCancelJoin = async (repoId: string) => {
    try {
      setCancellingRepoId(repoId);
      const { cancelJoin } = await import('@/lib/join-requests');
      const { nextStatus, message } = await cancelJoin(repoId);
      setJoinStatuses(prev => ({ ...prev, [repoId]: nextStatus as any }));
      toast({ title: message });
    } catch (error: any) {
      toast({
        title: '撤回失败',
        description: error?.response?.data?.message ?? error?.message,
      });
    } finally {
      setCancellingRepoId(null);
    }
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC':
        return '公开';
      case 'PRIVATE':
        return '私有';

      case 'INTERNAL':
        return '内部';
      default:
        return '私有';
    }
  };

  // 认证状态未初始化时显示加载状态
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在加载...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 主要内容 */}
      <main className="container-responsive py-12">
        <div className="space-y-6">
          {/* 页面标题和搜索 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-medium">我的仓库</h1>
              <p className="text-muted-foreground mt-2">
                管理您导入的 Git 仓库
              </p>
            </div>
          </div>

          {/* 搜索和过滤 */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索仓库..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="按编号定位（ID）"
                value={repoIdInput}
                onChange={e => setRepoIdInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const id = repoIdInput.trim();
                    if (id) void handleGoToRepositoryId(id);
                  }
                }}
                className="w-56"
              />
              <Button
                variant="outline-subtle"
                size="sm"
                onClick={() => {
                  setRepoIdInput('');
                  setRestrictedRepoId(null);
                }}
                disabled={!repoIdInput.trim()}
                aria-label="清空"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="soft"
                size="sm"
                onClick={() => {
                  const id = repoIdInput.trim();
                  if (!id) return;
                  void handleGoToRepositoryId(id);
                }}
              >
                前往
              </Button>
            </div>
          </div>

          {/* 仓库列表 */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full skeleton" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 skeleton rounded w-1/3" />
                      <div className="h-3 skeleton rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : repositories.length === 0 ? (
            <div className="empty-state">
              <GitBranch className="empty-state-icon" />
              <h3 className="empty-state-title">
                {searchQuery ? '未找到匹配的仓库' : '还没有仓库'}
              </h3>
              <p className="empty-state-desc mb-6">
                {searchQuery
                  ? '尝试调整搜索条件或清空搜索框'
                  : '导入您的第一个 Git 仓库开始使用 Relax-Git'}
              </p>
              {!searchQuery && (
                <Button asChild variant="soft">
                  <Link href="/repositories/import">
                    <Plus className="h-4 w-4 mr-2" />
                    导入仓库
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {restrictedRepoId && (
                <div className="card p-6 border-dashed border-muted-foreground/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-muted-foreground">
                            私有仓库
                          </h3>
                          <Badge
                            variant="outline-subtle"
                            className="flex items-center space-x-1"
                          >
                            <Lock className="h-3 w-3" />
                            <span>受限访问</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          您无权访问此仓库的详细信息
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          仓库ID: {restrictedRepoId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isJoinNeeded({
                        visibility: 'PRIVATE',
                        myRole: undefined,
                        isAuthenticated,
                        joinStatus: joinStatuses[restrictedRepoId],
                      }) &&
                        (!isAuthenticated ? (
                          <Button
                            asChild
                            size="sm"
                            onClick={e => e.stopPropagation()}
                          >
                            <Link
                              href={`/auth/login?intent=login&redirect=${encodeURIComponent(`/repositories/${restrictedRepoId}`)}`}
                            >
                              登录后申请加入
                            </Link>
                          </Button>
                        ) : joinStatuses[restrictedRepoId] === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">已申请，等待审核</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={e => {
                                e.stopPropagation();
                                void handleCancelJoin(restrictedRepoId);
                              }}
                              disabled={cancellingRepoId === restrictedRepoId}
                            >
                              {cancellingRepoId === restrictedRepoId && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              )}
                              撤回申请
                            </Button>
                          </div>
                        ) : joinStatuses[restrictedRepoId] === 'approved' ? (
                          <Badge variant="default">已通过</Badge>
                        ) : joinStatuses[restrictedRepoId] === 'rejected' ? (
                          <Badge variant="destructive">已驳回</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              void handleApplyToJoin(restrictedRepoId);
                            }}
                            disabled={applyingRepoId === restrictedRepoId}
                          >
                            {applyingRepoId === restrictedRepoId && (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            {String(
                              joinStatuses[restrictedRepoId] ?? 'none'
                            ) === 'rejected'
                              ? '重新申请加入'
                              : '申请加入'}
                          </Button>
                        ))}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="关闭"
                        onClick={() => setRestrictedRepoId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {repositories.map(repository => (
                <div
                  key={repository.id}
                  className={`card p-6 transition-shadow ${
                    repository.isRestricted
                      ? 'border-dashed border-muted-foreground/30'
                      : 'hover-lift cursor-pointer'
                  }`}
                  onClick={() => handleRepositoryClick(repository)}
                >
                  {repository.isRestricted ? (
                    // 受限仓库卡片
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                          <Lock className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-muted-foreground">
                              私有仓库
                            </h3>
                            <Badge
                              variant="outline-subtle"
                              className="flex items-center space-x-1"
                            >
                              <Lock className="h-3 w-3" />
                              <span>受限访问</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {repository.restrictionReason ||
                              '您无权访问此仓库的详细信息'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            仓库ID: {repository.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isJoinNeeded({
                          visibility: repository.visibility,
                          myRole: undefined,
                          isAuthenticated,
                          joinStatus: joinStatuses[repository.id],
                        }) &&
                          (joinStatuses[repository.id] === 'pending' ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                已申请，等待审核
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={e => {
                                  e.stopPropagation();
                                  void handleCancelJoin(repository.id);
                                }}
                                disabled={cancellingRepoId === repository.id}
                              >
                                {cancellingRepoId === repository.id && (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                撤回申请
                              </Button>
                            </div>
                          ) : joinStatuses[repository.id] === 'approved' ? (
                            <Badge variant="default">已通过</Badge>
                          ) : joinStatuses[repository.id] === 'rejected' ? (
                            <Badge variant="destructive">已驳回</Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={e => {
                                e.stopPropagation();
                                handleApplyToJoin(repository.id);
                              }}
                              disabled={applyingRepoId === repository.id}
                            >
                              {applyingRepoId === repository.id && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              )}
                              {String(joinStatuses[repository.id] ?? 'none') ===
                              'rejected'
                                ? '重新申请加入'
                                : '申请加入'}
                            </Button>
                          ))}
                      </div>
                    </div>
                  ) : (
                    // 正常仓库卡片
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold hover:text-primary">
                            {repository.name}
                          </h3>
                          <Badge
                            variant="outline-subtle"
                            className="flex items-center space-x-1"
                          >
                            {getVisibilityIcon(repository.visibility)}
                            <span>
                              {getVisibilityText(repository.visibility)}
                            </span>
                          </Badge>
                        </div>

                        {repository.description && (
                          <p className="text-muted-foreground mb-3">
                            {repository.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <GitBranch className="h-4 w-4" />
                            <span>{repository.defaultBranch}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(
                                repository.createdAt
                              ).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-right">
                        <p className="text-sm text-muted-foreground mr-1">
                          所有者: {repository.owner.username}
                        </p>
                        {user?.id === repository.owner.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="设置"
                            onClick={e => {
                              e.stopPropagation();
                              openSettings(repository);
                            }}
                            title="设置"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline-subtle"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {currentPage} 页，共 {totalPages} 页
              </span>
              <Button
                variant="outline-subtle"
                size="sm"
                onClick={() =>
                  setCurrentPage(prev => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </div>
      </main>
      {settingsRepo && (
        <RepositorySettingsDialog
          open={settingsOpen}
          repo={settingsRepo as any}
          onClose={() => {
            setSettingsOpen(false);
            setSettingsRepo(null);
          }}
          onUpdated={updated => {
            if ((updated as any).deleted) {
              setRepositories(prev => prev.filter(r => r.id !== updated.id));
              setSettingsOpen(false);
              setSettingsRepo(null);
              return;
            }
            setRepositories(prev =>
              prev.map(r =>
                r.id === updated.id
                  ? {
                      ...r,
                      ...(updated.name ? { name: updated.name as any } : {}),
                      ...(updated.description !== undefined
                        ? { description: updated.description as any }
                        : {}),
                      ...(updated.visibility
                        ? { visibility: updated.visibility as any }
                        : {}),
                      ...(updated.coverImage !== undefined
                        ? { coverImage: updated.coverImage as any }
                        : {}),
                      ...(updated.isPublished !== undefined
                        ? { isPublished: updated.isPublished as any }
                        : {}),
                      ...(updated.publishedAt !== undefined
                        ? { publishedAt: updated.publishedAt as any }
                        : {}),
                    }
                  : r
              )
            );
          }}
        />
      )}
    </div>
  );
}
