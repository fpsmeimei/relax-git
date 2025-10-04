'use client';

import { JoinRequestsPanel } from '@/components/repository/join-requests-panel';
import { MembersList } from '@/components/repository/members-list';
import { MembershipButton } from '@/components/repository/membership-button';
import { RepositoryDiscussion } from '@/components/repository/repository-discussion';
import { EmptyHint } from '@/components/snapshot/empty-hint';
import { FeedbackBanner } from '@/components/snapshot/feedback-banner';
import { LoadingHint } from '@/components/snapshot/loading-hint';
import { SnapshotCodeViewer } from '@/components/snapshot/snapshot-code-viewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRepositoryPermission } from '@/hooks/use-repository-permission';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/services/apiClient';
import { useAppStore } from '@/stores/app-store';
import { useAuth } from '@/stores/auth-store';
import {
  ArrowLeft,
  Calendar,
  Copy,
  ExternalLink,
  GitBranch,
  Globe,
  Loader2,
  Lock,
  LogOut,
  MessageSquare,
  Trash2,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface BranchInfo {
  id: string;
  name: string;
  isDefault: boolean;
  commitSha: string;
}

// 子页面组件（暂时用占位符）
const RepositoryOverview = ({ repository }: { repository: Repository }) => (
  <div className="space-y-6">
    <div className="card p-6 bg-card text-card-foreground">
      <h3 className="text-lg font-semibold mb-4 text-foreground">仓库概览</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">默认分支</span>
          <span className="font-medium text-foreground">
            {repository.defaultBranch}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">可见性</span>
          <span className="font-medium text-foreground">
            {getVisibilityText(repository.visibility)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">创建时间</span>
          <span className="font-medium text-foreground">
            {new Date(repository.createdAt).toLocaleDateString('zh-CN')}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const STORAGE_KEY = 'rg_repo_session';

const RepositoryBranches = ({ repositoryId }: { repositoryId: string }) => {
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [defaultBranch, setDefaultBranch] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [sessionSnapshotId, setSessionSnapshotId] = useState<string | null>(
    null
  );
  const [commitSha, setCommitSha] = useState<string>('');
  const [branchesError, setBranchesError] = useState<string | null>(null);

  // 恢复本地存储的会话
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        repositoryId: string;
        branchId: string;
        snapshotId: string;
        commitSha: string;
      } | null;
      if (
        parsed &&
        parsed.repositoryId === repositoryId &&
        parsed.snapshotId &&
        parsed.branchId
      ) {
        setSelectedBranchId(parsed.branchId);
        setSessionSnapshotId(parsed.snapshotId);
        setCommitSha(parsed.commitSha);
      }
    } catch {
      // ignore
    }
  }, [repositoryId]);

  const loadBranches = useCallback(async () => {
    try {
      setLoading(true);
      setBranchesError(null);
      const { data } = await apiClient.get<{
        branches: BranchInfo[];
        defaultBranch: string;
      }>(`/repositories/${repositoryId}/branches`);
      setBranches(data.branches || []);
      setDefaultBranch(data.defaultBranch || '');
      // 选择默认分支或第一个分支
      const defaultBranchInfo =
        data.branches?.find(b => b.isDefault) || data.branches?.[0];
      if (defaultBranchInfo) {
        setSelectedBranchId(defaultBranchInfo.id);
      }
    } catch (e: any) {
      setBranchesError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, [repositoryId]);

  useEffect(() => {
    void loadBranches();
  }, [loadBranches]);

  const handleCreateSnapshot = useCallback(async () => {
    if (!selectedBranchId) return;

    const selectedBranch = branches.find(b => b.id === selectedBranchId);
    if (!selectedBranch) return;

    try {
      setCreating(true);
      // 0) 确保基础快照(artifact)就绪
      const ensureResp = await apiClient.get<any>(
        `/artifacts/by-branch/${repositoryId}/${selectedBranchId}`
      );
      const artifactId = ensureResp?.data?.id as string | undefined;
      if (!artifactId) {
        toast({ title: '准备失败', description: '未返回基础快照ID' });
        return;
      }

      const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
      const aStart = Date.now();
      let aReady = false;
      let retried = false;
      while (Date.now() - aStart < 75000) {
        try {
          const { data: stResp } = await apiClient.get<any>(
            `/artifacts/${artifactId}/status`
          );
          const st = (stResp as any)?.status as string | undefined;
          if (st === 'READY') {
            aReady = true;
            break;
          }
          if (st === 'FAILED' && !retried) {
            // 失败时尝试重试一次（仅OWNER/ADMIN生效，其它角色可能403，忽略）
            try {
              await apiClient.post(`/artifacts/${artifactId}/retry`);
            } catch {}
            retried = true;
          }
        } catch {
          // 忽略，继续轮询
        }
        await sleep(2000);
      }

      if (!aReady) {
        toast({
          title: '基础快照准备超时',
          description: '构建环境可能繁忙，请稍后重试或切换分支后再试',
        });
        return;
      }

      // 1) 创建会话
      const resp = await apiClient.post<any>(
        `/snapshots/session/${repositoryId}/branches/${selectedBranchId}`
      );
      const sessionSnapshot = resp.data;
      if (!sessionSnapshot?.id) {
        toast({ title: '创建会话失败', description: '未返回会话ID' });
        return;
      }

      // 2) 轮询就绪（最多60s）
      const id = sessionSnapshot.id as string;
      const start = Date.now();
      let ready = false;
      while (Date.now() - start < 60000) {
        try {
          const { data } = await apiClient.get(`/snapshots/${id}`);
          const st = (data as any)?.status as string | undefined;
          if (st === 'READY') {
            ready = true;
            break;
          }
          if (st === 'FAILED' || st === 'EXPIRED') {
            throw new Error('会话快照创建失败');
          }
        } catch {
          // 忽略，继续轮询
        }
        await sleep(1500);
      }

      if (!ready) {
        toast({
          title: '准备超时',
          description: '环境准备较慢，请稍后重试或点击重新创建',
        });
        return;
      }

      // 3) 写入本地并展示浏览器
      setSessionSnapshotId(id);
      setCommitSha(selectedBranch.commitSha);
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            repositoryId,
            branchId: selectedBranchId,
            snapshotId: id,
            commitSha: selectedBranch.commitSha,
          })
        );
      } catch {}
      toast({
        title: '代码浏览准备完成',
        description: `已为分支 ${selectedBranch.name} 创建浏览会话`,
      });
    } catch (e: any) {
      toast({ title: '创建会话失败', description: String(e?.message || e) });
    } finally {
      setCreating(false);
    }
  }, [repositoryId, selectedBranchId, branches]);

  // 会话结束或切换时清理本地存储
  useEffect(() => {
    if (!sessionSnapshotId) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed?.repositoryId === repositoryId) {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {}
    }
  }, [sessionSnapshotId, repositoryId]);

  // 会话快照TTL保活：每4分钟延长一次（若存在会话）
  useEffect(() => {
    if (!sessionSnapshotId) return;
    const id = sessionSnapshotId;
    const timer = setInterval(
      () => {
        void apiClient.post(`/snapshots/${id}/extend`).catch(() => {
          // 静默失败，避免打扰
        });
      },
      4 * 60 * 1000
    );
    return () => clearInterval(timer);
  }, [sessionSnapshotId]);

  // 自动校验并恢复：如果本地存在session但后端未就绪或不存在，则自动重建一次
  useEffect(() => {
    if (!sessionSnapshotId || !selectedBranchId) return;
    let cancelled = false;
    let tried = false;
    (async () => {
      try {
        const { data } = await apiClient.get(`/snapshots/${sessionSnapshotId}`);
        const st = (data as any)?.status as string | undefined;
        if (st === 'READY') return;
      } catch (e: any) {
        // 404 或其它错误都尝试重建一次
      }
      if (!cancelled && !tried) {
        tried = true;
        await handleCreateSnapshot();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionSnapshotId, selectedBranchId, handleCreateSnapshot]);

  return (
    <div className="space-y-4">
      <div className="card p-4 bg-card text-card-foreground">
        <h3 className="text-lg font-semibold mb-3 text-foreground">
          分支与代码浏览
        </h3>
        {loading ? (
          <LoadingHint message={'加载分支中...'} className="text-sm" />
        ) : branchesError ? (
          <FeedbackBanner
            variant="error"
            message={<>分支加载失败：{branchesError}</>}
            retryLabel="重试"
            onRetry={() => void loadBranches()}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {branches.length === 0 ? (
              <EmptyHint message={'未检测到远程分支'} className="text-sm" />
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground">选择分支：</span>
                <select
                  className="border border-border bg-background text-foreground rounded px-2 py-1 text-sm"
                  value={selectedBranchId}
                  onChange={e => setSelectedBranchId(e.target.value)}
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.isDefault ? '(默认)' : ''}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  variant="soft"
                  className="halo-accent halo-accent-pulse"
                  onClick={() => void handleCreateSnapshot()}
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />{' '}
                      准备浏览...
                    </>
                  ) : (
                    '浏览代码'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {sessionSnapshotId && (
        <div className="overflow-hidden">
          <SnapshotCodeViewer
            snapshotId={sessionSnapshotId}
            commitSha={commitSha}
            onInvalid={() => {
              try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                  const parsed = JSON.parse(raw);
                  if (parsed?.repositoryId === repositoryId) {
                    localStorage.removeItem(STORAGE_KEY);
                  }
                }
              } catch {}
              toast({
                title: '会话已失效',
                description: '可能已过期或被清理，请重新创建浏览会话',
                variant: 'warning',
              });
              // 自动尝试重建
              if (!creating) {
                void handleCreateSnapshot();
              }
            }}
            onRecover={() => void handleCreateSnapshot()}
          />
        </div>
      )}
    </div>
  );
};

const RepositoryMembers = ({
  repositoryId,
  myRole,
}: {
  repositoryId: string;
  myRole: string | null;
}) => {
  const isOwner = myRole === 'OWNER';

  return (
    <div className="space-y-6">
      {/* 管理员审批界面 - 仅所有者可见 */}
      {isOwner && (
        <JoinRequestsPanel repositoryId={repositoryId} isOwner={isOwner} />
      )}

      {/* 成员列表 */}
      <div className="card p-6 bg-card text-card-foreground">
        <h3 className="text-lg font-semibold mb-4 text-foreground">成员列表</h3>
        <MembersList
          repositoryId={repositoryId}
          myRole={myRole as 'OWNER' | 'ADMIN' | 'MEMBER' | null}
        />
      </div>
    </div>
  );
};

interface Repository {
  id: string;
  name: string;
  description?: string;
  gitUrl: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INTERNAL';
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  lastSyncAt?: string;
  owner: {
    id: string;
    username: string;
  };
}

type TabType = 'overview' | 'branches' | 'discussion' | 'members';

// 辅助函数
const getVisibilityIcon = (visibility: string) => {
  switch (visibility) {
    case 'PUBLIC':
      return <Globe className="h-4 w-4" />;
    case 'PRIVATE':
      return <Lock className="h-4 w-4" />;
    default:
      return <Users className="h-4 w-4" />;
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
      return '未知';
  }
};

export default function RepositoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const repositoryId = params['id'] as string;

  const { setCurrentRepository } = useAppStore();

  const [repository, setRepository] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(true);
  const [repoError, setRepoError] = useState<string | null>(null);

  // 从URL参数获取默认标签页
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const handleTabChange = useCallback(
    (tab: TabType) => {
      setActiveTab(tab);
      try {
        const nextParams = new URLSearchParams(searchParams?.toString() ?? '');
        if (tab === 'overview') {
          nextParams.delete('tab');
        } else {
          nextParams.set('tab', tab);
        }
        const query = nextParams.toString();
        router.replace(`${pathname}${query ? `?${query}` : ''}`, {
          scroll: false,
        });
      } catch {}
    },
    [pathname, router, searchParams]
  );

  // 监听URL参数变化
  useEffect(() => {
    const tabFromUrl = searchParams?.get('tab') as TabType | null;
    if (
      tabFromUrl &&
      ['overview', 'branches', 'discussion', 'members'].includes(tabFromUrl)
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // 加入申请状态
  const [joinStatus, setJoinStatus] = useState<
    'loading' | 'member' | 'pending' | 'rejected' | 'approved' | 'none'
  >('loading');
  const [joinApplying, setJoinApplying] = useState(false);
  const [joinCancelling, setJoinCancelling] = useState(false);
  const [myRole, setMyRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER' | null>(
    null
  );
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 访问权限
  const [accessDenied, setAccessDenied] = useState<boolean>(false);

  // 使用权限 Hook
  const permissions = useRepositoryPermission(
    repository
      ? {
          id: repository.id,
          visibility: repository.visibility,
          ownerId: repository.owner.id,
        }
      : null
  );

  // 加载仓库信息
  const loadRepository = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/repositories/${repositoryId}`);
      const repo = response.data;
      setRepository(repo);
      setRepoError(null);
      setCurrentRepository({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.gitUrl,
        visibility: repo.visibility,
        defaultBranch: repo.defaultBranch,
        createdAt: repo.createdAt,
        updatedAt: repo.updatedAt,
      });
    } catch (error: any) {
      if (error?.response?.status === 403) {
        setAccessDenied(true);
        setRepoError(null);
      } else {
        setRepoError(
          error?.response?.data?.message || error?.message || '无法加载仓库信息'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [repositoryId, setCurrentRepository]);

  // 加载我的角色和加入状态
  const loadMyStatus = useCallback(async () => {
    if (!isAuthenticated) {
      setJoinStatus('none');
      return;
    }

    try {
      const response = await apiClient.get(
        `/repositories/${repositoryId}/my-status`
      );
      const { role, joinRequest } = response.data;

      setMyRole(role);

      if (role) {
        setJoinStatus('member');
      } else if (joinRequest) {
        setJoinStatus(joinRequest.status.toLowerCase());
      } else {
        setJoinStatus('none');
      }
    } catch (error) {
      setJoinStatus('none');
    }
  }, [repositoryId, isAuthenticated]);

  useEffect(() => {
    loadRepository();
    loadMyStatus();
  }, [loadRepository, loadMyStatus]);

  // 申请加入
  const handleApplyJoin = async () => {
    try {
      setJoinApplying(true);
      await apiClient.post(`/repositories/${repositoryId}/join-requests`, {
        reason: '希望加入此项目',
      });
      setJoinStatus('pending');
      toast({ title: '申请已提交', description: '请等待管理员审核' });
    } catch (error: any) {
      toast({
        title: '申请失败',
        description: error?.response?.data?.message || '提交申请时出错',
        variant: 'destructive',
      });
    } finally {
      setJoinApplying(false);
    }
  };

  // 撤回申请
  const handleCancelJoin = async () => {
    try {
      setJoinCancelling(true);
      await apiClient.delete(`/repositories/${repositoryId}/join-requests/my`);
      setJoinStatus('none');
      toast({ title: '已撤回申请' });
    } catch (error: any) {
      toast({
        title: '撤回失败',
        description: error?.response?.data?.message || '撤回申请时出错',
        variant: 'destructive',
      });
    } finally {
      setJoinCancelling(false);
    }
  };

  // 复制仓库编号
  const handleCopyId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(String(repositoryId));
      toast({ title: '已复制编号', description: `ID: ${repositoryId}` });
    } catch (e: any) {
      toast({
        title: '复制失败',
        description: e?.message || '无法复制到剪贴板',
        variant: 'destructive',
      });
    }
  }, [repositoryId]);

  // 退出仓库（成员自退）
  const handleLeaveRepo = useCallback(async () => {
    if (!myRole) return; // 非成员不显示按钮
    try {
      setLeaving(true);
      await apiClient.delete(`/repositories/${repositoryId}/members/me`);
      toast({ title: '已退出仓库' });
      router.push('/repositories');
    } catch (error: any) {
      toast({
        title: '退出失败',
        description: error?.response?.data?.message || '无法退出该仓库',
        variant: 'destructive',
      });
    } finally {
      setLeaving(false);
    }
  }, [repositoryId, myRole, router]);

  // 删除仓库（仅所有者可操作）
  const handleDeleteRepo = useCallback(async () => {
    console.log(
      'Delete button clicked, myRole:',
      myRole,
      'repository:',
      repository?.name
    );

    if (myRole !== 'OWNER') {
      console.log('Not owner, cannot delete');
      toast({
        title: '权限不足',
        description: '只有仓库所有者才能删除仓库',
        variant: 'destructive',
      });
      return;
    }

    const confirmed = window.confirm(
      `确定要删除仓库 "${repository?.name}" 吗？\n\n此操作不可撤销，将删除所有相关数据（快照、评论等）。`
    );

    if (!confirmed) {
      console.log('User cancelled deletion');
      return;
    }

    try {
      console.log('Starting deletion process...');
      setDeleting(true);
      await apiClient.delete(`/repositories/${repositoryId}`);
      toast({
        title: '仓库已删除',
        description: `仓库 "${repository?.name}" 已成功删除`,
      });
      router.push('/repositories');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: '删除失败',
        description:
          error?.response?.data?.message || error?.message || '无法删除该仓库',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  }, [repositoryId, myRole, repository?.name, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingHint
            message={'加载中...'}
            withSpinner
            className="text-base"
            iconClassName="h-5 w-5"
          />
        </div>
      </div>
    );
  }

  if (repoError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md">
          <FeedbackBanner
            variant="error"
            message={<>仓库信息加载失败：{repoError}</>}
            retryLabel="重试"
            onRetry={() => void loadRepository()}
          />
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container-responsive py-12">
          <div className="space-y-6">
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
                      仓库ID: {repositoryId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* 简化的申请按钮 - 访问被拒场景 */}
                  {!myRole && isAuthenticated && (
                    <MembershipButton
                      repositoryId={repositoryId}
                      isOwner={false}
                      isMember={false}
                      applicationStatus={
                        joinStatus === 'pending'
                          ? 'pending'
                          : joinStatus === 'approved'
                            ? 'approved'
                            : joinStatus === 'rejected'
                              ? 'rejected'
                              : 'none'
                      }
                      canApply={true}
                    />
                  )}
                  {!isAuthenticated && (
                    <Button asChild variant="soft" size="sm">
                      <Link
                        href={`/auth/login?intent=login&redirect=${encodeURIComponent(`/repositories/${repositoryId}`)}`}
                      >
                        登录后申请加入
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/repositories">返回列表</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">仓库不存在</h2>
          <p className="text-muted-foreground mb-4">仓库 ID 无效或已删除</p>
          <Button asChild variant="soft">
            <Link href="/repositories">返回仓库列表</Link>
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: '概览', icon: GitBranch },
    { id: 'branches', label: '分支', icon: GitBranch },
    { id: 'discussion', label: '讨论', icon: MessageSquare },
    ...(myRole ? [{ id: 'members', label: '成员', icon: Users }] : []),
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <nav className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container-responsive flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/repositories" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <GitBranch className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">{repository.name}</span>
            </Link>
            <Badge
              variant="outline-subtle"
              className="flex items-center space-x-1"
            >
              {getVisibilityIcon(repository.visibility)}
              <span>{getVisibilityText(repository.visibility)}</span>
            </Badge>
            {myRole && (
              <Badge variant="secondary">
                {myRole === 'OWNER'
                  ? '所有者'
                  : myRole === 'ADMIN'
                    ? '管理员'
                    : '成员'}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline-subtle"
              size="sm"
              onClick={() => {
                console.log('Git URL button clicked:', repository.gitUrl);
                window.open(repository.gitUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Git 地址
            </Button>

            {/* 复制编号 */}
            <Button
              variant="outline-subtle"
              size="sm"
              onClick={() => void handleCopyId()}
            >
              <Copy className="h-4 w-4 mr-2" /> 复制编号
            </Button>

            {/* 退出仓库：仅成员可见，后端会保护"最后一个 OWNER 不可自删" */}
            {myRole && myRole !== 'OWNER' && (
              <Button
                variant="outline-subtle"
                size="sm"
                onClick={() => void handleLeaveRepo()}
                disabled={leaving}
              >
                {leaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                退出仓库
              </Button>
            )}

            {/* 删除仓库：仅所有者可见 */}
            {myRole === 'OWNER' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Delete button clicked event triggered');
                  handleDeleteRepo();
                }}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                删除仓库
              </Button>
            )}

            {/* 成员申请按钮 - 使用新组件 */}
            {repository && (
              <MembershipButton
                repositoryId={repository.id}
                isOwner={permissions.isOwner}
                isMember={permissions.isMember}
                applicationStatus={permissions.applicationStatus || 'none'}
                canApply={permissions.canApply}
              />
            )}
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="container-responsive py-4">
        <div className="space-y-4">
          {/* 仓库基本信息 */}
          <div className="card p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{repository.name}</h1>
                {repository.description && (
                  <p className="text-muted-foreground mb-4">
                    {repository.description}
                  </p>
                )}
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <GitBranch className="h-4 w-4" />
                    <span>默认分支: {repository.defaultBranch}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      创建时间:{' '}
                      {new Date(repository.createdAt).toLocaleDateString(
                        'zh-CN'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 标签页导航 */}
          <div className="border-b">
            <nav className="flex space-x-8">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as TabType)}
                    className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 标签页内容 */}
          <div>
            {activeTab === 'overview' && (
              <RepositoryOverview repository={repository} />
            )}
            {activeTab === 'branches' && (
              <RepositoryBranches repositoryId={repositoryId} />
            )}
            {activeTab === 'discussion' && (
              <RepositoryDiscussion repositoryId={repositoryId} />
            )}
            {activeTab === 'members' && myRole && (
              <RepositoryMembers repositoryId={repositoryId} myRole={myRole} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
