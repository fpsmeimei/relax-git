import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MessageType } from '@relax-git/shared/generated/prisma-client';
import { PrismaService } from '../../database/prisma.service';
import { WebSocketGateway } from '../../websocket/websocket.gateway';

export interface PrivateChatMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  type: MessageType;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

@Injectable()
export class PrivateChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ws: WebSocketGateway
  ) {}

  async getPrivateMessages(
    userId: string,
    friendId: string,
    cursor?: string,
    limit = 20
  ) {
    // 验证好友关系
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (!friendship) {
      throw new NotFoundException('好友关系不存在');
    }

    const take = Math.max(1, Math.min(100, limit));
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { fromUserId: userId, toUserId: friendId },
          { fromUserId: friendId, toUserId: userId },
        ],
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const nextCursor =
      messages.length === take ? messages[messages.length - 1]?.id : null;

    // 返回升序，便于前端自然渲染
    return {
      messages: [...messages].reverse(),
      nextCursor,
    };
  }

  async sendPrivateMessage(
    fromUserId: string,
    toUserId: string,
    content: string,
    type: MessageType = MessageType.TEXT
  ): Promise<PrivateChatMessage> {
    if (!content?.trim()) {
      throw new BadRequestException('消息内容不能为空');
    }

    // 验证好友关系
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: fromUserId, friendId: toUserId },
          { userId: toUserId, friendId: fromUserId },
        ],
      },
    });

    if (!friendship) {
      throw new NotFoundException('好友关系不存在，无法发送消息');
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        fromUserId,
        toUserId,
        content: content.trim(),
        type,
        isRead: false,
      },
    });

    // 推送实时消息
    this.ws.emitPrivateMessage(toUserId, message);

    return message as PrivateChatMessage;
  }

  async markPrivateMessagesRead(
    userId: string,
    friendId: string,
    messageIds?: string[]
  ) {
    const baseWhere: any = {
      fromUserId: friendId,
      toUserId: userId,
      isRead: false,
    };

    if (messageIds?.length) {
      baseWhere.id = { in: messageIds };
    }

    const targets = await this.prisma.chatMessage.findMany({
      where: baseWhere,
      select: { id: true },
    });

    if (!targets.length) {
      return { ok: true, updated: 0 };
    }

    const targetIds = targets.map((item: any) => item.id as string);
    const now = new Date();

    await this.prisma.chatMessage.updateMany({
      where: {
        id: { in: targetIds },
      },
      data: { isRead: true, readAt: now },
    });

    // 推送已读回执
    this.ws.emitPrivateMessageRead(friendId, userId, targetIds, now);

    return { ok: true, updated: targetIds.length };
  }

  async getPrivateUnreadCounts(userId: string) {
    // 获取所有好友
    const friendships = await this.prisma.friendship.findMany({
      where: { userId },
      select: { friendId: true },
    });

    const friendIds = friendships.map((f: any) => f.friendId as string);

    if (friendIds.length === 0) {
      return [];
    }

    // 按好友分组统计未读消息
    const grouped = await this.prisma.chatMessage.groupBy({
      by: ['fromUserId'],
      where: {
        fromUserId: { in: friendIds },
        toUserId: userId,
        isRead: false,
      },
      _count: { _all: true },
    });

    return grouped.map((item: any) => ({
      friendId: item.fromUserId,
      unread: item._count._all,
    }));
  }

  async getTotalUnreadCount(userId: string): Promise<number> {
    return await this.prisma.chatMessage.count({
      where: {
        toUserId: userId,
        isRead: false,
      },
    });
  }
}
