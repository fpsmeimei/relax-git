import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs-extra';
import * as path from 'path';
import { PrismaService } from '../database/prisma.service';
// SessionSnapshotService已废弃，清理功能已集成到统一服务中

/**
 * 快照清理服务
 * 负责定时清理过期的会话快照和孤儿文件
 */
@Injectable()
export class SnapshotCleanupService {
  private readonly logger = new Logger(SnapshotCleanupService.name);
  private readonly snapshotBasePath: string;
  private readonly orphanCleanupEnabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    this.snapshotBasePath = this.configService.get<string>(
      'snapshot.basePath',
      '/tmp/relax-git-sessions'
    );
    this.orphanCleanupEnabled = this.configService.get<boolean>(
      'snapshot.orphanCleanupEnabled',
      true
    );
  }

  /**
   * 每5分钟清理过期的会话快照
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async cleanupExpiredSessionSnapshots(): Promise<void> {
    this.logger.log('Starting cleanup of expired session snapshots');

    try {
      // 直接清理过期的会话快照
      const cleanedCount = await this.cleanupExpiredSessionSnapshotsCore();
      this.logger.log(
        `Cleanup completed: ${cleanedCount} session snapshots cleaned`
      );
    } catch (error) {
      this.logger.error('Failed to cleanup expired session snapshots:', error);
    }
  }

  /**
   * 每小时清理孤儿文件
   * 清理数据库中不存在但文件系统中存在的快照目录
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupOrphanFiles(): Promise<void> {
    if (!this.orphanCleanupEnabled) {
      return;
    }

    this.logger.log('Starting cleanup of orphan snapshot files');

    try {
      const orphanCount = await this.cleanupOrphanSnapshotDirectories();
      this.logger.log(
        `Orphan cleanup completed: ${orphanCount} directories cleaned`
      );
    } catch (error) {
      this.logger.error('Failed to cleanup orphan files:', error);
    }
  }

  /**
   * 每天凌晨2点进行深度清理
   * 包括清理长时间未访问的会话快照
   */
  @Cron('0 2 * * *') // 每天凌晨2点
  async deepCleanup(): Promise<void> {
    this.logger.log('Starting deep cleanup');

    try {
      // 清理超过24小时未访问的会话快照（即使未过期）
      const staleThreshold = new Date();
      staleThreshold.setHours(staleThreshold.getHours() - 24);

      const staleSnapshots = await this.prisma.sessionSnapshot.findMany({
        where: {
          lastAccessedAt: {
            lt: staleThreshold,
          },
        },
      });

      let cleanedStaleCount = 0;
      for (const snapshot of staleSnapshots) {
        try {
          await this.cleanupSessionSnapshotById(snapshot.id);
          cleanedStaleCount++;
        } catch (error) {
          this.logger.error(
            `Failed to cleanup stale session snapshot ${snapshot.id}:`,
            error
          );
        }
      }

      // 清理孤儿文件
      const orphanCount = await this.cleanupOrphanSnapshotDirectories();

      this.logger.log(
        `Deep cleanup completed: ${cleanedStaleCount} stale snapshots, ${orphanCount} orphan directories cleaned`
      );
    } catch (error) {
      this.logger.error('Failed to perform deep cleanup:', error);
    }
  }

  /**
   * 手动触发全面清理
   * 用于维护或紧急情况
   */
  async manualFullCleanup(): Promise<{
    expiredSnapshots: number;
    staleSnapshots: number;
    orphanDirectories: number;
  }> {
    this.logger.log('Starting manual full cleanup');

    const results = {
      expiredSnapshots: 0,
      staleSnapshots: 0,
      orphanDirectories: 0,
    };

    try {
      // 1. 清理过期快照
      results.expiredSnapshots =
        await this.cleanupExpiredSessionSnapshotsCore();

      // 2. 清理长时间未访问的快照
      const staleThreshold = new Date();
      staleThreshold.setHours(staleThreshold.getHours() - 12); // 12小时未访问

      const staleSnapshots = await this.prisma.sessionSnapshot.findMany({
        where: {
          lastAccessedAt: {
            lt: staleThreshold,
          },
        },
      });

      for (const snapshot of staleSnapshots) {
        try {
          await this.cleanupSessionSnapshotById(snapshot.id);
          results.staleSnapshots++;
        } catch (error) {
          this.logger.error(
            `Failed to cleanup stale session snapshot ${snapshot.id}:`,
            error
          );
        }
      }

      // 3. 清理孤儿目录
      results.orphanDirectories = await this.cleanupOrphanSnapshotDirectories();

      this.logger.log(
        `Manual full cleanup completed: ${results.expiredSnapshots} expired, ${results.staleSnapshots} stale, ${results.orphanDirectories} orphan`
      );
    } catch (error) {
      this.logger.error('Failed to perform manual full cleanup:', error);
      throw error;
    }

    return results;
  }

  /**
   * 清理孤儿快照目录
   */
  private async cleanupOrphanSnapshotDirectories(): Promise<number> {
    if (!(await fs.pathExists(this.snapshotBasePath))) {
      return 0;
    }

    const directories = await fs.readdir(this.snapshotBasePath);
    const sessionDirectories = directories.filter(dir =>
      dir.startsWith('session-')
    );

    let cleanedCount = 0;

    for (const dirName of sessionDirectories) {
      try {
        // 从目录名提取会话快照ID
        const sessionId = dirName.replace('session-', '');

        // 检查数据库中是否存在对应记录
        const exists = await this.prisma.sessionSnapshot.findUnique({
          where: { id: sessionId },
        });

        if (!exists) {
          // 数据库中不存在，删除目录
          const dirPath = path.join(this.snapshotBasePath, dirName);
          await fs.remove(dirPath);
          cleanedCount++;
          this.logger.log(`Removed orphan directory: ${dirPath}`);
        }
      } catch (error) {
        this.logger.error(`Failed to process directory ${dirName}:`, error);
      }
    }

    return cleanedCount;
  }

  /**
   * 根据ID清理会话快照
   */
  private async cleanupSessionSnapshotById(id: string): Promise<void> {
    const sessionSnapshot = await this.prisma.sessionSnapshot.findUnique({
      where: { id },
    });

    if (!sessionSnapshot) {
      return;
    }

    // 删除工作树
    if (
      sessionSnapshot.worktreePath &&
      (await fs.pathExists(sessionSnapshot.worktreePath))
    ) {
      await fs.remove(sessionSnapshot.worktreePath);
    }

    // 删除数据库记录
    await this.prisma.sessionSnapshot.delete({
      where: { id },
    });

    this.logger.log(`Cleaned up session snapshot ${id}`);
  }

  /**
   * 获取清理统计信息
   */
  async getCleanupStats(): Promise<{
    activeSessionSnapshots: number;
    expiredSessionSnapshots: number;
    totalSessionDirectories: number;
    orphanDirectories: number;
  }> {
    const now = new Date();

    const [activeCount, expiredCount, totalDirectories, orphanCount] =
      await Promise.all([
        // 活跃的会话快照数量
        this.prisma.sessionSnapshot.count({
          where: {
            expiresAt: { gt: now },
            status: 'READY',
          },
        }),
        // 过期的会话快照数量
        this.prisma.sessionSnapshot.count({
          where: {
            OR: [{ expiresAt: { lt: now } }, { status: 'EXPIRED' }],
          },
        }),
        // 文件系统中的会话目录总数
        this.countSessionDirectories(),
        // 孤儿目录数量
        this.countOrphanDirectories(),
      ]);

    return {
      activeSessionSnapshots: activeCount,
      expiredSessionSnapshots: expiredCount,
      totalSessionDirectories: totalDirectories,
      orphanDirectories: orphanCount,
    };
  }

  /**
   * 统计会话目录数量
   */
  private async countSessionDirectories(): Promise<number> {
    try {
      if (!(await fs.pathExists(this.snapshotBasePath))) {
        return 0;
      }

      const directories = await fs.readdir(this.snapshotBasePath);
      return directories.filter(dir => dir.startsWith('session-')).length;
    } catch (error) {
      this.logger.error('Failed to count session directories:', error);
      return 0;
    }
  }

  /**
   * 统计孤儿目录数量
   */
  private async countOrphanDirectories(): Promise<number> {
    try {
      if (!(await fs.pathExists(this.snapshotBasePath))) {
        return 0;
      }

      const directories = await fs.readdir(this.snapshotBasePath);
      const sessionDirectories = directories.filter(dir =>
        dir.startsWith('session-')
      );

      let orphanCount = 0;
      for (const dirName of sessionDirectories) {
        const sessionId = dirName.replace('session-', '');
        const exists = await this.prisma.sessionSnapshot.findUnique({
          where: { id: sessionId },
        });

        if (!exists) {
          orphanCount++;
        }
      }

      return orphanCount;
    } catch (error) {
      this.logger.error('Failed to count orphan directories:', error);
      return 0;
    }
  }

  /**
   * 清理过期的会话快照
   * 从废弃的SessionSnapshotService迁移而来
   */
  private async cleanupExpiredSessionSnapshotsCore(): Promise<number> {
    try {
      const expiredSnapshots = await this.prisma.sessionSnapshot.findMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
        select: {
          id: true,
          worktreePath: true,
        },
      });

      let cleanedCount = 0;
      for (const snapshot of expiredSnapshots) {
        try {
          // 删除工作树目录
          if (
            snapshot.worktreePath &&
            (await fs.pathExists(snapshot.worktreePath))
          ) {
            await fs.remove(snapshot.worktreePath);
          }

          // 删除数据库记录
          await this.prisma.sessionSnapshot.delete({
            where: { id: snapshot.id },
          });

          cleanedCount++;
        } catch (error) {
          this.logger.warn(
            `Failed to cleanup session snapshot ${snapshot.id}:`,
            error
          );
        }
      }

      return cleanedCount;
    } catch (error) {
      this.logger.error('Failed to cleanup expired session snapshots:', error);
      return 0;
    }
  }
}
