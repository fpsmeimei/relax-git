import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  MessageType,
  Chat,
  FriendRequestStatus,
} from '@relax-git/shared/generated/prisma-client';
import { PrismaService } from '../database/prisma.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class ChatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ws: WebSocketGateway
  ) {}

  private makeDirectKey(a: string, b: string) {
    const [x, y] = [a, b].sort();
    return `${x}:${y}`;
  }

  async getMyChats(userId: string) {
    const memberships = await (this.prisma as any).chatMember.findMany({
      where: { userId },
      include: {
        chat: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, username: true, avatar: true },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                id: true,
                content: true,
                createdAt: true,
                senderId: true,
              },
            },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    // 计算未读
    const results = await Promise.all(
      memberships.map(async (m: any) => {
        const lastRead = (m.lastReadAt as Date | null) ?? new Date(0);
        const unreadCount = await (this.prisma as any).message.count({
          where: {
            chatId: m.chatId,
            senderId: { not: userId },
            createdAt: { gt: lastRead },
          },
        });
        const lastMessage = m.chat.messages[0] ?? null;
        // 过滤掉自己信息的联系人列表（取对方）
        const others = (m.chat.members as any[])
          .filter((cm: any) => cm.userId !== userId)
          .map((cm: any) => cm.user);
        return {
          chatId: m.chatId,
          type: m.chat.type,
          name: m.chat.name,
          members: others,
          lastMessage,
          unreadCount,
          updatedAt: m.chat.updatedAt,
        };
      })
    );

    // 按更新时间排序
    results.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return results;
  }

  async createDirectChat(
    currentUserId: string,
    targetUserId: string
  ): Promise<Chat> {
    if (currentUserId === targetUserId) {
      throw new BadRequestException('不能与自己创建私聊');
    }
    // 校验目标用户存在
    const other = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!other) throw new NotFoundException('用户不存在');

    const directKey = this.makeDirectKey(currentUserId, targetUserId);

    let chat = await (this.prisma as any).chat.findUnique({
      where: { directKey },
    });
    if (!chat) {
      chat = await (this.prisma as any).chat.create({
        data: {
          type: 'DIRECT',
          directKey,
          members: {
            createMany: {
              data: [
                { userId: currentUserId, role: 'MEMBER' },
                { userId: targetUserId, role: 'MEMBER' },
              ],
              skipDuplicates: true,
            },
          },
        },
      });
    } else {
      // 确保双方都是成员
      await (this.prisma as any).chatMember.createMany({
        data: [
          { chatId: chat.id, userId: currentUserId, role: 'MEMBER' },
          { chatId: chat.id, userId: targetUserId, role: 'MEMBER' },
        ],
        skipDuplicates: true,
      });
    }

    return chat;
  }

  async createGroupChat(ownerId: string, name: string, memberIds: string[]) {
    const uniqueMemberIds = Array.from(
      new Set([ownerId, ...memberIds.filter(Boolean)])
    );
    if (!name || !name.trim())
      throw new BadRequestException('群聊名称不能为空');

    const chat = await (this.prisma as any).chat.create({
      data: {
        type: 'GROUP',
        name: name.trim(),
        members: {
          create: uniqueMemberIds.map(uid => ({
            userId: uid,
            role: uid === ownerId ? 'ADMIN' : 'MEMBER',
          })),
        },
      },
    });

    return chat;
  }

  private async ensureMember(userId: string, chatId: string) {
    const m = await (this.prisma as any).chatMember.findUnique({
      where: { chatId_userId: { chatId, userId } } as any,
    });
    if (!m) throw new ForbiddenException('非会话成员，无法操作');
    return m;
  }

  async listMessages(
    userId: string,
    chatId: string,
    cursor?: string,
    limit = 20
  ) {
    await this.ensureMember(userId, chatId);
    const take = Math.max(1, Math.min(100, limit));

    // 查询消息，同时检查可见性
    const items = await (this.prisma as any).message.findMany({
      where: {
        chatId,
        // 只显示对当前用户可见的消息
        OR: [
          // 没有可见性记录的消息（默认可见）
          {
            visibility: {
              none: {
                userId,
              },
            },
          },
          // 有可见性记录且设置为可见的消息
          {
            visibility: {
              some: {
                userId,
                isVisible: true,
              },
            },
          },
        ],
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderId: true,
        type: true,
        isRead: true,
        readAt: true,
      },
    });

    const nextCursor =
      items.length === take ? items[items.length - 1]?.id : null;
    // 返回升序，便于前端自然渲染
    const messages = [...items].reverse();
    return { messages, nextCursor };
  }

  async getUnreadCounts(userId: string) {
    const memberships = await (this.prisma as any).chatMember.findMany({
      where: { userId },
      select: { chatId: true },
    });

    const chatIds = memberships.map((m: any) => m.chatId);

    let chatCounts: Array<{ chatId: string; unread: number }> = [];
    if (chatIds.length > 0) {
      const grouped = await (this.prisma as any).message.groupBy({
        by: ['chatId'],
        where: {
          chatId: { in: chatIds },
          senderId: { not: userId },
          isRead: false,
        },
        _count: { _all: true },
      });
      chatCounts = grouped.map((item: any) => ({
        chatId: item.chatId,
        unread: item._count?._all ?? 0,
      }));
    }

    const pendingFriendRequests = await (
      this.prisma as any
    ).friendRequest.count({
      where: {
        toUserId: userId,
        status: FriendRequestStatus.PENDING,
      },
    });

    return {
      chats: chatCounts,
      friendRequests: pendingFriendRequests,
    };
  }

  async sendMessage(
    userId: string,
    chatId: string,
    content: string,
    type: MessageType = MessageType.TEXT
  ) {
    if (!content || !content.trim())
      throw new BadRequestException('消息内容不能为空');
    await this.ensureMember(userId, chatId);

    const message = await (this.prisma as any).message.create({
      data: {
        chatId,
        senderId: userId,
        content: content.trim(),
        type,
        isRead: false,
      },
      select: {
        id: true,
        chatId: true,
        senderId: true,
        content: true,
        createdAt: true,
        type: true,
        isRead: true,
        readAt: true,
      },
    });

    // 更新聊天更新时间
    await (this.prisma as any).chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // 发送到房间
    this.ws.emitChatMessageNew(chatId, message);

    return message;
  }

  async markRead(userId: string, chatId: string, messageIds?: string[]) {
    await this.ensureMember(userId, chatId);
    const now = new Date();
    await (this.prisma as any).chatMember.update({
      where: { chatId_userId: { chatId, userId } } as any,
      data: { lastReadAt: now },
    });

    const baseWhere: Record<string, any> = {
      chatId,
      senderId: { not: userId },
      isRead: false,
    };
    if (messageIds?.length) {
      baseWhere.id = { in: messageIds };
    }

    const targets = await (this.prisma as any).message.findMany({
      where: baseWhere,
      select: { id: true },
    });

    if (!targets.length) {
      return { ok: true, updated: 0 };
    }

    const targetIds = targets.map((item: any) => item.id as string);

    await (this.prisma as any).message.updateMany({
      where: {
        id: { in: targetIds },
        chatId,
      },
      data: { isRead: true, readAt: now },
    });

    this.ws.emitChatMessageRead(chatId, userId, targetIds, now);

    return { ok: true, updated: targetIds.length };
  }

  async addMembers(adminUserId: string, chatId: string, memberIds: string[]) {
    const me = await this.ensureMember(adminUserId, chatId);
    const chat = await (this.prisma as any).chat.findUnique({
      where: { id: chatId },
    });
    if (!chat) throw new NotFoundException('会话不存在');
    if (chat.type !== 'GROUP')
      throw new BadRequestException('仅群聊可添加成员');
    if (me.role !== 'ADMIN') throw new ForbiddenException('仅群管理员可操作');

    const ids = Array.from(new Set(memberIds.filter(Boolean)));
    await (this.prisma as any).chatMember.createMany({
      data: ids.map(uid => ({ chatId, userId: uid, role: 'MEMBER' })),
      skipDuplicates: true,
    });
    return { ok: true };
  }

  async removeMember(
    adminUserId: string,
    chatId: string,
    targetUserId: string
  ) {
    const me = await this.ensureMember(adminUserId, chatId);
    const chat = await (this.prisma as any).chat.findUnique({
      where: { id: chatId },
    });
    if (!chat) throw new NotFoundException('会话不存在');
    if (chat.type !== 'GROUP')
      throw new BadRequestException('仅群聊可移除成员');
    if (me.role !== 'ADMIN') throw new ForbiddenException('仅群管理员可操作');

    const target = await (this.prisma as any).chatMember.findUnique({
      where: { chatId_userId: { chatId, userId: targetUserId } } as any,
    });
    if (!target) return { ok: true };

    // 不允许移除最后一个管理员
    if (target.role === 'ADMIN') {
      const adminCount = await (this.prisma as any).chatMember.count({
        where: { chatId, role: 'ADMIN' },
      });
      if (adminCount <= 1) throw new BadRequestException('至少保留一名管理员');
    }

    await (this.prisma as any).chatMember.delete({
      where: { chatId_userId: { chatId, userId: targetUserId } } as any,
    });
    return { ok: true };
  }

  async clearMessages(userId: string, chatId: string) {
    await this.ensureMember(userId, chatId);

    // 方案：将该聊天中对当前用户可见的所有消息设置为不可见
    // 这样用户看到的是完全清空，但数据库中消息仍然存在，对方不受影响

    // 1. 获取该聊天的所有消息ID
    const messages = await (this.prisma as any).message.findMany({
      where: { chatId },
      select: { id: true },
    });

    if (messages.length === 0) {
      return { ok: true, hidden: 0 };
    }

    const messageIds = messages.map((m: any) => m.id);

    // 2. 为当前用户创建或更新消息可见性记录，设置为不可见
    await (this.prisma as any).messageVisibility.createMany({
      data: messageIds.map((messageId: string) => ({
        messageId,
        userId,
        isVisible: false,
        hiddenAt: new Date(),
      })),
      skipDuplicates: true, // 如果已存在则跳过
    });

    // 3. 更新已存在的可见性记录
    await (this.prisma as any).messageVisibility.updateMany({
      where: {
        messageId: { in: messageIds },
        userId,
      },
      data: {
        isVisible: false,
        hiddenAt: new Date(),
      },
    });

    return { ok: true, hidden: messageIds.length };
  }
}
