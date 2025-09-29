import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SNAPSHOT_CONFIG } from '@relax-git/shared';
import {
  Repository,
  RepositoryVisibility,
  Snapshot,
  SnapshotStatus,
  TimelineEventType,
  UserRole,
} from '@relax-git/shared/generated/prisma-client';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { ConfigService } from '../config/config.service';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { GitValidationService } from '../repositories/services/git-validation.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { CreateSnapshotDto, UpdateSnapshotDto } from './dto';

/**
 * 快照管理服务
 * 负责快照的CRUD操作、队列集成和状态管理
 */
@Injectable()
export class SnapshotsService {
  private readonly logger = new Logger(SnapshotsService.name);
  private readonly queueName = 'snapshot:queue';
  private readonly TITLE_MAX_LEN = 100;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly websocketGateway: WebSocketGateway,
    private readonly gitValidationService: GitValidationService,
    private readonly configService: ConfigService
  ) {}

  /**
   * 格式化时间：YYYY-MM-DD HH:mm
   */
  private formatYmdHm(d: Date): string {
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${y}-${m}-${day} ${hh}:${mm}`;
  }

  /**
   * 列出快照内指定目录的条目（单层）
   */
  async getTree(
    snapshotId: string,
    userId: string,
    userRole: UserRole,
    dirPath = ''
  ): Promise<Array<{ name: string; type: 'dir' | 'file'; size?: number }>> {
    const snapshot = await this.findOne(snapshotId, userId, userRole);
    if (!snapshot.worktreePath) {
      throw new NotFoundException('该快照未提供工作目录，无法列出目录');
    }

    const root = path.resolve(snapshot.worktreePath);
    const target = path.resolve(path.join(root, dirPath || '.'));
    if (!target.startsWith(root + path.sep) && target !== root) {
      throw new ForbiddenException('非法的目录路径');
    }

    try {
      const entries = await fs.readdir(target, { withFileTypes: true } as any);
      const result: Array<{
        name: string;
        type: 'dir' | 'file';
        size?: number;
      }> = [];
      for (const ent of entries as any[]) {
        const name = ent.name as string;
        if (name === '.git') continue; // 隐藏.git目录
        const isDir =
          typeof ent.isDirectory === 'function' ? ent.isDirectory() : false;
        if (isDir) {
          result.push({ name, type: 'dir' });
        } else {
          try {
            const st = await fs.stat(path.join(target, name));
            result.push({ name, type: 'file', size: st.size });
          } catch {
            result.push({ name, type: 'file' });
          }
        }
      }
      // 目录优先排序
      result.sort((a, b) =>
        a.type === b.type
          ? a.name.localeCompare(b.name)
          : a.type === 'dir'
            ? -1
            : 1
      );
      return result;
    } catch (e: any) {
      if (e?.code === 'ENOENT') {
        throw new NotFoundException('目录不存在');
      }
      this.logger.warn(`读取目录失败: ${dirPath} in snapshot ${snapshotId}`, e);
      throw new BadRequestException('读取目录失败');
    }
  }

  /**
   * 追加创建时间后缀，确保总长不超过TITLE_MAX_LEN。
   * 后缀形如：` · 2025-09-21 00:18`
   */
  private withCreatedSuffix(
    base: string | null | undefined,
    createdAt: Date
  ): string | null {
    const suffix = ` · ${this.formatYmdHm(createdAt)}`;
    if (!base || !base.trim())
      return `快照${suffix}`.slice(0, this.TITLE_MAX_LEN);
    const trimmed = base.trim();
    // 若已经包含同样后缀，则不重复追加
    if (trimmed.endsWith(suffix)) return trimmed.slice(0, this.TITLE_MAX_LEN);
    // 预留后缀长度，截断主体
    const maxBody = Math.max(0, this.TITLE_MAX_LEN - suffix.length);
    const body = trimmed.length > maxBody ? trimmed.slice(0, maxBody) : trimmed;
    return (body + suffix).slice(0, this.TITLE_MAX_LEN);
  }

  /**
   * 创建快照
   */
  async create(
    userId: string,
    createSnapshotDto: CreateSnapshotDto,
    userRole?: UserRole
  ): Promise<Snapshot> {
    const {
      repoId,
      commitSha,
      branchName,
      title,
      description,
      ttlDays = SNAPSHOT_CONFIG.DEFAULT_TTL_DAYS,
    } = createSnapshotDto;

    // 1. 验证仓库访问权限
    const repository = await this.validateRepositoryAccess(
      repoId,
      userId,
      userRole
    );

    // 2. 检查用户并发限制
    await this.checkConcurrencyLimit(userId);

    // 3. 一分支一快照（Pinned Snapshot）强约束：如已存在同仓库+分支的快照，则直接返回该快照
    const targetBranch = branchName ?? repository.defaultBranch;
    const existingPinned = await this.prisma.snapshot.findFirst({
      where: { repoId, branchName: targetBranch },
      include: {
        repository: {
          include: {
            owner: {
              select: { id: true, username: true, email: true },
            },
          },
        },
        owner: {
          select: { id: true, username: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (existingPinned) {
      this.logger.log(
        `Reusing pinned snapshot ${existingPinned.id} for repo ${repoId} branch ${targetBranch}`
      );
      return existingPinned as any;
    }

    // 4. 计算过期时间与创建时间（用于标题后缀）
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + ttlDays);

    // 5. 创建快照记录（标题强制追加创建时间后缀）
    const snapshot = await this.prisma.snapshot.create({
      data: {
        repoId,
        ownerId: userId,
        commitSha,
        branchName: targetBranch,
        title: this.withCreatedSuffix(title ?? null, now),
        description: description ?? null,
        status: SnapshotStatus.QUEUED,
        expiresAt,
      },
      include: {
        repository: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // 6. 推送任务到队列
    await this.enqueueSnapshotTask(snapshot, repository);

    // 7. 创建时间线事件
    await this.createTimelineEvent(snapshot);

    this.logger.log(`Created snapshot ${snapshot.id} for repository ${repoId}`);

    return snapshot;
  }

  /**
   * 读取快照内指定文件的内容（text/plain）
   */
  async getFileContent(
    snapshotId: string,
    userId: string,
    userRole: UserRole,
    filePath: string
  ): Promise<string> {
    if (!filePath || typeof filePath !== 'string') {
      throw new BadRequestException('文件路径无效');
    }

    const snapshot = await this.findOne(snapshotId, userId, userRole);

    if (!snapshot.worktreePath) {
      throw new NotFoundException('该快照未提供工作目录，无法读取文件');
    }

    // 安全拼接与校验，避免越权访问
    const root = path.resolve(snapshot.worktreePath);
    const target = path.resolve(path.join(root, filePath));
    if (!target.startsWith(root + path.sep) && target !== root) {
      throw new ForbiddenException('非法的文件路径');
    }

    try {
      const buf = await fs.readFile(target);
      // 粗略判断二进制：包含大量非可打印字符则拒绝
      const text = buf.toString('utf-8');
      return text;
    } catch (e: any) {
      if (e?.code === 'ENOENT') {
        throw new NotFoundException('文件不存在');
      }
      this.logger.warn(
        `读取文件失败: ${filePath} in snapshot ${snapshotId}`,
        e
      );
      throw new BadRequestException('读取文件失败');
    }
  }

  /**
   * 获取快照列表
   */
  async findAll(
    userId: string,
    userRole: UserRole,
    page = 1,
    limit = 10,
    status?: SnapshotStatus,
    repoId?: string
  ): Promise<{
    snapshots: Snapshot[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    // 状态过滤
    if (status) {
      where.status = status;
    }

    // 仓库过滤
    if (repoId) {
      where.repoId = repoId;
    }

    // 权限过滤：普通用户只能看到自己的快照或有权限的仓库快照
    if (userRole !== UserRole.ADMIN) {
      where.OR = [
        { ownerId: userId },
        {
          repository: {
            OR: [
              { ownerId: userId },
              { visibility: RepositoryVisibility.PUBLIC },
              { visibility: RepositoryVisibility.INTERNAL },
            ],
          },
        },
      ];
    }

    const [snapshots, total] = await Promise.all([
      this.prisma.snapshot.findMany({
        where,
        include: {
          repository: {
            include: {
              owner: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                },
              },
            },
          },
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.snapshot.count({ where }),
    ]);

    return {
      snapshots,
      total,
      page,
      limit,
    };
  }

  /**
   * 获取快照详情
   */
  async findOne(
    id: string,
    userId: string,
    userRole: UserRole
  ): Promise<Snapshot> {
    const snapshot = await this.prisma.snapshot.findUnique({
      where: { id },
      include: {
        repository: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!snapshot) {
      throw new NotFoundException('快照不存在');
    }

    // 权限检查
    await this.checkSnapshotAccess(snapshot, userId, userRole);

    return snapshot;
  }

  /**
   * 更新快照
   */
  async update(
    id: string,
    userId: string,
    userRole: UserRole,
    updateSnapshotDto: UpdateSnapshotDto
  ): Promise<Snapshot> {
    const snapshot = await this.findOne(id, userId, userRole);

    // 只有所有者或管理员可以更新
    if (userRole !== UserRole.ADMIN && snapshot.ownerId !== userId) {
      throw new ForbiddenException('无权修改此快照');
    }

    // 若更新了标题，强制保持“创建时间”后缀（使用原始创建时间）
    const dataToUpdate: any = { ...updateSnapshotDto };
    if (typeof updateSnapshotDto.title === 'string') {
      dataToUpdate.title = this.withCreatedSuffix(
        updateSnapshotDto.title,
        snapshot.createdAt
      );
    }

    const updatedSnapshot = await this.prisma.snapshot.update({
      where: { id },
      data: dataToUpdate,
      include: {
        repository: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    this.logger.log(`Updated snapshot ${id}`);

    return updatedSnapshot;
  }

  /**
   * 刷新快照：将现有快照更新为其分支最新 HEAD 提交，保留原快照ID
   */
  async refresh(
    id: string,
    userId: string,
    userRole: UserRole
  ): Promise<Snapshot> {
    // 读取快照并校验权限
    const snapshot = await this.findOne(id, userId, userRole);

    // 读取仓库，获取分支最新 HEAD
    const repo = await this.prisma.repository.findUnique({
      where: { id: snapshot.repoId },
    });
    if (!repo) {
      throw new NotFoundException('关联仓库不存在');
    }

    const latestSha = await this.gitValidationService.getCommitSha(
      repo.gitUrl,
      snapshot.branchName
    );
    if (!latestSha) {
      throw new BadRequestException(
        `找不到分支 ${snapshot.branchName} 的 HEAD 提交`
      );
    }

    // 若已是最新，直接返回
    if (latestSha === snapshot.commitSha) {
      return snapshot;
    }

    // 更新快照内容并重新入队
    const updated = await this.prisma.snapshot.update({
      where: { id },
      data: {
        commitSha: latestSha,
        status: SnapshotStatus.QUEUED,
        errorMessage: null,
        processedAt: null,
        worktreePath: null,
        bundlePath: null,
      },
      include: {
        repository: true,
        owner: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    await this.enqueueSnapshotTask(updated as any, (updated as any).repository);
    this.logger.log(`Refreshed snapshot ${id} to ${latestSha}`);
    return updated;
  }

  /**
   * 删除快照
   */
  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const snapshot = await this.findOne(id, userId, userRole);

    // 只有所有者或管理员可以删除
    if (userRole !== UserRole.ADMIN && snapshot.ownerId !== userId) {
      throw new ForbiddenException('无权删除此快照');
    }

    // 删除快照记录
    await this.prisma.snapshot.delete({
      where: { id },
    });

    // 清理Redis缓存
    await this.redis.del(`snapshot:status:${id}`);

    this.logger.log(`Deleted snapshot ${id}`);
  }

  /**
   * 获取快照状态
   */
  async getStatus(
    id: string,
    userId: string,
    userRole: UserRole
  ): Promise<{
    id: string;
    status: SnapshotStatus;
    progress?: number;
    estimatedTimeRemaining?: number;
    errorMessage?: string;
    updatedAt: string;
  }> {
    const snapshot = await this.findOne(id, userId, userRole);

    // 尝试从Redis获取实时状态
    const cachedStatus = await this.redis.get<string>(`snapshot:status:${id}`);
    const currentStatus = cachedStatus
      ? (cachedStatus as SnapshotStatus)
      : snapshot.status;

    return {
      id: snapshot.id,
      status: currentStatus,
      ...(snapshot.errorMessage ? { errorMessage: snapshot.errorMessage } : {}),
      updatedAt: snapshot.updatedAt.toISOString(),
    };
  }

  /**
   * 重试失败的快照
   */
  async retry(
    id: string,
    userId: string,
    userRole: UserRole
  ): Promise<Snapshot> {
    const snapshot = await this.findOne(id, userId, userRole);

    // 只有所有者或管理员可以重试
    if (userRole !== UserRole.ADMIN && snapshot.ownerId !== userId) {
      throw new ForbiddenException('无权重试此快照');
    }

    // 只有失败的快照可以重试
    if (snapshot.status !== SnapshotStatus.FAILED) {
      throw new BadRequestException('只有失败的快照可以重试');
    }

    // 更新状态为队列中
    const updatedSnapshot = await this.prisma.snapshot.update({
      where: { id },
      data: {
        status: SnapshotStatus.QUEUED,
        errorMessage: null,
        processedAt: null,
      },
      include: {
        repository: true,
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // 重新推送到队列
    await this.enqueueSnapshotTask(
      updatedSnapshot,
      (updatedSnapshot as any).repository
    );

    this.logger.log(`Retrying snapshot ${id}`);

    return updatedSnapshot;
  }

  /**
   * 验证仓库访问权限
   */
  private async validateRepositoryAccess(
    repoId: string,
    userId: string,
    userRole?: UserRole
  ): Promise<Repository> {
    const repository = await this.prisma.repository.findUnique({
      where: { id: repoId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!repository) {
      throw new NotFoundException('仓库不存在');
    }

    if (!repository.isActive) {
      throw new BadRequestException('仓库已被禁用');
    }

    // 检查用户是否有权限访问此仓库
    if (userRole !== UserRole.ADMIN) {
      const hasAccess =
        repository.ownerId === userId ||
        repository.visibility === RepositoryVisibility.PUBLIC;

      if (!hasAccess) {
        throw new ForbiddenException('无权访问此仓库');
      }
    }

    return repository;
  }

  /**
   * 检查用户并发限制
   */
  private async checkConcurrencyLimit(userId: string): Promise<void> {
    const activeCount = await this.prisma.snapshot.count({
      where: {
        ownerId: userId,
        status: {
          in: [SnapshotStatus.QUEUED, SnapshotStatus.PROCESSING],
        },
      },
    });

    if (activeCount >= SNAPSHOT_CONFIG.MAX_CONCURRENT) {
      throw new BadRequestException(
        `已达到最大并发快照数量限制（${SNAPSHOT_CONFIG.MAX_CONCURRENT}个）`
      );
    }
  }

  /**
   * 检查快照访问权限
   */
  private async checkSnapshotAccess(
    snapshot: Snapshot & { repository: Repository },
    userId: string,
    userRole: UserRole
  ): Promise<void> {
    // 管理员可以访问所有快照
    if (userRole === UserRole.ADMIN) {
      return;
    }

    // 快照所有者可以访问
    if (snapshot.ownerId === userId) {
      return;
    }

    // 仓库所有者可以访问
    if (snapshot.repository.ownerId === userId) {
      return;
    }

    // 公开仓库的快照可以访问
    if (snapshot.repository.visibility === RepositoryVisibility.PUBLIC) {
      return;
    }

    throw new ForbiddenException('无权访问此快照');
  }

  /**
   * 推送快照任务到队列
   */
  private async enqueueSnapshotTask(
    snapshot: Snapshot,
    repository: Repository
  ): Promise<void> {
    // 获取代理配置
    const proxyConfig = await this.configService.getWorkerProxyConfig();

    const task = {
      id: snapshot.id,
      repoId: snapshot.repoId,
      ownerId: snapshot.ownerId,
      gitUrl: repository.gitUrl,
      commitSha: snapshot.commitSha,
      branchName: snapshot.branchName,
      title: snapshot.title || '',
      description: snapshot.description || '',
      expiresAt: snapshot.expiresAt,
      createdAt: snapshot.createdAt,
      // 添加代理配置
      proxyConfig,
    };

    try {
      await this.redis.enqueue(this.queueName, task);
      this.logger.log(`Enqueued snapshot task ${snapshot.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to enqueue snapshot task ${snapshot.id}:`,
        error
      );

      // 更新快照状态为失败
      await this.prisma.snapshot.update({
        where: { id: snapshot.id },
        data: {
          status: SnapshotStatus.FAILED,
          errorMessage: '队列推送失败',
        },
      });

      throw new BadRequestException('快照任务推送失败，请稍后重试');
    }
  }

  /**
   * 创建时间线事件
   */
  private async createTimelineEvent(snapshot: Snapshot): Promise<void> {
    try {
      const timelineEvent = await this.prisma.timelineEvent.create({
        data: {
          type: TimelineEventType.SNAPSHOT_CREATED,
          repoId: snapshot.repoId,
          actorId: snapshot.ownerId,
          snapshotId: snapshot.id,
          payload: {
            commitSha: snapshot.commitSha,
            branchName: snapshot.branchName,
            title: snapshot.title,
          },
        },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      // 实时推送时间线事件
      await this.websocketGateway.emitTimelineEvent(
        snapshot.repoId,
        {
          id: timelineEvent.id,
          type: timelineEvent.type,
          actorId: timelineEvent.actorId,
          snapshotId: timelineEvent.snapshotId,
          payload: timelineEvent.payload,
          createdAt: timelineEvent.createdAt.toISOString(),
          actor: timelineEvent.actor,
        },
        {
          immediate: true, // 快照创建事件立即推送
        }
      );
    } catch (error) {
      this.logger.warn(
        `Failed to create timeline event for snapshot ${snapshot.id}:`,
        error
      );
      // 时间线事件创建失败不应该影响主流程
    }
  }
}
