'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { apiClient } from '@/services/apiClient';
import { toast } from 'sonner';
import { Loader2, UserPlus, UserMinus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface MembershipButtonProps {
  repositoryId: string;
  isOwner: boolean;
  isMember: boolean;
  applicationStatus?: 'pending' | 'approved' | 'rejected' | 'none';
  canApply: boolean;
}

/**
 * 成员申请按钮组件
 *
 * 状态机：
 * 1. 所有者：不显示申请入口
 * 2. 非成员：可点击，文本"申请加入"
 * 3. 等待审批：禁用，文本"等待审批"
 * 4. 已是成员：红色可点击，文本"退出成员"
 */
export function MembershipButton({
  repositoryId,
  isOwner,
  isMember,
  applicationStatus,
  canApply,
}: MembershipButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const queryClient = useQueryClient();

  // 申请加入
  const handleApply = async () => {
    setIsLoading(true);
    try {
      await apiClient.post(`/repositories/${repositoryId}/join-requests`, {
        reason: '希望参与该仓库的浏览、讨论与协作',
      });

      toast.success('你已申请，等待管理员同意中');

      // 刷新成员状态
      queryClient.invalidateQueries({
        queryKey: ['repository-member-status', repositoryId],
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || '申请失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 退出成员
  const handleLeave = async () => {
    setIsLoading(true);
    try {
      await apiClient.delete(`/repositories/${repositoryId}/members/me`);

      toast.success('你已退出该仓库成员');
      setShowLeaveDialog(false);

      // 刷新成员状态
      queryClient.invalidateQueries({
        queryKey: ['repository-member-status', repositoryId],
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || '退出失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 撤回申请
  const handleCancelApplication = async () => {
    setIsLoading(true);
    try {
      await apiClient.delete(`/repositories/${repositoryId}/join-requests/me`);

      toast.success('已撤回申请');

      // 刷新成员状态
      queryClient.invalidateQueries({
        queryKey: ['repository-member-status', repositoryId],
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || '撤回失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. 所有者状态
  if (isOwner) {
    return null;
  }

  // 2. 等待审批状态
  if (applicationStatus === 'pending') {
    return (
      <div className="flex gap-2">
        <Button disabled variant="outline" className="gap-2 flex-1">
          <Loader2 className="h-4 w-4 animate-spin" />
          等待审批
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancelApplication}
          disabled={isLoading}
        >
          撤回
        </Button>
      </div>
    );
  }

  // 3. 已是成员状态
  if (isMember) {
    return (
      <>
        <Button
          variant="destructive"
          onClick={() => setShowLeaveDialog(true)}
          disabled={isLoading}
          className="gap-2"
        >
          <UserMinus className="h-4 w-4" />
          退出成员
        </Button>

        {/* 退出确认对话框 */}
        <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认退出成员？</AlertDialogTitle>
              <AlertDialogDescription>
                退出后，你将失去该仓库的成员权限。如需重新加入，需要再次申请并等待管理员审批。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLeave}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                确认退出
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // 4. 非成员状态（可申请）
  if (canApply) {
    return (
      <Button
        variant="default"
        onClick={handleApply}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        申请加入
      </Button>
    );
  }

  // 5. 不显示按钮（全部公开仓库）
  return null;
}
