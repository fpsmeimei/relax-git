import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Lock, LogIn, Search, Clock3 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSearchStore } from '../../stores/searchStore';
import { SearchType } from '../../types/search';
import { SearchForm } from './SearchForm';
import { SearchHistory } from './SearchHistory';
import { SearchResults } from './SearchResults';

import { toast } from '@/hooks/use-toast';

import { isJoinNeeded } from '@/lib/repo-access';

interface SearchPageProps {
  repositoryId: string;
  repositoryName: string;
  snapshotId?: string;
  snapshotTitle?: string;
  onFileOpen?: (filePath: string, lineNumber?: number) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  repositoryId,
  repositoryName,
  snapshotId,
  snapshotTitle,
  onFileOpen,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const { setSearchForm } = useSearchStore();
  const { isAuthenticated } = useAuth();

  // 访问校验与受限占位状态
  const [accessLoading, setAccessLoading] = useState<boolean>(true);
  const [isRestricted, setIsRestricted] = useState<boolean>(false);
  const [joinStatus, setJoinStatus] = useState<
    'none' | 'pending' | 'approved' | 'rejected' | 'loading'
  >('loading');
  const [applying, setApplying] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setAccessLoading(true);
        setIsRestricted(false);
        // 尝试读取仓库详情，判断是否有访问权限
        await apiClient.get(`/repositories/${repositoryId}`);
        if (!cancelled) {
          setIsRestricted(false);
          setJoinStatus('none');
        }
      } catch (e: any) {
        const status = e?.response?.status ?? 0;
        if (status === 403) {
          if (!cancelled) setIsRestricted(true);
          // 若已登录，查询我在该仓库的加入状态
          if (isAuthenticated) {
            try {
              const { data } = await apiClient.get<{ status: string }>(
                `/repositories/${repositoryId}/join-requests/me`
              );
              const s = String((data as any)?.status || 'none').toLowerCase();
              if (!cancelled)
                setJoinStatus(
                  (['pending', 'approved', 'rejected'] as const).includes(
                    s as any
                  )
                    ? (s as any)
                    : 'none'
                );
            } catch {
              if (!cancelled) setJoinStatus('none');
            }
          } else {
            if (!cancelled) setJoinStatus('none');
          }
        } else {
          // 其它错误：按可访问处理，仅不阻断搜索 UI
          if (!cancelled) {
            setIsRestricted(false);
            setJoinStatus('none');
          }
        }
      } finally {
        if (!cancelled) setAccessLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [repositoryId, isAuthenticated]);

  const handleApplyToJoin = async () => {
    try {
      setApplying(true);
      const { applyToJoin } = await import('@/lib/join-requests');
      const { nextStatus, message } = await applyToJoin(repositoryId);
      setJoinStatus(nextStatus as any);
      toast({ title: message });
    } catch (error: any) {
      toast({
        title: '申请失败',
        description: error?.response?.data?.message || '请稍后重试',
      });
    } finally {
      setApplying(false);
    }
  };

  const loginUrl = `/auth/login?intent=login&redirect=${encodeURIComponent(
    `/repositories/${repositoryId}`
  )}`;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearchStart = () => {
    // 搜索开始时切换到结果标签页
    setActiveTab(0);
  };

  const handleHistoryItemClick = (query: string, searchType: SearchType) => {
    // 点击历史记录时，填充搜索表单并切换到搜索标签页
    setSearchForm({ query, searchType });
    setActiveTab(0);
  };

  const handleCancelJoin = async () => {
    try {
      setCancelling(true);
      const { cancelJoin } = await import('@/lib/join-requests');
      const { nextStatus, message } = await cancelJoin(repositoryId);
      setJoinStatus(nextStatus as any);
      toast({ title: message });
    } catch (error: any) {
      toast({
        title: '撤回失败',
        description: error?.response?.data?.message ?? error?.message,
      });
    } finally {
      setCancelling(false);
    }
  };

  // 权限校验中
  if (accessLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <Card className="border-border/60 bg-card/90 shadow-sm">
          <CardContent className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              校验访问权限...
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 受限占位：显示“受限卡片 + 申请加入 CTA”
  if (isRestricted) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <Card className="border-border/60 bg-card/90 shadow-sm">
          <CardContent className="space-y-6 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  私有仓库
                </h2>
                <p className="text-sm text-muted-foreground">
                  受限访问：您无权查看该仓库详情或进行搜索
                </p>
                <p className="text-xs text-muted-foreground">
                  仓库ID: {repositoryId}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isJoinNeeded({
                visibility: 'PRIVATE',
                myRole: undefined,
                isAuthenticated,
                joinStatus,
              }) ? (
                !isAuthenticated ? (
                  <Button asChild>
                    <a href={loginUrl}>
                      <LogIn className="mr-2 h-4 w-4" />
                      登录后申请加入
                    </a>
                  </Button>
                ) : joinStatus === 'pending' ? (
                  <>
                    <Button variant="outline" disabled>
                      已申请，等待审核
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void handleCancelJoin()}
                      disabled={cancelling}
                    >
                      {cancelling ? '撤回中…' : '撤回申请'}
                    </Button>
                  </>
                ) : joinStatus === 'approved' ? (
                  <Button variant="outline" disabled>
                    已通过，请稍后重试
                  </Button>
                ) : (
                  <Button
                    onClick={() => void handleApplyToJoin()}
                    disabled={applying}
                  >
                    {applying ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {joinStatus === 'rejected' ? '重新申请加入' : '申请加入'}
                  </Button>
                )
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 0, label: '搜索', icon: Search },
    { id: 1, label: '历史记录', icon: Clock3 },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-4 flex rounded-2xl border border-border/60 bg-card/80 p-1 shadow-sm">
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4">
        {activeTab === 0 ? (
          <>
            <SearchForm
              repositoryId={repositoryId}
              repositoryName={repositoryName}
              {...(snapshotId ? { snapshotId } : {})}
              {...(snapshotTitle ? { snapshotTitle } : {})}
              onSearchStart={handleSearchStart}
            />
            <SearchResults {...(onFileOpen ? { onFileOpen } : {})} />
          </>
        ) : (
          <SearchHistory
            repositoryId={repositoryId}
            onHistoryItemClick={handleHistoryItemClick}
          />
        )}
      </div>
    </div>
  );
};
