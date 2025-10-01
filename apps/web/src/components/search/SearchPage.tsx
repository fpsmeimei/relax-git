import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/hooks/use-auth';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
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
      <Container maxWidth="lg">
        <Box py={6} display="flex" alignItems="center" justifyContent="center">
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            校验访问权限...
          </Typography>
        </Box>
      </Container>
    );
  }

  // 受限占位：显示“受限卡片 + 申请加入 CTA”
  if (isRestricted) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Card className="hover-lift">
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
              >
                <Box>
                  <Typography variant="h6">私有仓库</Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      受限访问：您无权查看该仓库详情或进行搜索
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    仓库ID: {repositoryId}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  {isJoinNeeded({
                    visibility: 'PRIVATE',
                    myRole: undefined,
                    isAuthenticated,
                    joinStatus,
                  }) &&
                    (!isAuthenticated ? (
                      <Button variant="contained" href={loginUrl}>
                        登录后申请加入
                      </Button>
                    ) : joinStatus === 'pending' ? (
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Button variant="outlined" disabled>
                          已申请，等待审核
                        </Button>
                        <Button
                          variant="outlined"
                          color="inherit"
                          onClick={() => void handleCancelJoin()}
                          disabled={cancelling}
                          sx={{ ml: 0.5 }}
                        >
                          {cancelling ? '撤回中…' : '撤回申请'}
                        </Button>
                      </Box>
                    ) : joinStatus === 'approved' ? (
                      <Button variant="outlined" disabled>
                        已通过，请稍后重试
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={() => void handleApplyToJoin()}
                        disabled={applying}
                      >
                        {applying && (
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                        )}
                        {joinStatus === 'rejected'
                          ? '重新申请加入'
                          : '申请加入'}
                      </Button>
                    ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={3}>
        <Paper className="hover-lift" sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="搜索" />
            <Tab label="历史记录" />
          </Tabs>
        </Paper>

        <Grid container spacing={3}>
          {activeTab === 0 && (
            <>
              <Grid item xs={12}>
                <SearchForm
                  repositoryId={repositoryId}
                  repositoryName={repositoryName}
                  {...(snapshotId ? { snapshotId } : {})}
                  {...(snapshotTitle ? { snapshotTitle } : {})}
                  onSearchStart={handleSearchStart}
                />
              </Grid>
              <Grid item xs={12}>
                <SearchResults {...(onFileOpen ? { onFileOpen } : {})} />
              </Grid>
            </>
          )}

          {activeTab === 1 && (
            <Grid item xs={12}>
              <SearchHistory
                repositoryId={repositoryId}
                onHistoryItemClick={handleHistoryItemClick}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};
