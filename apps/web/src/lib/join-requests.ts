export type JoinStatusSimple =
  | 'none'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'member';

import { apiClient } from '@/services/apiClient';

export async function fetchMyJoinStatus(
  repoId: string
): Promise<JoinStatusSimple> {
  try {
    const { data } = await apiClient.get<{ status: string }>(
      `/repositories/${repoId}/join-requests/me`
    );
    const s = String((data as any)?.status || 'none').toLowerCase();
    if (['none', 'pending', 'approved', 'rejected', 'member'].includes(s)) {
      return s as JoinStatusSimple;
    }
    return 'none';
  } catch {
    return 'none';
  }
}

export async function applyToJoin(
  repoId: string,
  reason?: string
): Promise<{ nextStatus: JoinStatusSimple; message: string }> {
  await apiClient.post(`/repositories/${repoId}/join-requests`, {
    reason: reason || '希望加入该仓库进行协作',
  });
  return { nextStatus: 'pending', message: '已提交申请，等待审核' };
}

export async function cancelJoin(
  repoId: string
): Promise<{ nextStatus: JoinStatusSimple; message: string }> {
  const { data } = await apiClient.delete(
    `/repositories/${repoId}/join-requests/me`
  );
  const s = String((data as any)?.status || 'none').toLowerCase();
  const next: JoinStatusSimple = [
    'member',
    'none',
    'pending',
    'approved',
    'rejected',
  ].includes(s)
    ? (s as any)
    : 'none';
  const msg =
    next === 'none'
      ? '已撤回申请'
      : next === 'member' || next === 'approved'
        ? '申请已通过，无法撤回'
        : next === 'rejected'
          ? '申请已被驳回，无需撤回'
          : '申请仍在审核中，请稍后重试';
  return { nextStatus: next, message: msg };
}
