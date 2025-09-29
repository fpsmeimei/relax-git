export type RepoVisibility = 'PUBLIC' | 'INTERNAL' | 'PRIVATE';
export type RepoMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | null | undefined;
export type JoinStatus =
  | 'none'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'member'
  | 'loading'
  | undefined;

/**
 * 是否需要显示“申请加入”相关入口
 * 统一规则：
 * - OWNER/ADMIN/MEMBER 永远不需要
 * - 非 PRIVATE 仓库不需要（PUBLIC/INTERNAL 可直接读）
 * - PRIVATE：非成员需要；未登录时显示“登录后申请加入”
 */
export function isJoinNeeded(params: {
  visibility: RepoVisibility | null | undefined;
  myRole: RepoMemberRole;
  isAuthenticated: boolean;
  joinStatus?: JoinStatus;
}): boolean {
  const { visibility, myRole, isAuthenticated, joinStatus } = params;
  if (myRole === 'OWNER' || myRole === 'ADMIN' || myRole === 'MEMBER')
    return false;
  if (visibility !== 'PRIVATE') return false;
  if (joinStatus === 'member') return false;
  // 未登录用户在 PRIVATE 仓库也需要引导登录以申请
  if (!isAuthenticated) return true;
  // 登录但尚未成为成员（none/pending/approved/rejected/loading）均显示“申请/状态”区
  return true;
}
