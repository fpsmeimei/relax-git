import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import {
  FriendRequestStatus,
  MessageType,
} from '@relax-git/shared/generated/prisma-client';
import { PrismaService } from '../../database/prisma.service';
import { WebSocketGateway } from '../../websocket/websocket.gateway';
import { ChatsService } from '../chats.service';

export interface SearchResultItem {
  id: string;
  username: string;
  avatar?: string | null;
  status: 'friend' | 'pendingOutgoing' | 'pendingIncoming' | 'none';
}

export interface FriendListItem {
  id: string;
  username: string;
  avatar?: string | null;
  chatId: string | null;
  lastMessage: {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    type: MessageType;
    isRead: boolean;
    readAt: Date | null;
  } | null;
  unreadCount: number;
  createdAt: Date;
}

@Injectable()
export class ChatFriendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ws: WebSocketGateway,
    @Inject(forwardRef(() => ChatsService))
    private readonly chatsService: ChatsService
  ) {}

  private makeDirectKey(a: string, b: string) {
    const [x, y] = [a, b].sort();
    return `${x}:${y}`;
  }

  async searchUsers(
    userId: string,
    keyword: string
  ): Promise<SearchResultItem[]> {
    const q = keyword?.trim();
    if (!q) return [];

    const users = (await this.prisma.user.findMany({
      where: {
        isActive: true,
        id: { not: userId },
        username: { contains: q, mode: 'insensitive' },
      },
      select: { id: true, username: true, avatar: true },
      take: 20,
      orderBy: { username: 'asc' },
    })) as Array<{ id: string; username: string; avatar: string | null }>;

    if (users.length === 0) return [];

    const userIds = users.map(user => user.id);

    const friendships = (await this.prisma.friendship.findMany({
      where: { userId, friendId: { in: userIds } },
      select: { friendId: true },
    })) as Array<{ friendId: string }>;
    const friendSet = new Set(
      friendships.map(friendship => friendship.friendId)
    );

    const pendingRequests = (await this.prisma.friendRequest.findMany({
      where: {
        status: FriendRequestStatus.PENDING,
        OR: [
          { fromUserId: userId, toUserId: { in: userIds } },
          { toUserId: userId, fromUserId: { in: userIds } },
        ],
      },
      select: { fromUserId: true, toUserId: true },
    })) as Array<{ fromUserId: string; toUserId: string }>;

    const pendingOutgoing = new Set(
      pendingRequests
        .filter(request => request.fromUserId === userId)
        .map(request => request.toUserId)
    );
    const pendingIncoming = new Set(
      pendingRequests
        .filter(request => request.toUserId === userId)
        .map(request => request.fromUserId)
    );

    return users.map(user => ({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      status: friendSet.has(user.id)
        ? 'friend'
        : pendingOutgoing.has(user.id)
          ? 'pendingOutgoing'
          : pendingIncoming.has(user.id)
            ? 'pendingIncoming'
            : 'none',
    })) as SearchResultItem[];
  }

  async listFriends(userId: string): Promise<FriendListItem[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: { userId },
      include: {
        friend: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const results: FriendListItem[] = [];
    for (const friendship of friendships) {
      const directKey = this.makeDirectKey(userId, friendship.friendId);
      const chat = await this.prisma.chat.findUnique({
        where: { directKey },
        select: {
          id: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              senderId: true,
              type: true,
              isRead: true,
              readAt: true,
            },
          },
        },
      });

      const unreadCount = chat
        ? await this.prisma.message.count({
            where: {
              chatId: chat.id,
              senderId: friendship.friendId,
              isRead: false,
            },
          })
        : 0;

      results.push({
        id: friendship.friend.id,
        username: friendship.friend.username,
        avatar: friendship.friend.avatar,
        chatId: chat?.id ?? null,
        lastMessage: chat?.messages?.[0] ?? null,
        unreadCount,
        createdAt: friendship.createdAt,
      });
    }

    return results;
  }

  async listFriendRequests(
    userId: string,
    status: FriendRequestStatus | 'ALL' = FriendRequestStatus.PENDING
  ) {
    const whereStatus =
      status === 'ALL'
        ? undefined
        : { status: status ?? FriendRequestStatus.PENDING };

    const incoming = await this.prisma.friendRequest.findMany({
      where: {
        toUserId: userId,
        ...(whereStatus ? whereStatus : {}),
      },
      include: {
        fromUser: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const outgoing = await this.prisma.friendRequest.findMany({
      where: {
        fromUserId: userId,
        ...(whereStatus ? whereStatus : {}),
      },
      include: {
        toUser: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { incoming, outgoing };
  }

  async sendFriendRequest(
    fromUserId: string,
    toUserId: string,
    message?: string
  ) {
    if (!toUserId) throw new BadRequestException('目标用户不能为空');
    if (fromUserId === toUserId)
      throw new BadRequestException('不能向自己发送好友申请');

    const target = await this.prisma.user.findUnique({
      where: { id: toUserId, isActive: true },
      select: { id: true, username: true },
    });
    if (!target) throw new NotFoundException('用户不存在或不可用');

    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: fromUserId, friendId: toUserId },
          { userId: toUserId, friendId: fromUserId },
        ],
      },
    });
    if (existingFriendship) throw new BadRequestException('你们已经是好友了');

    const pending = await this.prisma.friendRequest.findFirst({
      where: {
        status: FriendRequestStatus.PENDING,
        OR: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      },
    });

    if (pending) {
      // 若对方已向我发起申请，则自动通过
      if (pending.toUserId === fromUserId) {
        return this.acceptFriendRequest(fromUserId, pending.id);
      }
      throw new BadRequestException('已有待处理的好友申请');
    }

    const request = await this.prisma.friendRequest.create({
      data: {
        fromUserId,
        toUserId,
        message: message?.trim() || null,
        status: FriendRequestStatus.PENDING,
      },
      include: {
        toUser: { select: { id: true, username: true, avatar: true } },
      },
    });

    // 推送聊天室通知
    this.ws.emitChatFriendRequestNew(toUserId, {
      requestId: request.id,
      fromUserId,
      message: request.message,
      createdAt: request.createdAt.toISOString(),
    });

    await this.emitUnreadCounts(fromUserId);
    await this.emitUnreadCounts(toUserId);

    return request;
  }

  async acceptFriendRequest(userId: string, requestId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('好友申请不存在');
    if (request.toUserId !== userId)
      throw new ForbiddenException('无权处理该好友申请');
    if (request.status === FriendRequestStatus.REJECTED)
      throw new BadRequestException('该好友申请已被拒绝');

    if (request.status === FriendRequestStatus.ACCEPTED) {
      return request;
    }

    await this.prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: FriendRequestStatus.ACCEPTED },
    });

    // 建立双向好友关系
    await this.prisma.friendship.createMany({
      data: [
        { userId: request.fromUserId, friendId: request.toUserId },
        { userId: request.toUserId, friendId: request.fromUserId },
      ],
      skipDuplicates: true,
    });

    // 创建或获取私聊
    const chat = await this.chatsService.createDirectChat(
      request.toUserId,
      request.fromUserId
    );

    // 生成系统消息
    if (chat?.id) {
      await this.prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: userId,
          content: '已通过好友申请',
          type: MessageType.SYSTEM,
          isRead: false,
        },
      });
    }

    // 推送通知给申请人
    this.ws.emitChatFriendRequestResult(request.fromUserId, {
      requestId: request.id,
      status: FriendRequestStatus.ACCEPTED,
      byUserId: userId,
      createdAt: new Date().toISOString(),
    });

    await this.emitUnreadCounts(request.fromUserId);
    await this.emitUnreadCounts(request.toUserId);

    return { ok: true }; // 简化返回
  }

  async rejectFriendRequest(userId: string, requestId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('好友申请不存在');
    if (request.toUserId !== userId)
      throw new ForbiddenException('无权处理该好友申请');

    await this.prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: FriendRequestStatus.REJECTED },
    });

    this.ws.emitChatFriendRequestResult(request.fromUserId, {
      requestId: request.id,
      status: FriendRequestStatus.REJECTED,
      byUserId: userId,
      createdAt: new Date().toISOString(),
    });

    await this.emitUnreadCounts(request.fromUserId);
    await this.emitUnreadCounts(request.toUserId);

    return { ok: true };
  }

  async removeFriend(userId: string, friendId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        userId,
        friendId,
      },
    });
    if (!friendship) throw new NotFoundException('未找到该好友关系');

    await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    await this.emitUnreadCounts(userId);
    await this.emitUnreadCounts(friendId);

    return { ok: true };
  }

  private async emitUnreadCounts(userId: string) {
    const counts = await this.chatsService.getUnreadCounts(userId);
    this.ws.emitChatUnreadCounts(userId, counts);
  }
}
