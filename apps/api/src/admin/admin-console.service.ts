import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { HealthService } from '../health/health.service';

type WorkerHealthResponse = {
  status?: string;
  version?: string;
  uptime?: string;
};

@Injectable()
export class AdminConsoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly healthService: HealthService
  ) {}

  async getOverview() {
    const [
      userCount,
      adminCount,
      repositoryCount,
      publishedRepositoryCount,
      commentCount,
      baseSnapshotCount,
      sessionSnapshotCount,
      activeSessionSnapshotCount,
      recentRepositories,
      topRepositories,
      recentComments,
      apiHealth,
      systemStats,
      workerHealth,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'ADMIN' } as any }),
      this.prisma.repository.count(),
      this.prisma.repository.count({ where: { isPublished: true } }),
      this.prisma.comment.count(),
      this.prisma.baseSnapshot.count(),
      this.prisma.sessionSnapshot.count(),
      this.prisma.sessionSnapshot.count({
        where: {
          expiresAt: { gt: new Date() },
          status: 'READY',
        } as any,
      }),
      this.prisma.repository.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          visibility: true,
          isPublished: true,
          updatedAt: true,
          owner: {
            select: {
              username: true,
            },
          },
        },
      }),
      this.prisma.repository.findMany({
        take: 5,
        orderBy: [{ viewCount: 'desc' }, { stars: 'desc' }],
        select: {
          id: true,
          name: true,
          viewCount: true,
          stars: true,
          isPublished: true,
          owner: {
            select: {
              username: true,
            },
          },
        },
      }),
      this.prisma.comment.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          anchorType: true,
          createdAt: true,
          isResolved: true,
          author: {
            select: {
              username: true,
            },
          },
          snapshot: {
            select: {
              repository: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.healthService.check(),
      this.healthService.getStats(),
      this.checkWorkerHealth(),
    ]);

    const databaseStats = (systemStats as any)?.database?.counts ?? {};
    const redisStats = (systemStats as any)?.redis ?? {};

    return {
      overview: {
        users: userCount,
        admins: adminCount,
        repositories: repositoryCount,
        publishedRepositories: publishedRepositoryCount,
        comments: commentCount,
        baseSnapshots: baseSnapshotCount,
        sessionSnapshots: sessionSnapshotCount,
        activeSessionSnapshots: activeSessionSnapshotCount,
      },
      repositories: {
        recent: recentRepositories.map((repo: any) => ({
          id: repo.id,
          name: repo.name,
          owner: repo.owner.username,
          visibility: repo.visibility,
          isPublished: repo.isPublished,
          updatedAt: repo.updatedAt,
        })),
        popular: topRepositories.map((repo: any) => ({
          id: repo.id,
          name: repo.name,
          owner: repo.owner.username,
          viewCount: repo.viewCount,
          stars: repo.stars,
          isPublished: repo.isPublished,
        })),
      },
      comments: {
        recent: recentComments.map((comment: any) => ({
          id: comment.id,
          content: comment.content,
          anchorType: comment.anchorType,
          createdAt: comment.createdAt,
          isResolved: comment.isResolved,
          author: comment.author.username,
          repositoryId: comment.snapshot.repository.id,
          repositoryName: comment.snapshot.repository.name,
        })),
      },
      health: {
        api: apiHealth,
        worker: workerHealth,
        database: {
          healthy: !!apiHealth?.services?.database?.healthy,
          counts: databaseStats,
        },
        redis: {
          healthy: !!apiHealth?.services?.redis?.healthy,
          stats: redisStats,
        },
      },
      generatedAt: new Date().toISOString(),
    };
  }

  private async checkWorkerHealth() {
    const workerPort = process.env['WORKER_PORT'] ?? '3002';
    const url = `http://127.0.0.1:${workerPort}/health`;

    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        return {
          healthy: false,
          status: 'unreachable',
          message: `Worker responded with ${response.status}`,
        };
      }

      const data =
        ((await response
          .json()
          .catch(() => null)) as WorkerHealthResponse | null) ?? null;
      return {
        healthy: true,
        status: data?.status ?? 'healthy',
        version: data?.version,
        uptime: data?.uptime,
      };
    } catch (error) {
      return {
        healthy: false,
        status: 'offline',
        message:
          error instanceof Error ? error.message : 'Unknown worker error',
      };
    }
  }
}
