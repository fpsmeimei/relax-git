import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BaseSnapshot,
  BaseSnapshotStatus,
  RepositoryBranch,
} from '@relax-git/shared/generated/prisma-client';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { GitValidationService } from '../repositories/services/git-validation.service';

/**
 * 基础快照服务
 * 负责管理仓库分支的基础快照（Base Snapshots）
 * 在仓库导入时为所有分支创建并持久化
 */
@Injectable()
export class BaseSnapshotService {
  private readonly logger = new Logger(BaseSnapshotService.name);
  private readonly queueName = 'snapshot:queue';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly gitValidationService: GitValidationService,
    private readonly configService: ConfigService
  ) {}

  /**
   * 为仓库的所有分支创建基础快照
   * 在仓库导入时调用
   */
  async createBaseSnapshotsForRepository(
    repoId: string
  ): Promise<BaseSnapshot[]> {
    this.logger.log(`Creating base snapshots for repository ${repoId}`);

    // 1. 获取仓库信息
    const repository = await this.prisma.repository.findUnique({
      where: { id: repoId },
    });

    if (!repository) {
      throw new NotFoundException('仓库不存在');
    }

    // 2. 获取仓库的所有分支
    const branches = await this.gitValidationService.getBranches(
      repository.gitUrl
    );
    if (!branches || branches.length === 0) {
      throw new BadRequestException('无法获取仓库分支信息');
    }

    this.logger.log(
      `Found ${branches.length} branches for repository ${repoId}`
    );

    // 3. 为每个分支创建或更新分支记录
    const repositoryBranches: RepositoryBranch[] = [];
    for (const branch of branches) {
      const commitSha = await this.gitValidationService.getCommitSha(
        repository.gitUrl,
        branch.name
      );

      if (!commitSha) {
        this.logger.warn(
          `Cannot get commit SHA for branch ${branch.name}, skipping`
        );
        continue;
      }

      const repositoryBranch = await this.prisma.repositoryBranch.upsert({
        where: {
          repoId_name: {
            repoId,
            name: branch.name,
          },
        },
        update: {
          commitSha,
          isDefault: branch.name === repository.defaultBranch,
        },
        create: {
          repoId,
          name: branch.name,
          commitSha,
          isDefault: branch.name === repository.defaultBranch,
        },
      });

      repositoryBranches.push(repositoryBranch);
    }

    // 4. 为每个分支创建基础快照
    const baseSnapshots: BaseSnapshot[] = [];
    for (const branch of repositoryBranches) {
      const baseSnapshot = await this.createBaseSnapshot(
        repoId,
        branch.id,
        branch.commitSha
      );
      baseSnapshots.push(baseSnapshot);
    }

    this.logger.log(
      `Created ${baseSnapshots.length} base snapshots for repository ${repoId}`
    );
    return baseSnapshots;
  }

  /**
   * 创建单个基础快照
   */
  async createBaseSnapshot(
    repoId: string,
    branchId: string,
    commitSha: string
  ): Promise<BaseSnapshot> {
    // 检查是否已存在基础快照
    const existing = await this.prisma.baseSnapshot.findUnique({
      where: {
        repoId_branchId: {
          repoId,
          branchId,
        },
      },
    });

    if (existing) {
      // 如果提交SHA相同，直接返回
      if (existing.commitSha === commitSha) {
        this.logger.log(`Base snapshot already exists for branch ${branchId}`);
        return existing;
      }

      // 如果提交SHA不同，更新基础快照
      const updated = await this.prisma.baseSnapshot.update({
        where: { id: existing.id },
        data: {
          commitSha,
          status: BaseSnapshotStatus.QUEUED,
          errorMessage: null,
          processedAt: null,
          worktreePath: null,
          bundlePath: null,
        },
      });

      await this.enqueueBaseSnapshotTask(updated);
      return updated;
    }

    // 创建新的基础快照
    const baseSnapshot = await this.prisma.baseSnapshot.create({
      data: {
        repoId,
        branchId,
        commitSha,
        status: BaseSnapshotStatus.QUEUED,
      },
    });

    await this.enqueueBaseSnapshotTask(baseSnapshot);
    this.logger.log(
      `Created base snapshot ${baseSnapshot.id} for branch ${branchId}`
    );
    return baseSnapshot;
  }

  /**
   * 获取基础快照
   */
  async getBaseSnapshot(
    repoId: string,
    branchId: string
  ): Promise<BaseSnapshot | null> {
    return this.prisma.baseSnapshot.findUnique({
      where: {
        repoId_branchId: {
          repoId,
          branchId,
        },
      },
      include: {
        repository: true,
        branch: true,
      },
    });
  }

  /**
   * 获取仓库的所有基础快照
   */
  async getRepositoryBaseSnapshots(repoId: string): Promise<BaseSnapshot[]> {
    return this.prisma.baseSnapshot.findMany({
      where: { repoId },
      include: {
        branch: true,
      },
      orderBy: {
        branch: {
          isDefault: 'desc',
        },
      },
    });
  }

  /**
   * 更新基础快照状态
   */
  async updateBaseSnapshotStatus(
    id: string,
    status: BaseSnapshotStatus,
    worktreePath?: string,
    bundlePath?: string,
    errorMessage?: string
  ): Promise<BaseSnapshot> {
    return this.prisma.baseSnapshot.update({
      where: { id },
      data: {
        status,
        worktreePath,
        bundlePath,
        errorMessage,
        processedAt: status === BaseSnapshotStatus.READY ? new Date() : null,
      },
    });
  }

  /**
   * 将基础快照任务加入队列
   */
  private async enqueueBaseSnapshotTask(
    baseSnapshot: BaseSnapshot
  ): Promise<void> {
    // 查询仓库以获取 gitUrl（Worker 需要）
    const repo = await this.prisma.repository.findUnique({
      where: { id: baseSnapshot.repoId },
      select: { gitUrl: true },
    });

    const task = {
      id: baseSnapshot.id,
      type: 'base-snapshot',
      repoId: baseSnapshot.repoId,
      branchId: baseSnapshot.branchId,
      commitSha: baseSnapshot.commitSha,
      gitUrl: repo?.gitUrl || '',
      createdAt: baseSnapshot.createdAt.toISOString(),
    };

    try {
      await this.redis.enqueue(this.queueName, task);
      this.logger.log(`Enqueued base snapshot task ${baseSnapshot.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to enqueue base snapshot task ${baseSnapshot.id}:`,
        error
      );

      // 更新快照状态为失败
      await this.updateBaseSnapshotStatus(
        baseSnapshot.id,
        BaseSnapshotStatus.FAILED,
        undefined,
        undefined,
        '队列推送失败'
      );

      throw new BadRequestException('基础快照任务推送失败，请稍后重试');
    }
  }

  /**
   * 确保工件存在（幂等操作）
   * 根据 repoId + commitSha 查询或创建基础快照
   * 用于实现commit级别的快照复用
   */
  async ensureArtifact(
    repoId: string,
    commitSha: string,
    branchId?: string
  ): Promise<BaseSnapshot> {
    this.logger.log(
      `Ensuring artifact for repo ${repoId}, commit ${commitSha}`
    );

    // 1. 查询是否已存在（按 repoId + commitSha）
    // 注意：当前 base_snapshots 表是按 repoId + branchId 唯一，
    // 这里先查询任意分支的相同 commit
    const existing = await this.prisma.baseSnapshot.findFirst({
      where: {
        repoId,
        commitSha,
      },
      include: {
        repository: true,
        branch: true,
      },
    });

    // 2. 存在且 READY：直接返回（实现跨分支复用）
    if (existing && existing.status === BaseSnapshotStatus.READY) {
      this.logger.log(
        `Reusing existing artifact ${existing.id} for commit ${commitSha}`
      );
      return existing;
    }

    // 3. 存在但非 READY：检查状态
    if (existing) {
      switch (existing.status) {
        case BaseSnapshotStatus.PROCESSING:
        case BaseSnapshotStatus.QUEUED:
          // 正在处理中，返回当前状态
          this.logger.log(
            `Artifact ${existing.id} is ${existing.status}, returning current state`
          );
          return existing;

        case BaseSnapshotStatus.FAILED:
          // 失败的任务，尝试重试
          this.logger.log(`Retrying failed artifact ${existing.id}`);
          const retried = await this.prisma.baseSnapshot.update({
            where: { id: existing.id },
            data: {
              status: BaseSnapshotStatus.QUEUED,
              errorMessage: null,
              processedAt: null,
              worktreePath: null,
              bundlePath: null,
            },
          });
          await this.enqueueBaseSnapshotTask(retried);
          return retried;
      }
    }

    // 4. 不存在：需要创建新的基础快照
    // 如果没有指定 branchId，需要找到或创建一个分支记录
    let targetBranchId = branchId;

    if (!targetBranchId) {
      // 查找该 commit 对应的分支（优先默认分支）
      const repository = await this.prisma.repository.findUnique({
        where: { id: repoId },
        include: {
          branches: {
            where: { commitSha },
            orderBy: { isDefault: 'desc' },
            take: 1,
          },
        },
      });

      if (repository?.branches.length > 0) {
        targetBranchId = repository.branches[0].id;
      } else {
        // 如果找不到对应的分支，创建一个临时分支记录
        // 注意：实际生产中可能需要更复杂的逻辑
        const tempBranch = await this.prisma.repositoryBranch.create({
          data: {
            repoId,
            name: `artifact-${commitSha.substring(0, 8)}`,
            commitSha,
            isDefault: false,
          },
        });
        targetBranchId = tempBranch.id;
      }
    }

    // 创建新的基础快照
    return this.createBaseSnapshot(repoId, targetBranchId!, commitSha);
  }
}
