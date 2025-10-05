import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

interface ListParams {
  userId: string;
  isRead?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list({ userId, isRead, page = 1, limit = 20 }: ListParams) {
    const where: any = { userId };
    if (typeof isRead === 'boolean') where.isRead = isRead;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          actor: { select: { id: true, username: true, avatar: true } },
          comment: {
            select: {
              id: true,
              snapshotId: true,
              anchorType: true,
              commitSha: true,
              filePath: true,
              lineStart: true,
              lineEnd: true,
              snapshot: {
                select: {
                  repository: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markRead(userId: string, id: string) {
    const res = await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return { success: true, updated: res.count };
  }

  async markManyRead(userId: string, ids: string[]) {
    if (!ids?.length) return { success: true, updated: 0 };
    const res = await this.prisma.notification.updateMany({
      where: { userId, id: { in: ids } },
      data: { isRead: true },
    });
    return { success: true, updated: res.count };
  }

  async markAllRead(userId: string) {
    const res = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true, updated: res.count };
  }
}
