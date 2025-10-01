import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionSnapshotStatus } from '@relax-git/shared/generated/prisma-client';
import * as fs from 'fs-extra';
import * as path from 'path';
import { PrismaService } from '../database/prisma.service';

/**
 * Phase 2.2: Session 快照生命周期管理服务
 * 负责管理临时快照的创建、续期和清理
 */
@Injectable()
export class SessionLifecycleService {
  private readonly logger = new Logger(SessionLifecycleService.name);
  private readonly defaultTtlMinutes: number;
  private readonly maxExtensions: number;
  private readonly cleanupBatchSize = 100;
  private readonly snapshotBasePath: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    // 从配置读取参数
    this.defaultTtlMinutes = this.configService.get<number>(
      'sessionSnapshot.ttlMinutes',
      60
    );
    this.maxExtensions = this.configService.get<number>(
      'sessionSnapshot.maxExtensions',
      3
    );
    this.snapshotBasePath = this.configService.get<string>(
      'snapshot.basePath',
      '/tmp/relax-git-sessions'
    );
  }

  /**
   * 创建会话快照（改进版）
   * 支持访问自动续期和扩展次数限制
   */
  async createSessionSnapshot(
    userId: string,
    baseSnapshotId: string,
    options?: {
      ttlMinutes?: number;
      metadata?: any;
    }
  ): Promise<any> {
    const ttlMinutes = options?.ttlMinutes || this.defaultTtlMinutes;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

    // 检查是否已有活跃的会话快照
    const existing = await this.prisma.sessionSnapshot.findFirst({
      where: {
        userId,
        baseSnapshotId,
        status: SessionSnapshotStatus.READY,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existing) {
      // 自动续期
      return this.extendSessionSnapshot(existing.id, userId);
    }

    // 创建新的会话快照
    const sessionSnapshot = await this.prisma.sessionSnapshot.create({
      data: {
        baseSnapshotId,
        userId,
        status: SessionSnapshotStatus.CREATING,
        expiresAt,
        // 存储元数据，包括扩展次数
        metadata: {
          ...options?.metadata,
          extensionCount: 0,
          originalTtlMinutes: ttlMinutes,
        },
      },
      include: {
        baseSnapshot: {
          include: {
            repository: true,
            branch: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // 异步创建工作树副本
    this.createWorktreeAsync(sessionSnapshot);

    return sessionSnapshot;
  }

  /**
   * 延长会话快照生命周期
   */
  async extendSessionSnapshot(id: string, userId: string): Promise<any> {
    const session = await this.prisma.sessionSnapshot.findUnique({
      where: { id },
    });

    if (!session || session.userId !== userId) {
      throw new Error('Session snapshot not found or access denied');
    }

    // 检查扩展次数
    const metadata = (session.metadata as any) || {};
    const extensionCount = metadata.extensionCount || 0;

    if (extensionCount >= this.maxExtensions) {
      this.logger.warn(
        `Session ${id} reached max extensions (${this.maxExtensions})`
      );
      return session; // 不再延期，但返回当前状态
    }

    // 计算新的过期时间
    const ttlMinutes = metadata.originalTtlMinutes || this.defaultTtlMinutes;
    const newExpiresAt = new Date();
    newExpiresAt.setMinutes(newExpiresAt.getMinutes() + ttlMinutes);

    // 更新会话
    const updated = await this.prisma.sessionSnapshot.update({
      where: { id },
      data: {
        expiresAt: newExpiresAt,
        lastAccessedAt: new Date(),
        metadata: {
          ...metadata,
          extensionCount: extensionCount + 1,
          lastExtendedAt: new Date().toISOString(),
        },
      },
      include: {
        baseSnapshot: {
          include: {
            repository: true,
            branch: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    this.logger.log(
      `Extended session ${id} (extension ${extensionCount + 1}/${this.maxExtensions})`
    );

    return updated;
  }

  /**
   * 手动释放会话快照
   */
  async releaseSessionSnapshot(id: string, userId: string): Promise<void> {
    const session = await this.prisma.sessionSnapshot.findUnique({
      where: { id },
    });

    if (!session || session.userId !== userId) {
      throw new Error('Session snapshot not found or access denied');
    }

    // 标记为过期
    await this.prisma.sessionSnapshot.update({
      where: { id },
      data: {
        status: SessionSnapshotStatus.EXPIRED,
        expiresAt: new Date(), // 立即过期
      },
    });

    // 清理工作树
    if (session.worktreePath) {
      await this.cleanupWorktree(session.worktreePath);
    }

    this.logger.log(`Released session snapshot ${id} by user ${userId}`);
  }

  /**
   * 定时任务：清理过期的会话快照
   * 每5分钟执行一次
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async cleanupExpiredSessions(): Promise<void> {
    this.logger.debug('Starting expired session cleanup...');

    try {
      const expiredSessions = await this.prisma.sessionSnapshot.findMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
          status: {
            not: SessionSnapshotStatus.EXPIRED,
          },
        },
        take: this.cleanupBatchSize,
        select: {
          id: true,
          worktreePath: true,
        },
      });

      if (expiredSessions.length === 0) {
        return;
      }

      this.logger.log(
        `Found ${expiredSessions.length} expired sessions to cleanup`
      );

      // 批量更新状态
      await this.prisma.sessionSnapshot.updateMany({
        where: {
          id: {
            in: expiredSessions.map((s: { id: string }) => s.id),
          },
        },
        data: {
          status: SessionSnapshotStatus.EXPIRED,
        },
      });

      // 异步清理工作树
      for (const session of expiredSessions) {
        if (session.worktreePath) {
          await this.cleanupWorktree(session.worktreePath);
        }
      }

      this.logger.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    } catch (error) {
      this.logger.error('Failed to cleanup expired sessions:', error);
    }
  }

  /**
   * 定时任务：删除旧的过期记录
   * 每天凌晨2点执行
   */
  @Cron('0 2 * * *')
  async deleteOldExpiredSessions(): Promise<void> {
    this.logger.debug('Starting old expired session deletion...');

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // 保留7天的过期记录

      const result = await this.prisma.sessionSnapshot.deleteMany({
        where: {
          status: SessionSnapshotStatus.EXPIRED,
          updatedAt: {
            lt: cutoffDate,
          },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Deleted ${result.count} old expired session records`);
      }
    } catch (error) {
      this.logger.error('Failed to delete old expired sessions:', error);
    }
  }

  /**
   * 统计会话快照使用情况
   */
  async getSessionStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    creating: number;
    failed: number;
    diskUsage: string;
  }> {
    const [total, active, expired, creating, failed] = await Promise.all([
      this.prisma.sessionSnapshot.count(),
      this.prisma.sessionSnapshot.count({
        where: {
          status: SessionSnapshotStatus.READY,
          expiresAt: { gt: new Date() },
        },
      }),
      this.prisma.sessionSnapshot.count({
        where: { status: SessionSnapshotStatus.EXPIRED },
      }),
      this.prisma.sessionSnapshot.count({
        where: { status: SessionSnapshotStatus.CREATING },
      }),
      this.prisma.sessionSnapshot.count({
        where: { status: SessionSnapshotStatus.FAILED },
      }),
    ]);

    // 计算磁盘使用（简化版）
    const diskUsage = await this.calculateDiskUsage();

    return {
      total,
      active,
      expired,
      creating,
      failed,
      diskUsage,
    };
  }

  /**
   * 异步创建工作树副本
   */
  private async createWorktreeAsync(sessionSnapshot: any): Promise<void> {
    try {
      const baseSnapshot = sessionSnapshot.baseSnapshot;
      if (!baseSnapshot?.worktreePath) {
        throw new Error('Base snapshot worktree not available');
      }

      // 生成会话工作树路径
      const sessionPath = path.join(
        this.snapshotBasePath,
        sessionSnapshot.userId,
        sessionSnapshot.id
      );

      // 确保目录存在
      await fs.ensureDir(path.dirname(sessionPath));

      // 复制工作树（这里简化处理，实际可能需要使用 git worktree）
      await fs.copy(baseSnapshot.worktreePath, sessionPath);

      // 更新状态
      await this.prisma.sessionSnapshot.update({
        where: { id: sessionSnapshot.id },
        data: {
          worktreePath: sessionPath,
          status: SessionSnapshotStatus.READY,
        },
      });

      this.logger.log(`Created session worktree at ${sessionPath}`);
    } catch (error) {
      this.logger.error(
        `Failed to create session worktree for ${sessionSnapshot.id}:`,
        error
      );

      await this.prisma.sessionSnapshot.update({
        where: { id: sessionSnapshot.id },
        data: {
          status: SessionSnapshotStatus.FAILED,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  /**
   * 清理工作树目录
   */
  private async cleanupWorktree(worktreePath: string): Promise<void> {
    try {
      if (await fs.pathExists(worktreePath)) {
        await fs.remove(worktreePath);
        this.logger.debug(`Cleaned up worktree at ${worktreePath}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to cleanup worktree at ${worktreePath}:`,
        error
      );
    }
  }

  /**
   * 计算磁盘使用量
   */
  private async calculateDiskUsage(): Promise<string> {
    try {
      // 简化版：返回估算值
      const activeSessions = await this.prisma.sessionSnapshot.count({
        where: {
          status: SessionSnapshotStatus.READY,
          worktreePath: { not: null },
        },
      });

      const estimatedSizePerSession = 50 * 1024 * 1024; // 假设每个会话50MB
      const totalBytes = activeSessions * estimatedSizePerSession;

      if (totalBytes < 1024 * 1024) {
        return `${(totalBytes / 1024).toFixed(2)} KB`;
      } else if (totalBytes < 1024 * 1024 * 1024) {
        return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
      } else {
        return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      }
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * 获取用户的活跃会话快照
   */
  async getUserActiveSessions(userId: string): Promise<any[]> {
    return this.prisma.sessionSnapshot.findMany({
      where: {
        userId,
        status: SessionSnapshotStatus.READY,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        baseSnapshot: {
          include: {
            repository: {
              select: {
                id: true,
                name: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    });
  }
}
