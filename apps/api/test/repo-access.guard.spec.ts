import { Reflector } from '@nestjs/core';
import {
  RepositoryVisibility,
  UserRole,
} from '@relax-git/shared/generated/prisma-client';
import { RepoAccessGuard } from '../src/auth/guards/repo-access.guard';

function createPrismaMock() {
  return {
    repository: { findUnique: jest.fn() },
    snapshot: { findUnique: jest.fn() },
    diff: { findUnique: jest.fn() },
    comment: { findUnique: jest.fn() },
    member: { findUnique: jest.fn() },
  } as any;
}

function createContext(req: any, mode: 'read' | 'comment' | 'admin') {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(mode),
  } as any as Reflector;
  const guard = new RepoAccessGuard(createPrismaMock(), reflector);
  // override prisma per test ease
  const prisma = (guard as any).prisma;

  const context: any = {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => ({}),
    getClass: () => ({}),
  };

  return { guard, prisma, context };
}

describe('RepoAccessGuard', () => {
  it('平台管理员放行', async () => {
    const req = {
      params: { repoId: 'r1' },
      user: { id: 'u1', role: UserRole.ADMIN },
    };
    const { guard, prisma, context } = createContext(req, 'read');
    prisma.repository.findUnique.mockResolvedValue({
      id: 'r1',
      ownerId: 'u0',
      visibility: RepositoryVisibility.PRIVATE,
    });
    await expect(guard.canActivate(context as any)).resolves.toBe(true);
  });

  it('read: PRIVATE 非成员应拒绝（MEMBER_ONLY）', async () => {
    const req = {
      params: { repoId: 'r1' },
      user: { id: 'u1', role: UserRole.USER },
    };
    const { guard, prisma, context } = createContext(req, 'read');
    prisma.repository.findUnique.mockResolvedValue({
      id: 'r1',
      ownerId: 'u0',
      visibility: RepositoryVisibility.PRIVATE,
    });
    prisma.member.findUnique.mockResolvedValue(null);

    await expect(guard.canActivate(context as any)).rejects.toMatchObject({
      response: { code: 'MEMBER_ONLY' },
    });
  });

  it('read: 支持从请求体 repositoryId 解析仓库（搜索接口）', async () => {
    const req = {
      body: { repositoryId: 'r1' },
      user: { id: 'owner1', role: UserRole.USER },
    };
    const { guard, prisma, context } = createContext(req, 'read');
    prisma.repository.findUnique.mockResolvedValue({
      id: 'r1',
      ownerId: 'owner1',
      visibility: RepositoryVisibility.PRIVATE,
    });

    await expect(guard.canActivate(context as any)).resolves.toBe(true);
    expect(prisma.repository.findUnique).toHaveBeenCalledWith({
      where: { id: 'r1' },
    });
  });

  it('admin: 需为 OWNER/ADMIN 成员', async () => {
    const req = {
      params: { repoId: 'r1' },
      user: { id: 'u1', role: UserRole.USER },
    };
    const { guard, prisma, context } = createContext(req, 'admin');
    prisma.repository.findUnique.mockResolvedValue({
      id: 'r1',
      ownerId: 'u0',
      visibility: RepositoryVisibility.INTERNAL,
    });
    prisma.member.findUnique.mockResolvedValue({
      repoId: 'r1',
      userId: 'u1',
      role: 'ADMIN',
    });

    await expect(guard.canActivate(context as any)).resolves.toBe(true);
  });
});
