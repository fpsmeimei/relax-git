import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
import {
  canAdminRepo,
  canCommentRepo,
  canReadRepo,
} from '../../auth/utils/access';
import { PrismaService } from '../../database/prisma.service';

/**
 * 统一快照权限验证服务
 * 整合所有快照类型的权限验证逻辑，消除重复代码
 * 基于现有的auth/utils/access.ts统一权限验证框架
 */
@Injectable()
export class UnifiedSnapshotAccessService {
  private readonly logger = new Logger(UnifiedSnapshotAccessService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 检查快照访问权限
   * 统一处理BaseSnapshot、SessionSnapshot等所有快照类型的权限验证
   *
   * @param snapshotId 快照ID（任意类型）
   * @param userId 用户ID
   * @param userRole 用户角色
   * @param accessMode 访问模式：read | comment | admin
   * @returns Promise<boolean> 是否有权限
   */
  async checkSnapshotAccess(
    snapshotId: string,
    userId: string | undefined,
    userRole: UserRole | undefined,
    accessMode: 'read' | 'comment' | 'admin' = 'read'
  ): Promise<boolean> {
    try {
      const repository = await this.resolveRepositoryFromSnapshot(snapshotId);
      if (!repository) {
        return false;
      }

      // 使用统一的权限验证逻辑
      switch (accessMode) {
        case 'read':
          return await canReadRepo(
            this.prisma as any,
            repository,
            userId,
            userRole
          );
        case 'comment':
          return await canCommentRepo(
            this.prisma as any,
            repository,
            userId,
            userRole
          );
        case 'admin':
          return await canAdminRepo(
            this.prisma as any,
            repository,
            userId,
            userRole
          );
        default:
          return await canReadRepo(
            this.prisma as any,
            repository,
            userId,
            userRole
          );
      }
    } catch (error) {
      this.logger.error(
        `Access check failed for snapshot ${snapshotId}:`,
        error
      );
      return false;
    }
  }

  /**
   * 验证快照访问权限（抛出异常版本）
   * 用于控制器中的权限验证，失败时抛出适当的HTTP异常
   *
   * @param snapshotId 快照ID
   * @param userId 用户ID
   * @param userRole 用户角色
   * @param accessMode 访问模式
   * @throws ForbiddenException 权限不足
   * @throws NotFoundException 快照不存在
   */
  async validateSnapshotAccess(
    snapshotId: string,
    userId: string | undefined,
    userRole: UserRole | undefined,
    accessMode: 'read' | 'comment' | 'admin' = 'read'
  ): Promise<void> {
    const repository = await this.resolveRepositoryFromSnapshot(snapshotId);
    if (!repository) {
      throw new NotFoundException('快照不存在或已被删除');
    }

    const hasAccess = await this.checkSnapshotAccess(
      snapshotId,
      userId,
      userRole,
      accessMode
    );
    if (!hasAccess) {
      const modeText = {
        read: '查看',
        comment: '评论',
        admin: '管理',
      }[accessMode];

      throw new ForbiddenException({
        code: 'SNAPSHOT_ACCESS_DENIED',
        message: `无权${modeText}此快照`,
        details: {
          snapshotId,
          accessMode,
          repositoryId: repository.id,
          repositoryVisibility: repository.visibility,
        },
      });
    }
  }

  /**
   * 从快照ID解析对应的仓库信息
   * 支持BaseSnapshot、SessionSnapshot、传统Snapshot等所有类型
   *
   * @param snapshotId 快照ID
   * @returns 仓库信息或null
   */
  private async resolveRepositoryFromSnapshot(snapshotId: string) {
    // 1. 尝试BaseSnapshot
    const baseSnapshot = await this.prisma.baseSnapshot.findUnique({
      where: { id: snapshotId },
      include: { repository: true },
    });
    if (baseSnapshot) {
      return baseSnapshot.repository;
    }

    // 2. 尝试SessionSnapshot
    const sessionSnapshot = await this.prisma.sessionSnapshot.findUnique({
      where: { id: snapshotId },
      include: {
        baseSnapshot: {
          include: { repository: true },
        },
      },
    });
    if (sessionSnapshot) {
      return sessionSnapshot.baseSnapshot.repository;
    }

    // 3. 传统Snapshot（向后兼容）已移除：不再查询 prisma.snapshot，避免运行时错误
    return null;
  }

  /**
   * 批量检查快照访问权限
   * 用于列表查询时的权限过滤
   *
   * @param snapshotIds 快照ID列表
   * @param userId 用户ID
   * @param userRole 用户角色
   * @param accessMode 访问模式
   * @returns 有权限的快照ID列表
   */
  async filterAccessibleSnapshots(
    snapshotIds: string[],
    userId: string | undefined,
    userRole: UserRole | undefined,
    accessMode: 'read' | 'comment' | 'admin' = 'read'
  ): Promise<string[]> {
    const accessibleIds: string[] = [];

    // 并行检查所有快照的权限
    const accessChecks = snapshotIds.map(async id => {
      const hasAccess = await this.checkSnapshotAccess(
        id,
        userId,
        userRole,
        accessMode
      );
      return { id, hasAccess };
    });

    const results = await Promise.all(accessChecks);

    for (const result of results) {
      if (result.hasAccess) {
        accessibleIds.push(result.id);
      }
    }

    return accessibleIds;
  }

  /**
   * 检查用户是否为快照所有者
   * 用于特殊权限检查（如删除、修改等）
   *
   * @param snapshotId 快照ID
   * @param userId 用户ID
   * @returns 是否为所有者
   */
  async isSnapshotOwner(snapshotId: string, userId: string): Promise<boolean> {
    // 1. 检查BaseSnapshot的所有者
    const baseSnapshot = await this.prisma.baseSnapshot.findUnique({
      where: { id: snapshotId },
      select: { ownerId: true, repository: { select: { ownerId: true } } },
    });
    if (baseSnapshot) {
      return (
        baseSnapshot.ownerId === userId ||
        baseSnapshot.repository.ownerId === userId
      );
    }

    // 2. 检查SessionSnapshot的所有者
    const sessionSnapshot = await this.prisma.sessionSnapshot.findUnique({
      where: { id: snapshotId },
      select: { userId: true },
    });
    if (sessionSnapshot) {
      return sessionSnapshot.userId === userId;
    }

    // 3. 传统Snapshot已移除：不再查询 prisma.snapshot，避免运行时错误
    return false;
  }

  /**
   * 获取快照的访问统计信息
   * 用于监控和分析
   *
   * @param snapshotId 快照ID
   * @returns 访问统计信息
   */
  async getSnapshotAccessStats(snapshotId: string) {
    const baseSnapshot = await this.prisma.baseSnapshot.findUnique({
      where: { id: snapshotId },
      select: {
        accessCount: true,
        lastAccessedAt: true,
        createdAt: true,
        repository: {
          select: {
            id: true,
            name: true,
            visibility: true,
          },
        },
      },
    });

    if (baseSnapshot) {
      return {
        snapshotId,
        accessCount: baseSnapshot.accessCount,
        lastAccessedAt: baseSnapshot.lastAccessedAt,
        createdAt: baseSnapshot.createdAt,
        repository: baseSnapshot.repository,
      };
    }

    return null;
  }

  /**
   * 更新快照访问统计
   * 记录用户访问行为，用于分析和TTL管理
   *
   * @param snapshotId 快照ID
   * @param userId 用户ID（可选）
   */
  async recordSnapshotAccess(
    snapshotId: string,
    userId?: string
  ): Promise<void> {
    try {
      // 更新BaseSnapshot的访问统计
      await this.prisma.baseSnapshot.updateMany({
        where: { id: snapshotId },
        data: {
          accessCount: { increment: 1 },
          lastAccessedAt: new Date(),
        },
      });

      // 更新SessionSnapshot的访问时间
      await this.prisma.sessionSnapshot.updateMany({
        where: { id: snapshotId },
        data: {
          lastAccessedAt: new Date(),
        },
      });

      this.logger.debug(
        `Recorded access for snapshot ${snapshotId} by user ${userId || 'anonymous'}`
      );
    } catch (error) {
      this.logger.warn(
        `Failed to record access for snapshot ${snapshotId}:`,
        error
      );
      // 不抛出异常，避免影响主要功能
    }
  }
}
