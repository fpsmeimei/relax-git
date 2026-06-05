import { CommentsController } from '../src/comments/comments.controller';

describe('CommentsController', () => {
  it('getMyReplies: maps service replies to the page response shape', async () => {
    const createdAt = new Date('2026-06-05T05:50:00.000Z');
    const commentsService = {
      getMyReplies: jest.fn().mockResolvedValue({
        items: [
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
        ],
        total: 1,
        page: 1,
        limit: 20,
      }),
    } as any;
    const controller = new CommentsController(commentsService);

    await expect(
      controller.getMyReplies('user1', 1, 20)
    ).resolves.toMatchObject({
      items: [
        {
          id: 'reply1',
          content: 'my reply',
          filePath: 'src/greet.js',
          lineNumber: 1,
          parentComment: {
            id: 'parent1',
            content: 'parent comment',
            author: { username: 'author' },
          },
          snapshot: {
            id: 'snap1',
            repository: { name: 'local-repo' },
          },
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    });
    expect(commentsService.getMyReplies).toHaveBeenCalledWith('user1', 1, 20);
  });
});
