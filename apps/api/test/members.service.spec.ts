import { MemberRole } from '@relax-git/shared/generated/prisma-client';
import { MembersService } from '../src/members/members.service';

function createPrismaMock() {
  return {
    member: {
      findUnique: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
  } as any;
}

describe('MembersService', () => {
  it('remove: 最后一个 OWNER 自删应报错 LAST_OWNER_NOT_REMOVABLE', async () => {
    const prisma = createPrismaMock();
    const service = new MembersService(prisma);
    prisma.member.findUnique
      .mockResolvedValueOnce({
        repoId: 'r1',
        userId: 'u1',
        role: MemberRole.OWNER,
      }) // target
      .mockResolvedValueOnce({
        repoId: 'r1',
        userId: 'u1',
        role: MemberRole.OWNER,
      }); // operator (self)
    prisma.member.count.mockResolvedValue(1);

    await expect(service.remove('r1', 'u1', 'u1')).rejects.toMatchObject({
      response: { code: 'LAST_OWNER_NOT_REMOVABLE' },
    });
  });

  it('remove: 非 OWNER 试图移除 OWNER 应报错 ROLE_OPERATION_FORBIDDEN', async () => {
    const prisma = createPrismaMock();
    const service = new MembersService(prisma);
    prisma.member.findUnique
      .mockResolvedValueOnce({
        repoId: 'r1',
        userId: 'u1',
        role: MemberRole.OWNER,
      }) // target
      .mockResolvedValueOnce({
        repoId: 'r1',
        userId: 'u2',
        role: MemberRole.ADMIN,
      }); // operator
    prisma.member.count.mockResolvedValue(2);

    await expect(service.remove('r1', 'u1', 'u2')).rejects.toMatchObject({
      response: { code: 'ROLE_OPERATION_FORBIDDEN' },
    });
  });

  it('remove: 目标不存在应幂等返回且不调用 delete', async () => {
    const prisma = createPrismaMock();
    const service = new MembersService(prisma);
    prisma.member.findUnique
      .mockResolvedValueOnce(null) // target
      .mockResolvedValueOnce({
        repoId: 'r1',
        userId: 'u2',
        role: MemberRole.OWNER,
      }); // operator

    await expect(service.remove('r1', 'u1', 'u2')).resolves.toBeUndefined();
    expect(prisma.member.delete).not.toHaveBeenCalled();
  });

  it('changeRole: 自降级为最后一个 OWNER 应报错 LAST_OWNER_NOT_REMOVABLE', async () => {
    const prisma = createPrismaMock();
    const service = new MembersService(prisma);
    prisma.member.findUnique
      .mockResolvedValueOnce({
        repoId: 'r1',
        userId: 'u1',
        role: MemberRole.OWNER,
      }) // target
      .mockResolvedValueOnce({
        repoId: 'r1',
        userId: 'u1',
        role: MemberRole.OWNER,
      }); // operator
    prisma.member.count.mockResolvedValue(1);

    await expect(
      service.changeRole('r1', 'u1', 'u1', MemberRole.MEMBER)
    ).rejects.toMatchObject({ response: { code: 'LAST_OWNER_NOT_REMOVABLE' } });
  });

  it('changeRole: 非 OWNER 调整他人应报错 ROLE_OPERATION_FORBIDDEN', async () => {
    const prisma = createPrismaMock();
    const service = new MembersService(prisma);
    prisma.member.findUnique
      .mockResolvedValueOnce({
        repoId: 'r1',
        userId: 'u1',
        role: MemberRole.MEMBER,
      }) // target
      .mockResolvedValueOnce({
        repoId: 'r1',
        userId: 'u2',
        role: MemberRole.ADMIN,
      }); // operator (not OWNER)
    prisma.member.count.mockResolvedValue(2);

    await expect(
      service.changeRole('r1', 'u1', 'u2', MemberRole.ADMIN)
    ).rejects.toMatchObject({ response: { code: 'ROLE_OPERATION_FORBIDDEN' } });
  });

  it('changeRole: 角色相同应幂等不更新', async () => {
    const prisma = createPrismaMock();
    const service = new MembersService(prisma);
    prisma.member.findUnique
      .mockResolvedValueOnce({
        repoId: 'r1',
        userId: 'u1',
        role: MemberRole.ADMIN,
      }) // target
      .mockResolvedValueOnce({
        repoId: 'r1',
        userId: 'u2',
        role: MemberRole.OWNER,
      }); // operator

    await expect(
      service.changeRole('r1', 'u1', 'u2', MemberRole.ADMIN)
    ).resolves.toBeUndefined();
    expect(prisma.member.update).not.toHaveBeenCalled();
  });
});
