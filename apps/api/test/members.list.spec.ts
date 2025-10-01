import { MemberRole } from '@relax-git/shared/generated/prisma-client';
import { MembersService } from '../src/members/members.service';

function createPrismaMock() {
  return {
    member: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  } as any;
}

describe('MembersService.list', () => {
  it('applies search (username) with relation filter using user.is', async () => {
    const prisma = createPrismaMock();
    const service = new MembersService(prisma);

    prisma.member.findMany.mockResolvedValueOnce([
      {
        repoId: 'r1',
        userId: 'u1',
        role: MemberRole.MEMBER,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        user: {
          id: 'u1',
          username: 'alice',
          avatar: null,
        },
      },
    ]);
    prisma.member.count.mockResolvedValueOnce(1);

    const result = await service.list('r1', {
      page: 1,
      limit: 10,
      search: 'ali',
    } as any);

    expect(prisma.member.findMany).toHaveBeenCalledTimes(1);
    const arg = prisma.member.findMany.mock.calls[0][0];
    expect(arg.where).toBeDefined();
    expect(arg.where.repoId).toBe('r1');
    // ensure relation filter shape uses user.is
    expect(arg.where.user).toBeDefined();
    expect(arg.where.user.is).toBeDefined();
    expect(arg.where.user.is.username).toBeDefined();
    // pagination and sorting
    expect(arg.skip).toBe(0);
    expect(arg.take).toBe(10);
    expect(arg.orderBy).toEqual({ createdAt: 'desc' });

    // response shape
    expect(result.items.length).toBe(1);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      pages: 1,
    });
  });

  it('applies role filter and pagination math (page 2, limit 3)', async () => {
    const prisma = createPrismaMock();
    const service = new MembersService(prisma);

    prisma.member.findMany.mockResolvedValueOnce([]);
    prisma.member.count.mockResolvedValueOnce(7);

    await service.list('r2', {
      page: 2,
      limit: 3,
      role: MemberRole.ADMIN,
    } as any);

    const arg = prisma.member.findMany.mock.calls[0][0];
    expect(arg.where.repoId).toBe('r2');
    expect(arg.where.role).toBe(MemberRole.ADMIN);
    // skip = (2-1)*3
    expect(arg.skip).toBe(3);
    expect(arg.take).toBe(3);
  });

  it('defaults page=1 and limit=20 when not provided', async () => {
    const prisma = createPrismaMock();
    const service = new MembersService(prisma);

    prisma.member.findMany.mockResolvedValueOnce([]);
    prisma.member.count.mockResolvedValueOnce(0);

    await service.list('r3', {} as any);

    const arg = prisma.member.findMany.mock.calls[0][0];
    expect(arg.skip).toBe(0);
    expect(arg.take).toBe(20);
  });
});
