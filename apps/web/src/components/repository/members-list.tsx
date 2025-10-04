'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Search, UserMinus, Shield, Loader2, Crown } from 'lucide-react';
import { formatSmartTime } from '@/lib/utils/format-time';

interface Member {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
    email?: string;
  };
}

interface MembersResponse {
  items: Member[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface MembersListProps {
  repositoryId: string;
  myRole: 'OWNER' | 'ADMIN' | 'MEMBER' | null;
}

const roleConfig = {
  OWNER: {
    label: '所有者',
    icon: Crown,
    variant: 'default' as const,
    className:
      'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  },
  ADMIN: {
    label: '管理员',
    icon: Shield,
    variant: 'secondary' as const,
    className:
      'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  },
  MEMBER: {
    label: '成员',
    icon: null,
    variant: 'outline' as const,
    className: '',
  },
};

export function MembersList({ repositoryId, myRole }: MembersListProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const queryClient = useQueryClient();

  const canManage = myRole === 'OWNER' || myRole === 'ADMIN';

  // 查询成员列表
  const { data, isLoading } = useQuery<MembersResponse>({
    queryKey: ['repository-members', repositoryId, search, roleFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);

      const response = await apiClient.get(
        `/repositories/${repositoryId}/members?${params.toString()}`
      );
      return response.data;
    },
  });

  // 移除成员
  const handleRemoveMember = async (member: Member) => {
    setMemberToRemove(member);
    setShowRemoveDialog(true);
  };

  const confirmRemove = async () => {
    if (!memberToRemove) return;

    setRemovingId(memberToRemove.id);
    try {
      await apiClient.delete(
        `/repositories/${repositoryId}/members/${memberToRemove.user.id}`
      );
      toast.success(`已移除成员 ${memberToRemove.user.username}`);
      setShowRemoveDialog(false);
      setMemberToRemove(null);

      // 刷新列表
      queryClient.invalidateQueries({
        queryKey: ['repository-members', repositoryId],
      });
    } catch (error: any) {
      console.error('移除成员失败:', error);
      toast.error(error?.response?.data?.message || '移除失败，请重试');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 搜索和筛选 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索成员用户名..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="全部角色" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部角色</SelectItem>
            <SelectItem value="OWNER">所有者</SelectItem>
            <SelectItem value="ADMIN">管理员</SelectItem>
            <SelectItem value="MEMBER">成员</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 统计信息 */}
      {data && (
        <div className="text-sm text-muted-foreground">
          共 {data.pagination.total} 个成员
        </div>
      )}

      {/* 成员列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data?.items.length ? (
        <div className="text-center py-8 text-muted-foreground">暂无成员</div>
      ) : (
        <div className="space-y-2">
          {data.items.map(member => {
            const config = roleConfig[member.role];
            const Icon = config.icon;
            const isRemoving = removingId === member.id;
            const canRemoveThis = canManage && member.role !== 'OWNER';

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.user.avatar || undefined} />
                    <AvatarFallback>
                      {member.user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {member.user.username}
                      </p>
                      <Badge variant="outline" className={config.className}>
                        {Icon && <Icon className="h-3 w-3 mr-1" />}
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      加入于 {formatSmartTime(member.createdAt)}
                    </p>
                  </div>
                </div>

                {/* 操作按钮 */}
                {canRemoveThis && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveMember(member)}
                    disabled={isRemoving}
                  >
                    {isRemoving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <UserMinus className="h-4 w-4 mr-1" />
                        移除
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
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

      {/* 移除确认对话框 */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认移除成员？</AlertDialogTitle>
            <AlertDialogDescription>
              确定要将 <strong>{memberToRemove?.user.username}</strong>{' '}
              从仓库成员中移除吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认移除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
