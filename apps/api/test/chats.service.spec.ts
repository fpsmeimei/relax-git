import { ChatsService } from '../src/chats/chats.service';
import {
  MessageType,
  FriendRequestStatus,
} from '@relax-git/shared/generated/prisma-client';

describe('ChatsService', () => {
  let prisma: any;
  let ws: any;
  let service: ChatsService;

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn() },
      chat: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      chatMember: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        createMany: jest.fn(),
      },
      message: {
        findMany: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
        updateMany: jest.fn(),
        groupBy: jest.fn(),
      },
      friendRequest: { count: jest.fn() },
      friendship: { findMany: jest.fn() },
    };

    ws = {
      emitChatMessageNew: jest.fn(),
      emitChatMessageRead: jest.fn(),
      emitChatUnreadCounts: jest.fn(),
    };

    service = new ChatsService(prisma as any, ws as any);
  });

  describe('sendMessage', () => {
    it('should persist message, update chat and emit websocket event', async () => {
      prisma.chatMember.findUnique.mockResolvedValue({
        chatId: 'chat1',
        userId: 'user1',
      });
      prisma.chatMember.findMany.mockResolvedValue([
        { userId: 'user1' },
        { userId: 'user2' },
      ]);
      prisma.message.groupBy.mockResolvedValue([]);
      prisma.friendRequest.count.mockResolvedValue(0);
      prisma.message.create.mockResolvedValue({
        id: 'msg1',
        chatId: 'chat1',
        senderId: 'user1',
        content: 'hello',
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        type: MessageType.TEXT,
        isRead: false,
        readAt: null,
      });

      const result = await service.sendMessage('user1', 'chat1', ' hello ');

      expect(prisma.message.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          chatId: 'chat1',
          senderId: 'user1',
          content: 'hello',
          type: MessageType.TEXT,
          isRead: false,
        }),
        select: expect.any(Object),
      });
      expect(prisma.chat.update).toHaveBeenCalledWith({
        where: { id: 'chat1' },
        data: { updatedAt: expect.any(Date) },
      });
      expect(ws.emitChatMessageNew).toHaveBeenCalledWith('chat1', result);
      expect(ws.emitChatUnreadCounts).toHaveBeenNthCalledWith(1, 'user1', {
        chats: [],
        friendRequests: 0,
      });
      expect(ws.emitChatUnreadCounts).toHaveBeenNthCalledWith(2, 'user2', {
        chats: [],
        friendRequests: 0,
      });
      expect(result).toMatchObject({ id: 'msg1', content: 'hello' });
    });
  });

  describe('markRead', () => {
    it('should update lastRead, mark messages as read and emit receipt', async () => {
      const now = new Date('2025-02-01T00:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => now as any);

      prisma.chatMember.findUnique.mockResolvedValue({
        chatId: 'chat1',
        userId: 'user2',
      });
      prisma.chatMember.findMany.mockResolvedValue([
        { userId: 'user1' },
        { userId: 'user2' },
      ]);
      prisma.message.groupBy.mockResolvedValue([]);
      prisma.friendRequest.count.mockResolvedValue(0);
      prisma.chatMember.update.mockResolvedValue(undefined);
      prisma.message.findMany.mockResolvedValue([{ id: 'm1' }, { id: 'm2' }]);
      prisma.message.updateMany.mockResolvedValue({ count: 2 });

      const res = await service.markRead('user2', 'chat1');

      expect(prisma.message.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['m1', 'm2'] },
          chatId: 'chat1',
        },
        data: { isRead: true, readAt: now },
      });
      expect(ws.emitChatMessageRead).toHaveBeenCalledWith(
        'chat1',
        'user2',
        ['m1', 'm2'],
        now
      );
      expect(ws.emitChatUnreadCounts).toHaveBeenNthCalledWith(1, 'user1', {
        chats: [],
        friendRequests: 0,
      });
      expect(ws.emitChatUnreadCounts).toHaveBeenNthCalledWith(2, 'user2', {
        chats: [],
        friendRequests: 0,
      });
      expect(res).toEqual({ ok: true, updated: 2 });

      (global.Date as unknown as jest.Mock).mockRestore();
    });

    it('should return zero when no unread messages', async () => {
      prisma.chatMember.findUnique.mockResolvedValue({
        chatId: 'chat1',
        userId: 'user2',
      });
      prisma.message.findMany.mockResolvedValue([]);

      const res = await service.markRead('user2', 'chat1');

      expect(res).toEqual({ ok: true, updated: 0 });
      expect(prisma.message.updateMany).not.toHaveBeenCalled();
      expect(ws.emitChatMessageRead).not.toHaveBeenCalled();
    });
  });

  describe('getUnreadCounts', () => {
    it('should aggregate unread messages and pending friend requests', async () => {
      prisma.chatMember.findMany.mockResolvedValue([
        { chatId: 'chat1' },
        { chatId: 'chat2' },
      ]);
      prisma.message.groupBy.mockResolvedValue([
        { chatId: 'chat1', _count: { _all: 3 } },
      ]);
      prisma.friendRequest.count.mockResolvedValue(2);

      const res = await service.getUnreadCounts('user1');

      expect(res).toEqual({
        chats: [{ chatId: 'chat1', unread: 3 }],
        friendRequests: 2,
      });
      expect(prisma.friendRequest.count).toHaveBeenCalledWith({
        where: { toUserId: 'user1', status: FriendRequestStatus.PENDING },
      });
    });
  });
});
