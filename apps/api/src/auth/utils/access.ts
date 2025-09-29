import {
  RepositoryVisibility,
  UserRole,
} from '@relax-git/shared/generated/prisma-client';
import type { PrismaService } from '../../database/prisma.service';

// 最小仓库形状（避免频繁 select *）
export interface MinimalRepository {
  id: string;
  ownerId: string;
  visibility: RepositoryVisibility;
}

/** 判断是否仓库成员（PRIVATE 读权限常用） */
export async function isRepoMember(
  prisma: PrismaService,
  repoId: string,
  userId?: string
): Promise<boolean> {
  if (!userId) return false;
  const member = await (prisma as any).member.findUnique({
    where: { repoId_userId: { repoId, userId } } as any,
    select: { id: true },
  });
  return !!member;
}

/** 统一的“读”权限：ADMIN / OWNER / PUBLIC / INTERNAL / PRIVATE(成员) */
export async function canReadRepo(
  prisma: PrismaService,
  repo: MinimalRepository | string,
  userId: string | undefined,
  userRole: UserRole | undefined
): Promise<boolean> {
  // 先解析仓库，便于在匿名情况下判断 PUBLIC/INTERNAL
  const r =
    typeof repo === 'string'
      ? await (prisma as any).repository.findUnique({
          where: { id: repo },
          select: { id: true, ownerId: true, visibility: true },
        })
      : repo;
  if (!r) return false;

  // 系统管理员放行（仅当存在用户上下文时）
  if (userId && userRole === UserRole.ADMIN) return true;

  // PUBLIC/INTERNAL 允许匿名只读
  if (r.visibility === RepositoryVisibility.PUBLIC) return true;
  if (r.visibility === RepositoryVisibility.INTERNAL) return true;

  // PRIVATE 需要成员或更高权限；OWNER 永远放行
  if (!userId) return false;
  if (r.ownerId === userId) return true;
  if (r.visibility === RepositoryVisibility.PRIVATE) {
    return await isRepoMember(prisma, r.id, userId);
  }
  return false;
}

/** 统一的“管理”权限：ADMIN / OWNER / ADMIN(成员) */
export async function canAdminRepo(
  prisma: PrismaService,
  repo: MinimalRepository | string,
  userId: string | undefined,
  userRole: UserRole | undefined
): Promise<boolean> {
  if (!userId) return false;
  if (userRole === UserRole.ADMIN) return true;

  const r =
    typeof repo === 'string'
      ? await (prisma as any).repository.findUnique({
          where: { id: repo },
          select: { id: true, ownerId: true },
        })
      : repo;
  if (!r) return false;
  if (r.ownerId === userId) return true;

  const member = await (prisma as any).member.findUnique({
    where: { repoId_userId: { repoId: r.id, userId } } as any,
    select: { role: true },
  });
  return member?.role === 'OWNER' || member?.role === 'ADMIN';
}

/** 统一的“可评论/写协作”权限（暂沿用现有策略：PUBLIC 开放评论；INTERNAL 按成员/配置；PRIVATE 需成员） */
export async function canCommentRepo(
  prisma: PrismaService,
  repo: MinimalRepository | string,
  userId: string | undefined,
  userRole: UserRole | undefined
): Promise<boolean> {
  if (!userId) return false;
  if (userRole === UserRole.ADMIN) return true;

  const r =
    typeof repo === 'string'
      ? await (prisma as any).repository.findUnique({
          where: { id: repo },
          select: { id: true, ownerId: true, visibility: true },
        })
      : repo;
  if (!r) return false;
  if (r.ownerId === userId) return true;

  if (r.visibility === RepositoryVisibility.PUBLIC) return true;
  if (r.visibility === RepositoryVisibility.INTERNAL) {
    const ownerOnly = process.env['INTERNAL_COMMENT_OWNER_ONLY'] === 'true';
    if (ownerOnly) {
      const member = await (prisma as any).member.findUnique({
        where: { repoId_userId: { repoId: r.id, userId } } as any,
        select: { role: true },
      });
      return member?.role === 'OWNER' || member?.role === 'ADMIN';
    } else {
      return await isRepoMember(prisma, r.id, userId);
    }
  }
  if (r.visibility === RepositoryVisibility.PRIVATE) {
    return await isRepoMember(prisma, r.id, userId);
  }
  return false;
}
