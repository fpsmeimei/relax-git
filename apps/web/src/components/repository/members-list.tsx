'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { useContactsStore } from '@/stores/contacts-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Search,
  UserMinus,
  Shield,
  Loader2,
  Crown,
  UserPlus,
  Check,
  Users,
} from 'lucide-react';
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
  const [addingId, setAddingId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const { friends, friendsLoading, loadFriends } = useContactsStore();
  const queryClient = useQueryClient();

  const canManage = myRole === 'OWNER' || myRole === 'ADMIN';

  useEffect(() => {
    if (showAddDialog) {
      void loadFriends();
    }
  }, [loadFriends, showAddDialog]);

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

  const memberUserIds = useMemo(() => {
    return new Set(data?.items.map(member => member.user.id) ?? []);
  }, [data?.items]);

  const addableFriends = useMemo(() => {
    return friends.filter(friend => !memberUserIds.has(friend.id));
  }, [friends, memberUserIds]);

  const handleAddFriendMember = async (friendId: string, username: string) => {
    setAddingId(friendId);
    try {
      const response = await apiClient.post<{
        success: boolean;
        created: boolean;
      }>(
        `/repositories/${repositoryId}/members`,
        { userId: friendId, role: 'MEMBER' },
        { __noRetry: true } as any
      );

      if (response.data.created) {
        toast.success(`已将 ${username} 添加为仓库成员`);
      } else {
        toast.info(`${username} 已经是仓库成员`);
      }

      queryClient.invalidateQueries({
        queryKey: ['repository-members', repositoryId],
      });
    } catch (error: any) {
      console.error('添加成员失败:', error);
      toast.error(error?.message || '添加成员失败，请重试');
    } finally {
      setAddingId(null);
    }
  };

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
      <div className="flex flex-col gap-3 md:flex-row">
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
          <SelectTrigger className="w-full md:w-32">
            <SelectValue placeholder="全部角色" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部角色</SelectItem>
            <SelectItem value="OWNER">所有者</SelectItem>
            <SelectItem value="ADMIN">管理员</SelectItem>
            <SelectItem value="MEMBER">成员</SelectItem>
          </SelectContent>
        </Select>
        {canManage && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAddDialog(true)}
            className="md:w-auto"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            从好友添加
          </Button>
        )}
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

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent
          className="w-[560px] max-w-[92vw]"
          onClose={() => setShowAddDialog(false)}
        >
          <DialogHeader>
            <DialogTitle>从好友添加成员</DialogTitle>
            <DialogDescription>
              添加后，该好友会成为普通成员，可参与成员可评论的仓库讨论。
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[420px] overflow-y-auto pr-1">
            {friendsLoading ? (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                正在加载好友...
              </div>
            ) : friends.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="font-medium text-foreground">暂无好友</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  先到消息中心添加好友，再回到这里设置仓库成员。
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {friends.map(friend => {
                  const alreadyMember = memberUserIds.has(friend.id);
                  const isAdding = addingId === friend.id;
                  const avatar = friend.avatar ?? null;

                  return (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between rounded-lg border bg-card p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={avatar || undefined} />
                          <AvatarFallback>
                            {friend.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {friend.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {alreadyMember
                              ? '已是仓库成员'
                              : '可添加为普通成员'}
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant={alreadyMember ? 'secondary' : 'default'}
                        disabled={alreadyMember || isAdding}
                        onClick={() =>
                          void handleAddFriendMember(friend.id, friend.username)
                        }
                      >
                        {alreadyMember ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            已添加
                          </>
                        ) : isAdding ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            添加中
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-1" />
                            添加
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}

                {addableFriends.length === 0 && (
                  <p className="pt-2 text-center text-xs text-muted-foreground">
                    当前好友都已经是该仓库成员。
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
