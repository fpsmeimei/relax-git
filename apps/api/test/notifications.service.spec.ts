import { NotificationsService } from '../src/notifications/notifications.service';

function createPrismaMock() {
  const mock: any = {
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  return mock;
}

describe('NotificationsService', () => {
  it('unreadCount: 按 userId 统计未读数量', async () => {
    const prisma = createPrismaMock();
    prisma.notification.count.mockResolvedValue(3);
    const svc = new NotificationsService(prisma);
    const res = await svc.unreadCount('u1');
    expect(res).toEqual({ count: 3 });
    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: { userId: 'u1', isRead: false },
    });
  });

  it('markRead: 仅更新本人通知（where 包含 userId）', async () => {
    const prisma = createPrismaMock();
    prisma.notification.updateMany.mockResolvedValue({ count: 1 });
    const svc = new NotificationsService(prisma);
    const res = await svc.markRead('u1', 'n1');
    expect(res).toEqual({ success: true, updated: 1 });
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { id: 'n1', userId: 'u1' },
      data: { isRead: true },
    });
  });

  it('markManyRead: 支持批量 ids（限定 userId）', async () => {
    const prisma = createPrismaMock();
    prisma.notification.updateMany.mockResolvedValue({ count: 2 });
    const svc = new NotificationsService(prisma);
    const res = await svc.markManyRead('u1', ['n1', 'n2']);
    expect(res).toEqual({ success: true, updated: 2 });
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'u1', id: { in: ['n1', 'n2'] } },
      data: { isRead: true },
    });
  });

  it('markAllRead: 仅更新本人未读（限定 userId + isRead=false）', async () => {
    const prisma = createPrismaMock();
    prisma.notification.updateMany.mockResolvedValue({ count: 5 });
    const svc = new NotificationsService(prisma);
    const res = await svc.markAllRead('u1');
    expect(res).toEqual({ success: true, updated: 5 });
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'u1', isRead: false },
      data: { isRead: true },
    });
  });

  it('list: 支持 isRead 过滤与分页', async () => {
    const prisma = createPrismaMock();
    prisma.notification.findMany.mockResolvedValue([{ id: 'n1' }]);
    prisma.notification.count.mockResolvedValue(1);
    const svc = new NotificationsService(prisma);
    const res = await svc.list({
      userId: 'u1',
      isRead: false,
      page: 2,
      limit: 10,
    });
    expect(res).toEqual({
      items: [{ id: 'n1' }],
      total: 1,
      page: 2,
      limit: 10,
    });
    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u1', isRead: false },
        skip: 10,
        take: 10,
        orderBy: { createdAt: 'desc' },
      })
    );
    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: { userId: 'u1', isRead: false },
    });
  });
});
