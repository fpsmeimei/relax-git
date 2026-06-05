import {
  RepositoryVisibility,
  UserRole,
} from '@relax-git/shared/generated/prisma-client';
import { SearchType } from '../src/search/dto';
import { SearchService } from '../src/search/search.service';

function createPrismaMock() {
  return {
    repository: { findUnique: jest.fn() },
    searchHistory: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  } as any;
}

describe('SearchService', () => {
  it('enqueues a local workDir for local repository searches', async () => {
    const prisma = createPrismaMock();
    const redis = { enqueue: jest.fn() } as any;
    const websocketGateway = { emitUserNotification: jest.fn() } as any;
    const service = new SearchService(prisma, redis, websocketGateway);

    prisma.repository.findUnique.mockResolvedValue({
      id: 'repo1',
      name: 'local-repo',
      ownerId: 'user1',
      gitUrl: '/tmp/local-repo',
      visibility: RepositoryVisibility.PRIVATE,
      owner: { id: 'user1', username: 'owner' },
    });
    prisma.searchHistory.create.mockResolvedValue({});

    await service.createSearch(
      'user1',
      {
        repositoryId: 'repo1',
        query: 'greet',
        searchType: SearchType.CONTENT,
      },
      UserRole.USER
    );

    expect(redis.enqueue).toHaveBeenCalledWith(
      'search:queue',
      expect.objectContaining({
        repositoryId: 'repo1',
        query: 'greet',
        workDir: '/tmp/local-repo',
      })
    );
  });

  it('updates search history results count when completed results are read', async () => {
    const prisma = createPrismaMock();
    const redis = {
      enqueue: jest.fn(),
      get: jest.fn().mockResolvedValue({
        status: 'COMPLETED',
        results: [
          {
            filePath: 'src/greet.js',
            lineNumber: 1,
            lineContent: 'export function greet() {}',
            matchStart: 16,
            matchEnd: 21,
          },
        ],
        totalMatches: 1,
        processedAt: '2026-06-05T05:30:00.000Z',
      }),
    } as any;
    const websocketGateway = { emitUserNotification: jest.fn() } as any;
    const service = new SearchService(prisma, redis, websocketGateway);

    prisma.searchHistory.findFirst.mockResolvedValue({
      id: 'search1',
      userId: 'user1',
      resultsCount: 0,
    });
    prisma.searchHistory.update.mockResolvedValue({});

    await expect(
      service.getSearchResult('search1', 'user1')
    ).resolves.toMatchObject({
      id: 'search1',
      status: 'COMPLETED',
      totalMatches: 1,
    });
    expect(prisma.searchHistory.update).toHaveBeenCalledWith({
      where: { id: 'search1' },
      data: { resultsCount: 1 },
    });
  });

  it('maps base snapshot fields for search history items', async () => {
    const prisma = createPrismaMock();
    const redis = { enqueue: jest.fn(), get: jest.fn() } as any;
    const websocketGateway = { emitUserNotification: jest.fn() } as any;
    const service = new SearchService(prisma, redis, websocketGateway);

    prisma.searchHistory.findMany.mockResolvedValue([
      {
        id: 'history1',
        query: 'greet',
        searchType: SearchType.CONTENT,
        resultsCount: 1,
        repository: { id: 'repo1', name: 'local-repo' },
        snapshot: {
          id: 'snap1',
          commitSha: 'ad50045d578a34905c266892056403c205eea6be',
          branch: { name: 'main' },
        },
        createdAt: new Date('2026-06-05T05:30:00.000Z'),
      },
    ]);
    prisma.searchHistory.count.mockResolvedValue(1);

    await expect(
      service.getSearchHistory('user1', {
        repositoryId: 'repo1',
        page: 1,
        limit: 20,
      })
    ).resolves.toMatchObject({
      history: [
        {
          id: 'history1',
          snapshot: {
            id: 'snap1',
            title: 'main@ad50045',
          },
        },
      ],
      total: 1,
    });
  });
});
