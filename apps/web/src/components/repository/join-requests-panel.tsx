'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Check, X, Loader2, Search, UserCheck } from 'lucide-react';
import { formatSmartTime } from '@/lib/utils/format-time';

interface JoinRequest {
  id: string;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

interface JoinRequestsResponse {
  items: JoinRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface JoinRequestsPanelProps {
  repositoryId: string;
  isOwner: boolean;
}

/**
 * 管理员审批界面组件
 */
export function JoinRequestsPanel({
  repositoryId,
  isOwner,
}: JoinRequestsPanelProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('PENDING');
  const [page, setPage] = useState(1);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // 查询加入申请列表
  const { data, isLoading, refetch } = useQuery<JoinRequestsResponse>({
    queryKey: ['join-requests', repositoryId, status, search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const response = await apiClient.get(
        `/repositories/${repositoryId}/join-requests?${params.toString()}`
      );
      return response.data;
    },
    enabled: isOwner, // 仅所有者可见
  });

  // 批准申请
  const handleApprove = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      await apiClient.post(
        `/repositories/${repositoryId}/join-requests/${requestId}/approve`
      );
      toast.success('已批准申请');
      refetch();

      // 刷新成员列表（如果有的话）
      queryClient.invalidateQueries({
        queryKey: ['repository-members', repositoryId],
      });
    } catch (error: any) {
      console.error('批准失败:', error);
      toast.error(error?.response?.data?.message || '批准失败，请重试');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  // 拒绝申请
  const handleReject = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      await apiClient.post(
        `/repositories/${repositoryId}/join-requests/${requestId}/reject`
      );
      toast.success('已拒绝申请');
      refetch();
    } catch (error: any) {
      console.error('拒绝失败:', error);
      toast.error(error?.response?.data?.message || '拒绝失败，请重试');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  // 批量批准
  const handleBatchApprove = async () => {
    if (!data?.items.length) return;

    const pendingIds = data.items
      .filter(item => item.status === 'PENDING')
      .map(item => item.id);

    if (pendingIds.length === 0) {
      toast.info('没有待处理的申请');
      return;
    }

    try {
      await apiClient.post(
        `/repositories/${repositoryId}/join-requests/batch-review`,
        {
          ids: pendingIds,
          approve: true,
        }
      );
      toast.success(`已批量批准 ${pendingIds.length} 个申请`);
      refetch();
      queryClient.invalidateQueries({
        queryKey: ['repository-members', repositoryId],
      });
    } catch (error: any) {
      console.error('批量批准失败:', error);
      toast.error(error?.response?.data?.message || '批量批准失败');
    }
  };

  // 非所有者不显示
  if (!isOwner) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              成员申请管理
            </CardTitle>
            <CardDescription>审批仓库成员加入申请</CardDescription>
          </div>
          {data?.pagination.total ? (
            <Badge variant="secondary">{data.pagination.total} 个申请</Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 搜索和筛选 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索申请人用户名..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">待审批</SelectItem>
              <SelectItem value="APPROVED">已批准</SelectItem>
              <SelectItem value="REJECTED">已拒绝</SelectItem>
            </SelectContent>
          </Select>
          {status === 'PENDING' && data?.items.length ? (
            <Button variant="outline" size="sm" onClick={handleBatchApprove}>
              批量批准
            </Button>
          ) : null}
        </div>

        {/* 申请列表 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.items.length ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无申请记录
          </div>
        ) : (
          <div className="space-y-3">
            {data.items.map(request => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar>
                    <AvatarImage src={request.user.avatar || undefined} />
                    <AvatarFallback>
                      {request.user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {request.user.username}
                      </p>
                      <Badge
                        variant={
                          request.status === 'APPROVED'
                            ? 'default'
                            : request.status === 'REJECTED'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {request.status === 'PENDING'
                          ? '待审批'
                          : request.status === 'APPROVED'
                            ? '已批准'
                            : '已拒绝'}
                      </Badge>
                    </div>
                    {request.reason && (
                      <p className="text-sm text-muted-foreground truncate">
                        {request.reason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatSmartTime(request.createdAt)}
                    </p>
                  </div>
                </div>

                {/* 操作按钮 */}
                {request.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApprove(request.id)}
                      disabled={processingIds.has(request.id)}
                    >
                      {processingIds.has(request.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(request.id)}
                      disabled={processingIds.has(request.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        {data && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              第 {data.pagination.page} 页，共 {data.pagination.pages} 页
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= data.pagination.pages}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
