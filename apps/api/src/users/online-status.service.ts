import { Injectable, Inject, Optional } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class OnlineStatusService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() @Inject('WebSocketGateway') private readonly ws?: any
  ) {}

  async setUserOnline(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: true,
        lastSeenAt: new Date(),
      },
    });

    // 移除自动通知机制，避免打扰用户
    // 好友可以通过查看头像状态点来了解在线状态
  }

  async setUserOffline(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: false,
        lastSeenAt: new Date(),
      },
    });

    // 移除自动通知机制，避免打扰用户
    // 好友可以通过查看头像状态点来了解在线状态
  }

  async updateLastSeen(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });
  }

  async getFriendsOnlineStatus(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: { userId },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            isOnline: true,
            lastSeenAt: true,
          },
        },
      },
    });

    return friendships.map((f: any) => ({
      id: f.friend.id,
      username: f.friend.username,
      isOnline: f.friend.isOnline,
      lastSeenAt: f.friend.lastSeenAt?.toISOString(),
    }));
  }

  // 移除自动推送通知机制
  // 用户可以通过 API 主动查询好友在线状态
  // UI 显示：头像右下角绿色圆点表示在线，无圆点表示离线

  async getUserOnlineStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        isOnline: true,
        lastSeenAt: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      isOnline: user.isOnline,
      lastSeenAt: user.lastSeenAt?.toISOString(),
    };
  }

  async batchGetOnlineStatus(userIds: string[]) {
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        isOnline: true,
        lastSeenAt: true,
      },
    });

    return users.map((user: any) => ({
      id: user.id,
      username: user.username,
      isOnline: user.isOnline,
      lastSeenAt: user.lastSeenAt?.toISOString(),
    }));
  }
}
