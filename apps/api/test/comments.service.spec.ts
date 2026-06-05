import { CommentsService } from '../src/comments/comments.service';

function createPrismaMock() {
  return {
    comment: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    commentLike: {
      findMany: jest.fn(),
    },
  } as any;
}

describe('CommentsService', () => {
  it('getMyComments: hides comments attached to deleted repositories', async () => {
    const prisma = createPrismaMock();
    const redis = {} as any;
    const websocketGateway = {} as any;
    const service = new CommentsService(prisma, redis, websocketGateway);
    const createdAt = new Date('2026-06-05T05:50:00.000Z');

    prisma.comment.findMany.mockResolvedValue([
      {
        id: 'comment1',
        content: 'my comment',
        createdAt,
        snapshot: {
          id: 'snap1',
          commitSha: 'ad50045d578a34905c266892056403c205eea6be',
          repository: { id: 'repo1', name: 'local-repo' },
        },
      },
    ]);
    prisma.comment.count.mockResolvedValue(1);
    prisma.commentLike.findMany.mockResolvedValue([]);

    await expect(service.getMyComments('user1', 1, 20)).resolves.toMatchObject({
      items: [
        {
          id: 'comment1',
          snapshot: { repository: { name: 'local-repo' } },
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    });
    expect(prisma.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          authorId: 'user1',
          snapshot: { repository: { isActive: true } },
        },
      })
    );
    expect(prisma.comment.count).toHaveBeenCalledWith({
      where: {
        authorId: 'user1',
        snapshot: { repository: { isActive: true } },
      },
    });
  });

  it('getMyReplies: lists only replies authored by the current user', async () => {
    const prisma = createPrismaMock();
    const redis = {} as any;
    const websocketGateway = {} as any;
    const service = new CommentsService(prisma, redis, websocketGateway);
    const createdAt = new Date('2026-06-05T05:50:00.000Z');

    prisma.comment.findMany.mockResolvedValue([
      {
        id: 'reply1',
        content: 'my reply',
        createdAt,
        filePath: 'src/greet.js',
        lineStart: 1,
        parent: {
          id: 'parent1',
          content: 'parent comment',
          author: { id: 'author1', username: 'author', avatar: null },
        },
        snapshot: {
          id: 'snap1',
          commitSha: 'ad50045d578a34905c266892056403c205eea6be',
          repository: { id: 'repo1', name: 'local-repo' },
        },
      },
    ]);
    prisma.comment.count.mockResolvedValue(1);

    await expect(service.getMyReplies('user1', 2, 10)).resolves.toMatchObject({
      items: [
        {
          id: 'reply1',
          parent: { id: 'parent1' },
          snapshot: { repository: { name: 'local-repo' } },
        },
      ],
      total: 1,
      page: 2,
      limit: 10,
    });
    expect(prisma.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          authorId: 'user1',
          parentId: { not: null },
          snapshot: { repository: { isActive: true } },
        },
        skip: 10,
        take: 10,
        orderBy: { createdAt: 'desc' },
      })
    );
    expect(prisma.comment.count).toHaveBeenCalledWith({
      where: {
        authorId: 'user1',
        parentId: { not: null },
        snapshot: { repository: { isActive: true } },
      },
    });
  });
});
