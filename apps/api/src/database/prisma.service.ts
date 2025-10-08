import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@relax-git/shared/generated/prisma-client';

/**
 * Prisma 数据库服务
 * 提供类型安全的数据库访问层
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: PrismaClient;

  constructor() {
    // 优先使用 DATABASE_URL，回退到单独的环境变量
    let url = process.env['DATABASE_URL'];

    if (!url) {
      const host = process.env['DATABASE_HOST'] ?? 'localhost';
      const port = parseInt(process.env['DATABASE_PORT'] ?? '5432', 10);
      const database = process.env['DATABASE_NAME'] ?? 'relax_git_dev';
      const username = process.env['DATABASE_USER'] ?? 'postgres';
      const password = process.env['DATABASE_PASSWORD'] ?? 'postgres';
      const ssl = process.env['DATABASE_SSL'] === 'true';
      const sslParam = ssl ? '?sslmode=require' : '';
      url = `postgresql://${username}:${password}@${host}:${port}/${database}${sslParam}`;
    }

    console.log('🔍 Prisma Config Debug:');
    console.log(
      'DATABASE_URL:',
      process.env['DATABASE_URL']?.substring(0, 50),
      '...'
    );
    console.log('Using URL:', url?.substring(0, 50), '...');

    this.client = new PrismaClient({
      datasources: {
        db: {
          url,
        },
      },
      log:
        process.env['NODE_ENV'] === 'development'
          ? ['error', 'warn']
          : ['error'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await (this.client as any).$connect();
  }

  async onModuleDestroy() {
    await (this.client as any).$disconnect();
  }

  // 数据库模型代理属性
  get user() {
    return (this.client as any).user;
  }

  get userSession() {
    return (this.client as any).userSession;
  }

  get repository() {
    return (this.client as any).repository;
  }

  get snapshot() {
    return (this.client as any).snapshot;
  }

  // 社区化快照模型代理
  get repositoryBranch() {
    return (this.client as any).repositoryBranch;
  }

  get baseSnapshot() {
    return (this.client as any).baseSnapshot;
  }

  get sessionSnapshot() {
    return (this.client as any).sessionSnapshot;
  }

  // 社区功能模型代理
  get repositoryLike() {
    return (this.client as any).repositoryLike;
  }

  get repositoryCollection() {
    return (this.client as any).repositoryCollection;
  }

  get repositoryView() {
    return (this.client as any).repositoryView;
  }

  get repositoryViewsAgg() {
    return (this.client as any).repositoryViewsAgg;
  }

  get comment() {
    return (this.client as any).comment;
  }

  // CommentLike 模型代理（用于评论点赞）
  get commentLike() {
    return (this.client as any).commentLike;
  }

  // 聊天系统模型代理
  get chat() {
    return (this.client as any).chat;
  }
  get chatMember() {
    return (this.client as any).chatMember;
  }
  get message() {
    return (this.client as any).message;
  }

  get friendship() {
    return (this.client as any).friendship;
  }

  get friendRequest() {
    return (this.client as any).friendRequest;
  }

  get chatMessage() {
    return (this.client as any).chatMessage;
  }

  get messageVisibility() {
    return (this.client as any).messageVisibility;
  }

  // Notification 模型代理（用于通知）
  get notification() {
    return (this.client as any).notification;
  }

  // Member / JoinRequest 模型代理（用于成员与申请）
  get member() {
    return (this.client as any).member;
  }
  get joinRequest() {
    return (this.client as any).joinRequest;
  }

  // RepositoryMember 模型代理
  get repositoryMember() {
    return (this.client as any).repositoryMember;
  }

  // SnapshotArtifact 模型代理（Phase 2）
  get snapshotArtifact() {
    return (this.client as any).snapshotArtifact;
  }

  get timelineEvent() {
    return (this.client as any).timelineEvent;
  }

  // SearchHistory 模型代理（供 SearchService 使用）
  get searchHistory() {
    return (this.client as any).searchHistory;
  }

  // Prisma 客户端方法代理
  get $connect() {
    return (this.client as any).$connect.bind(this.client);
  }

  get $disconnect() {
    return (this.client as any).$disconnect.bind(this.client);
  }

  get $queryRaw() {
    return (this.client as any).$queryRaw.bind(this.client);
  }

  get $executeRaw() {
    return (this.client as any).$executeRaw.bind(this.client);
  }

  get $transaction() {
    return (this.client as any).$transaction.bind(this.client);
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      await (this.client as any).$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 清理过期数据
   */
  async cleanupExpiredData(): Promise<void> {
    try {
      // 清理过期的快照
      const expiredSnapshots = await (this.client as any).snapshot.findMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      if (expiredSnapshots.length > 0) {
        await (this.client as any).snapshot.deleteMany({
          where: {
            expiresAt: {
              lt: new Date(),
            },
          },
        });
      }

      // 清理过期的用户会话
      const expiredSessions = await (this.client as any).userSession.findMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      if (expiredSessions.length > 0) {
        await (this.client as any).userSession.deleteMany({
          where: {
            expiresAt: {
              lt: new Date(),
            },
          },
        });
      }
    } catch (error) {
      // 基本错误处理
      console.error('Failed to cleanup expired data:', error);
    }
  }

  /**
   * 获取数据库运行时统计（用于健康检查展示）
   */
  async getStats(): Promise<Record<string, unknown>> {
    try {
      const [users, repos, snaps, comments, events] = await Promise.all([
        (this.client as any).user.count(),
        (this.client as any).repository.count(),
        (this.client as any).snapshot.count(),
        (this.client as any).comment.count(),
        (this.client as any).timelineEvent.count(),
      ]);
      return {
        counts: {
          users,
          repositories: repos,
          snapshots: snaps,
          comments,
          timelineEvents: events,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (e) {
      return {
        error: String(e ?? 'unknown'),
        timestamp: new Date().toISOString(),
      };
    }
  }
}
