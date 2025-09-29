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
    comment: { findUnique: jest.fn() },
    member: { findUnique: jest.fn() },
  } as any;
}

function makeGuard(req: any, mode: 'read' | 'comment' | 'admin') {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(mode),
  } as any as Reflector;
  const guard = new RepoAccessGuard(createPrismaMock(), reflector);
  const prisma = (guard as any).prisma;
  const context: any = {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => ({}),
    getClass: () => ({}),
  };
  return { guard, prisma, context };
}

describe('RepoAccessGuard 权限矩阵', () => {
  const repoBase = { id: 'r1', ownerId: 'owner1' } as any;

  describe('read 模式', () => {
    it('PUBLIC: 匿名可读', async () => {
      const req = { params: { repoId: 'r1' } };
      const { guard, prisma, context } = makeGuard(req, 'read');
      prisma.repository.findUnique.mockResolvedValue({
        ...repoBase,
        visibility: RepositoryVisibility.PUBLIC,
      });
      await expect(guard.canActivate(context)).resolves.toBe(true);
    });

    it('INTERNAL: 匿名可读', async () => {
      const req = { params: { repoId: 'r1' } };
      const { guard, prisma, context } = makeGuard(req, 'read');
      prisma.repository.findUnique.mockResolvedValue({
        ...repoBase,
        visibility: RepositoryVisibility.INTERNAL,
      });
      await expect(guard.canActivate(context)).resolves.toBe(true);
    });

    it('PRIVATE: 非成员拒绝，成员放行', async () => {
      const req = {
        params: { repoId: 'r1' },
        user: { id: 'u1', role: UserRole.USER },
      };
      const { guard, prisma, context } = makeGuard(req, 'read');
      prisma.repository.findUnique.mockResolvedValue({
        ...repoBase,
        visibility: RepositoryVisibility.PRIVATE,
      });
      prisma.member.findUnique.mockResolvedValue(null);
      await expect(guard.canActivate(context)).rejects.toMatchObject({
        response: { code: 'MEMBER_ONLY' },
      });

      prisma.member.findUnique.mockResolvedValue({
        repoId: 'r1',
        userId: 'u1',
      });
      await expect(guard.canActivate(context)).resolves.toBe(true);
    });
  });

  describe('comment 模式', () => {
    it('PUBLIC: 登录但非成员可评（RepoAccessGuard 放行；登录由 JwtAuthGuard 保证）', async () => {
      const req = {
        params: { repoId: 'r1' },
        user: { id: 'u2', role: UserRole.USER },
      };
      const { guard, prisma, context } = makeGuard(req, 'comment');
      prisma.repository.findUnique.mockResolvedValue({
        ...repoBase,
        visibility: RepositoryVisibility.PUBLIC,
      });
      await expect(guard.canActivate(context)).resolves.toBe(true);
    });

    it('INTERNAL: 仅成员可评', async () => {
      const req = {
        params: { repoId: 'r1' },
        user: { id: 'u3', role: UserRole.USER },
      };
      const { guard, prisma, context } = makeGuard(req, 'comment');
      prisma.repository.findUnique.mockResolvedValue({
        ...repoBase,
        visibility: RepositoryVisibility.INTERNAL,
      });

      prisma.member.findUnique.mockResolvedValue(null);
      await expect(guard.canActivate(context)).rejects.toMatchObject({
        response: { code: 'MEMBER_ONLY' },
      });

      prisma.member.findUnique.mockResolvedValue({
        repoId: 'r1',
        userId: 'u3',
      });
      await expect(guard.canActivate(context)).resolves.toBe(true);
    });

    it('PRIVATE: 仅成员可评', async () => {
      const req = {
        params: { repoId: 'r1' },
        user: { id: 'u4', role: UserRole.USER },
      };
      const { guard, prisma, context } = makeGuard(req, 'comment');
      prisma.repository.findUnique.mockResolvedValue({
        ...repoBase,
        visibility: RepositoryVisibility.PRIVATE,
      });

      prisma.member.findUnique.mockResolvedValue(null);
      await expect(guard.canActivate(context)).rejects.toMatchObject({
        response: { code: 'MEMBER_ONLY' },
      });

      prisma.member.findUnique.mockResolvedValue({
        repoId: 'r1',
        userId: 'u4',
      });
      await expect(guard.canActivate(context)).resolves.toBe(true);
    });
  });

  describe('admin 模式', () => {
    it('OWNER/ADMIN 成员放行；普通成员拒绝；平台 ADMIN 放行', async () => {
      // 普通成员 -> 拒绝
      const reqMember = {
        params: { repoId: 'r1' },
        user: { id: 'm1', role: UserRole.USER },
      };
      let { guard, prisma, context } = makeGuard(reqMember, 'admin');
      prisma.repository.findUnique.mockResolvedValue({
        ...repoBase,
        visibility: RepositoryVisibility.INTERNAL,
      });
      prisma.member.findUnique.mockResolvedValue({
        repoId: 'r1',
        userId: 'm1',
        role: 'MEMBER',
      });
      await expect(guard.canActivate(context)).rejects.toMatchObject({
        response: { code: 'MEMBER_ONLY' },
      });

      // ADMIN 成员 -> 放行
      const reqAdminMember = {
        params: { repoId: 'r1' },
        user: { id: 'am1', role: UserRole.USER },
      };
      ({ guard, prisma, context } = makeGuard(reqAdminMember, 'admin'));
      prisma.repository.findUnique.mockResolvedValue({
        ...repoBase,
        visibility: RepositoryVisibility.INTERNAL,
      });
      prisma.member.findUnique.mockResolvedValue({
        repoId: 'r1',
        userId: 'am1',
        role: 'ADMIN',
      });
      await expect(guard.canActivate(context)).resolves.toBe(true);

      // owner
      const reqOwner = {
        params: { repoId: 'r1' },
        user: { id: 'owner1', role: UserRole.USER },
      };
      ({ guard, prisma, context } = makeGuard(reqOwner, 'admin'));
      prisma.repository.findUnique.mockResolvedValue({
        ...repoBase,
        visibility: RepositoryVisibility.PRIVATE,
      });
      await expect(guard.canActivate(context)).resolves.toBe(true);

      // 平台 ADMIN
      const reqAdmin = {
        params: { repoId: 'r1' },
        user: { id: 'admin1', role: UserRole.ADMIN },
      };
      ({ guard, prisma, context } = makeGuard(reqAdmin, 'admin'));
      prisma.repository.findUnique.mockResolvedValue({
        ...repoBase,
        visibility: RepositoryVisibility.PUBLIC,
      });
      await expect(guard.canActivate(context)).resolves.toBe(true);
    });
  });
});
