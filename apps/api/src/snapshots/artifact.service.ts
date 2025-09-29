import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ArtifactStatus,
  SnapshotArtifact,
} from '@relax-git/shared/generated/prisma-client';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { GitValidationService } from '../repositories/services/git-validation.service';

/**
 * Phase 2: 工件服务
 * 管理 SnapshotArtifact（commit 级别的快照复用）
 * 逐步替代 BaseSnapshotService
 */
@Injectable()
export class ArtifactService {
  private readonly logger = new Logger(ArtifactService.name);
  private readonly queueName = 'snapshot:queue'; // 保持与现有系统兼容

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly gitValidationService: GitValidationService,
    private readonly configService: ConfigService
  ) {}

  /**
   * 确保工件存在（幂等操作）
   * 这是核心方法：根据 repoId + commitSha 查询或创建工件
   */
  async ensureArtifact(
    repoId: string,
    commitSha: string
  ): Promise<SnapshotArtifact> {
    this.logger.log(
      `Ensuring artifact for repo ${repoId}, commit ${commitSha}`
    );

    // 1. 查询是否已存在
    const existing = await this.prisma.snapshotArtifact.findUnique({
      where: {
        repoId_commitSha: {
          repoId,
          commitSha,
        },
      },
      include: {
        repository: true,
      },
    });

    // 2. 存在且 READY：直接返回（实现跨分支复用）
    if (existing && existing.status === ArtifactStatus.READY) {
      this.logger.log(
        `Reusing existing artifact ${existing.id} for commit ${commitSha}`
      );
      return existing;
    }

    // 3. 存在但非 READY：检查状态
    if (existing) {
      switch (existing.status) {
        case ArtifactStatus.PROCESSING:
        case ArtifactStatus.QUEUED:
          // 正在处理中，返回当前状态
          this.logger.log(
            `Artifact ${existing.id} is ${existing.status}, returning current state`
          );
          return existing;

        case ArtifactStatus.FAILED:
          // 失败的任务，尝试重试
          this.logger.log(`Retrying failed artifact ${existing.id}`);
          return this.retryArtifact(existing.id);
      }
    }

    // 4. 不存在：创建新的工件
    const artifact = await this.prisma.snapshotArtifact.create({
      data: {
        repoId,
        commitSha,
        status: ArtifactStatus.QUEUED,
        metadata: {},
      },
      include: {
        repository: true,
      },
    });

    // 5. 推送到队列
    await this.enqueueArtifactTask(artifact);
    this.logger.log(
      `Created new artifact ${artifact.id} for commit ${commitSha}`
    );
    return artifact;
  }

  /**
   * 获取工件信息
   */
  async getArtifact(id: string): Promise<SnapshotArtifact | null> {
    return this.prisma.snapshotArtifact.findUnique({
      where: { id },
      include: {
        repository: true,
        branches: true,
      },
    });
  }

  /**
   * 获取工件状态
   */
  async getArtifactStatus(id: string): Promise<{
    id: string;
    status: ArtifactStatus;
    processedAt?: Date | null;
    errorMessage?: string | null;
  }> {
    const artifact = await this.prisma.snapshotArtifact.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        processedAt: true,
        errorMessage: true,
      },
    });

    if (!artifact) {
      throw new NotFoundException('Artifact not found');
    }

    return artifact;
  }

  /**
   * 更新工件状态
   */
  async updateArtifactStatus(
    id: string,
    status: ArtifactStatus,
    data?: {
      worktreePath?: string;
      bundlePath?: string;
      errorMessage?: string;
      metadata?: any;
    }
  ): Promise<SnapshotArtifact> {
    const updateData: any = { status };

    if (status === ArtifactStatus.READY) {
      updateData.processedAt = new Date();
      if (data?.worktreePath) updateData.worktreePath = data.worktreePath;
      if (data?.bundlePath) updateData.bundlePath = data.bundlePath;
      if (data?.metadata) updateData.metadata = data.metadata;
    }

    if (status === ArtifactStatus.FAILED && data?.errorMessage) {
      updateData.errorMessage = data.errorMessage;
    }

    return this.prisma.snapshotArtifact.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * 重试失败的工件
   */
  async retryArtifact(id: string): Promise<SnapshotArtifact> {
    const artifact = await this.getArtifact(id);
    if (!artifact) {
      throw new NotFoundException('Artifact not found');
    }

    if (artifact.status !== ArtifactStatus.FAILED) {
      throw new BadRequestException(
        `Can only retry failed artifacts, current status: ${artifact.status}`
      );
    }

    // 重置状态
    const updated = await this.prisma.snapshotArtifact.update({
      where: { id },
      data: {
        status: ArtifactStatus.QUEUED,
        errorMessage: null,
        processedAt: null,
        worktreePath: null,
        bundlePath: null,
      },
      include: {
        repository: true,
      },
    });

    // 重新入队
    await this.enqueueArtifactTask(updated);
    this.logger.log(`Retried artifact ${id}`);
    return updated;
  }

  /**
   * 将工件任务加入队列
   */
  private async enqueueArtifactTask(
    artifact: SnapshotArtifact & { repository: any }
  ): Promise<void> {
    const task = {
      id: artifact.id,
      type: 'artifact', // 新的任务类型
      repoId: artifact.repoId,
      commitSha: artifact.commitSha,
      gitUrl: artifact.repository.gitUrl,
      createdAt: artifact.createdAt.toISOString(),
    };

    try {
      await this.redis.enqueue(this.queueName, task);
      this.logger.log(`Enqueued artifact task ${artifact.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to enqueue artifact task ${artifact.id}:`,
        error
      );

      // 更新状态为失败
      await this.updateArtifactStatus(artifact.id, ArtifactStatus.FAILED, {
        errorMessage: '队列推送失败',
      });

      throw new BadRequestException('工件任务推送失败，请稍后重试');
    }
  }

  /**
   * 获取仓库的所有工件
   */
  async getRepositoryArtifacts(repoId: string): Promise<SnapshotArtifact[]> {
    return this.prisma.snapshotArtifact.findMany({
      where: { repoId },
      orderBy: { createdAt: 'desc' },
      include: {
        branches: {
          select: {
            id: true,
            name: true,
            isDefault: true,
          },
        },
      },
    });
  }

  /**
   * 清理过期工件（定期任务）
   */
  async cleanupExpiredArtifacts(daysToKeep = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // 查找没有被任何分支引用的旧工件
    const expiredArtifacts = await this.prisma.snapshotArtifact.findMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        branches: {
          none: {},
        },
      },
      select: {
        id: true,
        worktreePath: true,
        bundlePath: true,
      },
    });

    if (expiredArtifacts.length === 0) {
      return 0;
    }

    // 删除工件记录
    await this.prisma.snapshotArtifact.deleteMany({
      where: {
        id: {
          in: expiredArtifacts.map((a: { id: string }) => a.id),
        },
      },
    });

    this.logger.log(`Cleaned up ${expiredArtifacts.length} expired artifacts`);

    // TODO: 清理文件系统上的 worktree 和 bundle 文件

    return expiredArtifacts.length;
  }

  /**
   * 更新分支的当前工件
   */
  async updateBranchArtifact(
    branchId: string,
    artifactId: string
  ): Promise<void> {
    await this.prisma.repositoryBranch.update({
      where: { id: branchId },
      data: {
        currentArtifactId: artifactId,
      },
    });
  }

  /**
   * 迁移工具：从 base_snapshots 迁移到 snapshot_artifacts
   * 注意：这是一次性迁移工具，仅在迁移期使用
   */
  async migrateFromBaseSnapshots(
    repoId?: string,
    dryRun = true
  ): Promise<{ migrated: number; errors: number }> {
    this.logger.log(
      `Starting migration from base_snapshots to snapshot_artifacts (dryRun: ${dryRun})`
    );

    const whereClause = repoId ? { repoId } : {};
    const baseSnapshots = await this.prisma.baseSnapshot.findMany({
      where: whereClause,
      include: {
        repository: true,
        branch: true,
      },
    });

    let migrated = 0;
    let errors = 0;

    for (const bs of baseSnapshots) {
      try {
        // 检查是否已存在
        const existing = await this.prisma.snapshotArtifact.findUnique({
          where: {
            repoId_commitSha: {
              repoId: bs.repoId,
              commitSha: bs.commitSha,
            },
          },
        });

        if (existing) {
          this.logger.debug(
            `Artifact already exists for commit ${bs.commitSha}, skipping`
          );
          continue;
        }

        if (!dryRun) {
          // 创建新的 artifact
          const artifact = await this.prisma.snapshotArtifact.create({
            data: {
              repoId: bs.repoId,
              commitSha: bs.commitSha,
              status: this.mapStatus(bs.status),
              worktreePath: bs.worktreePath,
              bundlePath: bs.bundlePath,
              processedAt: bs.processedAt,
              errorMessage: bs.errorMessage,
              metadata: {
                migratedFrom: 'base_snapshots',
                migratedAt: new Date().toISOString(),
                originalId: bs.id,
              },
            },
          });

          // 更新分支引用
          await this.prisma.repositoryBranch.update({
            where: { id: bs.branchId },
            data: {
              currentArtifactId: artifact.id,
            },
          });

          migrated++;
        } else {
          migrated++;
        }
      } catch (error) {
        this.logger.error(`Failed to migrate base snapshot ${bs.id}:`, error);
        errors++;
      }
    }

    this.logger.log(
      `Migration completed: ${migrated} migrated, ${errors} errors`
    );
    return { migrated, errors };
  }

  /**
   * 映射旧状态到新状态
   */
  private mapStatus(oldStatus: any): ArtifactStatus {
    const statusMap: { [key: string]: ArtifactStatus } = {
      QUEUED: ArtifactStatus.QUEUED,
      PROCESSING: ArtifactStatus.PROCESSING,
      READY: ArtifactStatus.READY,
      FAILED: ArtifactStatus.FAILED,
    };

    return statusMap[oldStatus] || ArtifactStatus.FAILED;
  }
}
