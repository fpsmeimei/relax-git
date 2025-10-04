import { ChatFriendsService } from '../src/chats/friends/chat-friends.service';
import {
  FriendRequestStatus,
  MessageType,
} from '@relax-git/shared/generated/prisma-client';

describe('ChatFriendsService', () => {
  let prisma: any;
  let ws: any;
  let chats: any;
  let service: ChatFriendsService;

  beforeEach(() => {
    prisma = {
      user: { findMany: jest.fn(), findUnique: jest.fn() },
      friendship: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        createMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      friendRequest: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      chat: { findUnique: jest.fn() },
      message: { count: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
    };

    ws = {
      emitChatFriendRequestNew: jest.fn(),
      emitChatFriendRequestResult: jest.fn(),
      emitChatUnreadCounts: jest.fn(),
    };

    chats = {
      createDirectChat: jest.fn(),
      getUnreadCounts: jest
        .fn()
        .mockResolvedValue({ chats: [], friendRequests: 1 }),
    };

    service = new ChatFriendsService(prisma, ws, chats as any);
  });

  describe('searchUsers', () => {
    it('should return mapped search results with status flags', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 'u2', username: 'alice', avatar: 'a.png' },
        { id: 'u3', username: 'bob', avatar: null },
      ]);
      prisma.friendship.findMany.mockResolvedValue([{ friendId: 'u2' }]);
      prisma.friendRequest.findMany.mockResolvedValue([
        { fromUserId: 'me', toUserId: 'u3' },
      ]);

      const result = await service.searchUsers('me', 'a');

      expect(result).toEqual([
        {
          id: 'u2',
          username: 'alice',
          avatar: 'a.png',
          status: 'friend',
        },
        {
          id: 'u3',
          username: 'bob',
          avatar: null,
          status: 'pendingOutgoing',
        },
      ]);
    });
  });

  describe('sendFriendRequest', () => {
    beforeEach(() => {
      prisma.friendship.findFirst.mockResolvedValue(null);
      prisma.friendRequest.findFirst.mockResolvedValue(null);
      prisma.friendRequest.create.mockResolvedValue({
        id: 'req1',
        fromUserId: 'me',
        toUserId: 'target',
        message: 'hi',
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'target',
        username: 'Target',
      });
    });

    it('should create pending request and emit websocket notifications', async () => {
      const res = await service.sendFriendRequest('me', 'target', 'hi');

      expect(prisma.friendRequest.create).toHaveBeenCalled();
      expect(ws.emitChatFriendRequestNew).toHaveBeenCalledWith('target', {
        requestId: 'req1',
        fromUserId: 'me',
        message: 'hi',
        createdAt: '2025-01-01T00:00:00.000Z',
      });
      expect(chats.getUnreadCounts).toHaveBeenCalledTimes(2);
      expect(ws.emitChatUnreadCounts).toHaveBeenCalledWith('me', {
        chats: [],
        friendRequests: 1,
      });
      expect(ws.emitChatUnreadCounts).toHaveBeenCalledWith('target', {
        chats: [],
        friendRequests: 1,
      });
      expect(res).toMatchObject({ id: 'req1' });
    });

    it('should auto accept when inverse pending exists', async () => {
      const spy = jest
        .spyOn(service as any, 'acceptFriendRequest')
        .mockResolvedValue({ ok: true });
      prisma.friendRequest.findFirst.mockResolvedValue({
        id: 'req-inverse',
        fromUserId: 'target',
        toUserId: 'me',
        status: FriendRequestStatus.PENDING,
      });

      const res = await service.sendFriendRequest('me', 'target', 'hello');

      expect(spy).toHaveBeenCalledWith('me', 'req-inverse');
      expect(res).toEqual({ ok: true });
    });
  });

  describe('acceptFriendRequest', () => {
    beforeEach(() => {
      prisma.friendRequest.findUnique.mockResolvedValue({
        id: 'req1',
        fromUserId: 'from-user',
        toUserId: 'me',
        status: FriendRequestStatus.PENDING,
      });
      prisma.friendRequest.update.mockResolvedValue({ id: 'req1' });
      prisma.friendship.createMany.mockResolvedValue(undefined);
      prisma.message.create.mockResolvedValue({});
      chats.createDirectChat.mockResolvedValue({ id: 'chat123' });
    });

    it('should accept request, create friendships and emit notifications', async () => {
      const result = await service.acceptFriendRequest('me', 'req1');

      expect(prisma.friendRequest.update).toHaveBeenCalledWith({
        where: { id: 'req1' },
        data: { status: FriendRequestStatus.ACCEPTED },
      });
      expect(prisma.friendship.createMany).toHaveBeenCalledWith({
        data: [
          { userId: 'from-user', friendId: 'me' },
          { userId: 'me', friendId: 'from-user' },
        ],
        skipDuplicates: true,
      });
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          chatId: 'chat123',
          senderId: 'me',
          type: MessageType.SYSTEM,
        }),
      });
      expect(ws.emitChatFriendRequestResult).toHaveBeenCalledWith('from-user', {
        requestId: 'req1',
        status: FriendRequestStatus.ACCEPTED,
        byUserId: 'me',
        createdAt: expect.any(String),
      });
      expect(result).toEqual({ ok: true });
    });
  });

  describe('rejectFriendRequest', () => {
    beforeEach(() => {
      prisma.friendRequest.findUnique.mockResolvedValue({
        id: 'req1',
        fromUserId: 'from-user',
        toUserId: 'me',
        status: FriendRequestStatus.PENDING,
      });
      prisma.friendRequest.update.mockResolvedValue({ id: 'req1' });
    });

    it('should reject request and emit result', async () => {
      const result = await service.rejectFriendRequest('me', 'req1');

      expect(prisma.friendRequest.update).toHaveBeenCalledWith({
        where: { id: 'req1' },
        data: { status: FriendRequestStatus.REJECTED },
      });
      expect(ws.emitChatFriendRequestResult).toHaveBeenCalledWith('from-user', {
        requestId: 'req1',
        status: FriendRequestStatus.REJECTED,
        byUserId: 'me',
        createdAt: expect.any(String),
      });
      expect(result).toEqual({ ok: true });
    });
  });
});
