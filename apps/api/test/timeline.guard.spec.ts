import { Reflector } from '@nestjs/core';
import { RepoAccessGuard } from '../src/auth/guards/repo-access.guard';
import {
  RepositoryVisibility,
  UserRole,
} from '@relax-git/shared/generated/prisma-client';

function createPrismaMock() {
  return {
    repository: { findUnique: jest.fn() },
    member: { findUnique: jest.fn() },
  } as any;
}

function makeGuardForTimeline(req: any) {
  // Timeline 使用 @RepoAccess('read') 保护 /timeline/events/repository/:repoId
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue('read'),
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

describe('Timeline + RepoAccessGuard (read on :repoId)', () => {
  const repoBase = { id: 'r1', ownerId: 'o1' } as any;

  it('PUBLIC: 匿名可读 timeline 仓库事件', async () => {
    const req = { params: { repoId: 'r1' } };
    const { guard, prisma, context } = makeGuardForTimeline(req);
    prisma.repository.findUnique.mockResolvedValue({
      ...repoBase,
      visibility: RepositoryVisibility.PUBLIC,
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('PRIVATE: 非成员拒绝；成员放行', async () => {
    const req = {
      params: { repoId: 'r1' },
      user: { id: 'u1', role: UserRole.USER },
    };
    const { guard, prisma, context } = makeGuardForTimeline(req);
    prisma.repository.findUnique.mockResolvedValue({
      ...repoBase,
      visibility: RepositoryVisibility.PRIVATE,
    });

    prisma.member.findUnique.mockResolvedValue(null);
    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: { code: 'MEMBER_ONLY' },
    });

    prisma.member.findUnique.mockResolvedValue({ repoId: 'r1', userId: 'u1' });
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
