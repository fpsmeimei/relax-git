import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { useAuth } from './use-auth';

type RepositoryVisibility = 'PUBLIC' | 'INTERNAL' | 'PRIVATE';
type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

interface RepositoryPermission {
  canViewCode: boolean; // 是否可以查看代码
  canComment: boolean; // 是否可以评论
  canApply: boolean; // 是否可以申请加入
  isMember: boolean; // 是否是成员
  isOwner: boolean; // 是否是所有者
  memberRole?: MemberRole | undefined; // 成员角色
  applicationStatus?: 'pending' | 'approved' | 'rejected' | 'none'; // 申请状态
}

interface Repository {
  id: string;
  visibility: RepositoryVisibility;
  ownerId: string;
}

/**
 * 仓库权限 Hook
 * 根据仓库属性、用户身份、成员关系计算权限
 */
export function useRepositoryPermission(repository?: Repository | null) {
  const { user } = useAuth();

  // 查询用户在该仓库的成员状态
  const { data: memberStatus } = useQuery({
    queryKey: ['repository-member-status', repository?.id, user?.id],
    queryFn: async () => {
      if (!repository?.id || !user?.id) return null;
      const response = await apiClient.get(
        `/repositories/${repository.id}/join-requests/me`
      );
      return response.data;
    },
    enabled: !!repository?.id && !!user?.id,
    staleTime: 30000, // 30秒缓存
  });

  // 计算权限
  const calculatePermissions = (): RepositoryPermission => {
    // 未提供仓库信息或未登录
    if (!repository) {
      return {
        canViewCode: false,
        canComment: false,
        canApply: false,
        isMember: false,
        isOwner: false,
      };
    }

    const isOwner = user?.id === repository.ownerId;
    const isMember = memberStatus?.status === 'member';
    const memberRole = memberStatus?.role as MemberRole | undefined;
    const applicationStatus = memberStatus?.status;

    // 所有者拥有所有权限
    if (isOwner) {
      return {
        canViewCode: true,
        canComment: true,
        canApply: false, // 所有者不需要申请
        isMember: true,
        isOwner: true,
        memberRole: 'OWNER',
        applicationStatus: 'none',
      };
    }

    // 根据仓库可见性和成员状态计算权限
    switch (repository.visibility) {
      case 'PUBLIC':
        // 全部公开：所有人可查看和评论
        return {
          canViewCode: true,
          canComment: true,
          canApply: false, // 不显示申请按钮
          isMember,
          isOwner: false,
          memberRole,
          applicationStatus,
        };

      case 'INTERNAL':
        // 仅可查看：所有人可查看，仅成员可评论
        return {
          canViewCode: true,
          canComment: isMember,
          canApply: !isMember, // 非成员可申请
          isMember,
          isOwner: false,
          memberRole,
          applicationStatus,
        };

      case 'PRIVATE':
        // 私有：仅成员可查看和评论
        return {
          canViewCode: isMember,
          canComment: isMember,
          canApply: !isMember, // 非成员可申请
          isMember,
          isOwner: false,
          memberRole,
          applicationStatus,
        };

      default:
        return {
          canViewCode: false,
          canComment: false,
          canApply: false,
          isMember: false,
          isOwner: false,
        };
    }
  };

  return calculatePermissions();
}
