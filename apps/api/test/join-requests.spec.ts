import { NotFoundException } from '@nestjs/common';
import { JoinRequestStatus } from '@relax-git/shared/generated/prisma-client';
import { JoinRequestsService } from '../src/join-requests/join-requests.service';

function createPrismaMock() {
  const mock: any = {
    member: { findUnique: jest.fn(), upsert: jest.fn() },
    joinRequest: { findFirst: jest.fn(), create: jest.fn() },
    $transaction: jest.fn(),
  };
  mock.$transaction.mockImplementation(async (cb: any) => {
    const tx: any = {
      joinRequest: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      member: {
        upsert: jest.fn(),
      },
    };
    return cb(tx);
  });
  return mock;
}

describe('JoinRequestsService', () => {
  it('create: 已是成员则返回 {status: "member"}', async () => {
    const prisma = createPrismaMock();
    const service = new JoinRequestsService(prisma);
    prisma.member.findUnique.mockResolvedValue({ repoId: 'r1', userId: 'u1' });
    const res = await service.create('r1', 'u1', { reason: 'hi' } as any);
    expect(res).toEqual({ status: 'member' });
  });

  it('create: 已存在待处理申请则返回 pending', async () => {
    const prisma = createPrismaMock();
    const service = new JoinRequestsService(prisma);
    prisma.member.findUnique.mockResolvedValue(null);
    prisma.joinRequest.findFirst.mockResolvedValue({
      id: 'jr1',
      status: JoinRequestStatus.PENDING,
    });
    const res = await service.create('r1', 'u1', { reason: 'hi' } as any);
    expect(res).toEqual({ status: 'pending', id: 'jr1' });
  });

  it('create: 否则创建 PENDING', async () => {
    const prisma = createPrismaMock();
    const service = new JoinRequestsService(prisma);
    prisma.member.findUnique.mockResolvedValue(null);
    prisma.joinRequest.findFirst.mockResolvedValue(null);
    prisma.joinRequest.create.mockResolvedValue({ id: 'jr2' });
    const res = await service.create('r1', 'u1', { reason: 'hi' } as any);
    expect(res).toEqual({ status: 'pending', id: 'jr2' });
  });

  it('approve: 已 APPROVED 时返回 approved（幂等）', async () => {
    const prisma = createPrismaMock();
    const service = new JoinRequestsService(prisma);
    const txRes = {
      id: 'jr1',
      repoId: 'r1',
      status: JoinRequestStatus.APPROVED,
      userId: 'u1',
    };
    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      const tx: any = {
        joinRequest: {
          findUnique: jest.fn().mockResolvedValue(txRes),
          update: jest.fn(),
        },
        member: { upsert: jest.fn() },
      };
      return cb(tx);
    });
    const res = await service.approve('r1', 'jr1', 'reviewer');
    expect(res).toEqual({ status: 'approved' });
  });

  it('reject: repoId 不匹配应抛 NotFoundException', async () => {
    const prisma = createPrismaMock();
    const service = new JoinRequestsService(prisma);
    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      const tx: any = {
        joinRequest: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'jr1',
            repoId: 'r2',
            status: JoinRequestStatus.PENDING,
          }),
          update: jest.fn(),
        },
        member: { upsert: jest.fn() },
      };
      return cb(tx);
    });

    await expect(
      service.reject('r1', 'jr1', 'reviewer')
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
