import { Injectable, NotFoundException } from '@nestjs/common';
import {
  JoinRequestStatus,
  MemberRole,
  Prisma,
} from '@relax-git/shared/generated/prisma-client';
import { PrismaService } from '../database/prisma.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import {
  BatchReviewJoinRequestDto,
  CreateJoinRequestDto,
  QueryJoinRequestsDto,
} from './dto';

type JoinStatus = 'member' | 'pending' | 'approved' | 'rejected' | 'none';

@Injectable()
export class JoinRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly websocketGateway?: WebSocketGateway
  ) {}

  async create(repoId: string, userId: string, dto: CreateJoinRequestDto) {
    // 已是成员则幂等返回
    const member = await this.prisma.member.findUnique({
      where: { repoId_userId: { repoId, userId } } as any,
    });
    if (member) return { status: 'member' };

    // 已存在待处理申请则直接返回
    const pending = await this.prisma.joinRequest.findFirst({
      where: { repoId, userId, status: JoinRequestStatus.PENDING },
      orderBy: { createdAt: 'desc' },
    });
    if (pending) return { status: 'pending', id: pending.id };

    const created = await this.prisma.joinRequest.create({
      data: {
        repoId,
        userId,
        reason: dto.reason,
        status: JoinRequestStatus.PENDING,
      },
    });
    return { status: 'pending', id: created.id };
  }

  async approve(
    repoId: string,
    id: string,
    reviewerId: string,
    reason?: string
  ) {
    const result = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const existed = await tx.joinRequest.findUnique({ where: { id } });
        if (!existed || existed.repoId !== repoId) {
          throw new NotFoundException({
            code: 'JOIN_REQUEST_NOT_FOUND',
            message: '加入申请不存在',
          });
        }
        if (existed.status === JoinRequestStatus.APPROVED) {
          return { status: 'approved', notify: null } as const;
        }
        if (existed.status === JoinRequestStatus.REJECTED) {
          return { status: 'rejected', notify: null } as const;
        }
        const req = await tx.joinRequest.update({
          where: { id },
          data: {
            status: JoinRequestStatus.APPROVED,
            reviewedAt: new Date(),
            reviewedBy: reviewerId,
          },
        });
        await tx.member.upsert({
          where: { repoId_userId: { repoId, userId: req.userId } } as any,
          update: { role: MemberRole.MEMBER },
          create: { repoId, userId: req.userId, role: MemberRole.MEMBER },
        });
        const content = '加入申请已通过';
        const notification = await tx.notification.create({
          data: {
            userId: req.userId,
            actorId: reviewerId,
            type: 'JOIN_REQUEST_APPROVED' as any,
            repoId,
            content,
          },
        });
        return {
          status: 'approved',
          notify: {
            userId: req.userId,
            payload: {
              id: notification.id,
              type: 'JOIN_REQUEST_APPROVED',
              repoId,
              content,
              actor: await tx.user.findUnique({
                where: { id: reviewerId },
                select: { id: true, username: true, avatar: true },
              }),
              createdAt:
                (notification as any).createdAt?.toISOString?.() ??
                new Date().toISOString(),
            },
          },
        } as const;
      }
    );

    if (result.notify && this.websocketGateway) {
      this.websocketGateway.emitUserNotification(
        result.notify.userId,
        result.notify.payload
      );
    }
    return { status: result.status } as const;
  }

  async reject(
    repoId: string,
    id: string,
    reviewerId: string,
    reason?: string
  ) {
    const result = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const existed = await tx.joinRequest.findUnique({ where: { id } });
        if (!existed || existed.repoId !== repoId) {
          throw new NotFoundException({
            code: 'JOIN_REQUEST_NOT_FOUND',
            message: '加入申请不存在',
          });
        }
        if (existed.status === JoinRequestStatus.APPROVED) {
          return { status: 'approved', notify: null } as const;
        }
        if (existed.status === JoinRequestStatus.REJECTED) {
          return { status: 'rejected', notify: null } as const;
        }
        const req = await tx.joinRequest.update({
          where: { id },
          data: {
            status: JoinRequestStatus.REJECTED,
            reviewedAt: new Date(),
            reviewedBy: reviewerId,
            reason: reason ?? undefined,
          },
        });
        const content = reason ? `加入申请被驳回：${reason}` : '加入申请被驳回';
        const notification = await tx.notification.create({
          data: {
            userId: req.userId,
            actorId: reviewerId,
            type: 'JOIN_REQUEST_REJECTED' as any,
            repoId,
            content,
          },
        });
        return {
          status: 'rejected',
          notify: {
            userId: req.userId,
            payload: {
              id: notification.id,
              type: 'JOIN_REQUEST_REJECTED',
              repoId,
              content,
              actor: await tx.user.findUnique({
                where: { id: reviewerId },
                select: { id: true, username: true, avatar: true },
              }),
              createdAt:
                (notification as any).createdAt?.toISOString?.() ??
                new Date().toISOString(),
            },
          },
        } as const;
      }
    );

    if (result.notify && this.websocketGateway) {
      this.websocketGateway.emitUserNotification(
        result.notify.userId,
        result.notify.payload
      );
    }
    return { status: result.status } as const;
  }

  async list(repoId: string, query: QueryJoinRequestsDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;
    const statusFilter = query.status ? { status: query.status } : {};
    const where: any = { repoId, ...statusFilter };

    const search = (query.search ?? '').trim();
    if (search) {
      where.user = {
        is: {
          username: { contains: search, mode: 'insensitive' },
        },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.joinRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, username: true, avatar: true },
          },
        },
      }),
      this.prisma.joinRequest.count({ where }),
    ]);
    return {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getMyStatus(
    repoId: string,
    userId: string
  ): Promise<{ status: JoinStatus; id?: string; role?: MemberRole }> {
    const member = await this.prisma.member.findUnique({
      where: { repoId_userId: { repoId, userId } } as any,
      select: { role: true },
    });
    if (member) {
      return { status: 'member', role: member.role };
    }

    const lastReq = await this.prisma.joinRequest.findFirst({
      where: { repoId, userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true },
    });
    if (!lastReq) return { status: 'none' };

    const s = String(lastReq.status).toLowerCase() as JoinStatus;
    return { status: s, id: lastReq.id };
  }

  async cancel(repoId: string, userId: string) {
    // 若存在待处理申请，允许撤回（删除全部 PENDING 记录）
    const pending = await this.prisma.joinRequest.findFirst({
      where: { repoId, userId, status: JoinRequestStatus.PENDING },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (!pending) {
      // 无可撤回条目，返回当前状态
      return this.getMyStatus(repoId, userId);
    }

    await this.prisma.joinRequest.deleteMany({
      where: { repoId, userId, status: JoinRequestStatus.PENDING },
    });

    // 撤回后状态回到 none（非成员且无申请）或 member（若并行被批准）
    return this.getMyStatus(repoId, userId);
  }

  async batchReview(
    repoId: string,
    dto: BatchReviewJoinRequestDto,
    reviewerId: string
  ) {
    const results = {
      successCount: 0,
      skippedCount: 0,
      failedCount: 0,
      details: [] as Array<{
        id: string;
        status: 'success' | 'skipped' | 'failed';
        message?: string;
      }>,
    };

    // 批量处理每个申请
    for (const id of dto.ids) {
      try {
        if (dto.approve) {
          const result = await this.approve(repoId, id, reviewerId, dto.reason);
          if (result.status === 'approved') {
            results.successCount++;
            results.details.push({ id, status: 'success' });
          } else {
            results.skippedCount++;
            results.details.push({
              id,
              status: 'skipped',
              message: '申请已处理过',
            });
          }
        } else {
          const result = await this.reject(repoId, id, reviewerId, dto.reason);
          if (result.status === 'rejected') {
            results.successCount++;
            results.details.push({ id, status: 'success' });
          } else {
            results.skippedCount++;
            results.details.push({
              id,
              status: 'skipped',
              message: '申请已处理过',
            });
          }
        }
      } catch (error) {
        results.failedCount++;
        results.details.push({
          id,
          status: 'failed',
          message: error instanceof Error ? error.message : '处理失败',
        });
      }
    }

    return results;
  }
}
