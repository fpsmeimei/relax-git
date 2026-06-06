import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  MemberRole,
  Repository,
  RepositoryVisibility,
  UserRole,
} from '@relax-git/shared/generated/prisma-client';
import { PrismaService } from '../database/prisma.service';

import { BaseSnapshotService } from '../snapshots/base-snapshot.service';
import {
  CreateRepositoryDto,
  ImportRepositoryDto,
  ImportRepositoryResponseDto,
  UpdateRepositoryDto,
} from './dto';
import { GitValidationService } from './services/git-validation.service';

/**
 * 仓库服务
 * 处理仓库 CRUD、导入和权限校验。
 */
@Injectable()
export class RepositoriesService {
  private readonly logger = new Logger(RepositoriesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gitValidationService: GitValidationService,
    private readonly baseSnapshotService: BaseSnapshotService
  ) {}

  /**
   * 公开校验 Git URL，用于导入仓库前的快速检查。
   */
  async validateGitUrlPublic(gitUrl: string) {
    return this.gitValidationService.validateGitUrl(gitUrl);
  }

  /**
   * Update repository cover image URL (owner or admin only)
   */
  async updateCoverImage(
    id: string,
    userId: string,
    userRole: UserRole,
    coverUrl: string
  ): Promise<Repository> {
    const repository = await this.findOne(id, userId, userRole);

    // Only OWNER or ADMIN can update cover
    if (repository.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only owner or admin can update cover');
    }

    const updatedRepository = await this.prisma.repository.update({
      where: { id },
      data: { coverImage: coverUrl },
      include: {
        owner: {
          select: { id: true, username: true },
        },
      },
    });

    this.logger.log(`更新仓库封面成功 repo=${id}`);
    return updatedRepository as any;
  }

  /**
   * 创建仓库。
   */
  async create(
    userId: string,
    createRepositoryDto: CreateRepositoryDto
  ): Promise<Repository> {
    const {
      name,
      gitUrl,
      defaultBranch = 'main',
      visibility = RepositoryVisibility.PRIVATE,
      description,
    } = createRepositoryDto;

    // 同一用户下仓库名称不能重复
    const existingRepo = await this.prisma.repository.findUnique({
      where: {
        ownerId_name: {
          ownerId: userId,
          name,
        },
      },
    });

    if (existingRepo) {
      throw new ConflictException(`仓库 "${name}" 已存在`);
    }

    // 校验 Git 地址
    const validation = await this.gitValidationService.validateGitUrl(gitUrl);
    if (!validation.isValid) {
      throw new BadRequestException(`Git 地址无效: ${validation.error}`);
    }

    // 校验默认分支是否存在
    if (
      defaultBranch !== 'main' &&
      validation.branches &&
      !validation.branches.includes(defaultBranch)
    ) {
      throw new BadRequestException(`默认分支 "${defaultBranch}" 不存在`);
    }

    // 创建仓库
    const shouldPublish = this.isCommunityVisible(visibility);
    const repository = await this.prisma.repository.create({
      data: {
        name,
        gitUrl,
        ownerId: userId,
        defaultBranch: validation.defaultBranch ?? defaultBranch,
        visibility,
        description: description ?? null,
        isPublished: shouldPublish,
        publishedAt: shouldPublish ? new Date() : null,
        lastSyncAt: new Date(),
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // 创建者默认是仓库 OWNER
    await this.prisma.member.upsert({
      where: { repoId_userId: { repoId: repository.id, userId } } as any,
      update: { role: MemberRole.OWNER },
      create: { repoId: repository.id, userId, role: MemberRole.OWNER },
    });

    this.logger.log(`用户 ${userId} 创建仓库: ${name}`);
    return repository;
  }

  /**
   * 查询仓库列表。
   */
  async findAll(
    userId: string,
    userRole: UserRole,
    page = 1,
    limit = 10,
    search?: string
  ): Promise<{
    repositories: Repository[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = { isActive: true };

    // 非管理员只能查看自己的仓库
    if (userRole !== UserRole.ADMIN) {
      where.ownerId = userId;

      // 如果有搜索条件，添加名称过滤
      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }
    } else {
      // 管理员可以查看所有仓库
      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }
    }

    this.logger.log(
      `[findAll] Query conditions: ${JSON.stringify({ userId, userRole, where, skip, limit })}`
    );

    try {
      const [repositories, total] = await Promise.all([
        this.prisma.repository.findMany({
          where,
          include: {
            owner: { select: { id: true, username: true } },
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.repository.count({ where }),
      ]);

      this.logger.log(
        `[findAll] Found ${total} repositories, returning ${repositories.length} items`
      );

      return { repositories, total, page, limit };
    } catch (e) {
      this.logger.error('findAll repositories failed', e as any);
      return { repositories: [], total: 0, page, limit };
    }
  }

  async findOne(
    id: string,
    userId: string,
    userRole: UserRole
  ): Promise<Repository> {
    const repository = await this.prisma.repository.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!repository) {
      throw new NotFoundException('仓库不存在');
    }

    // 检查访问权限
    this.checkRepositoryAccess(repository as any, userId, userRole);

    return repository as any;
  }

  async update(
    id: string,
    userId: string,
    userRole: UserRole,
    updateRepositoryDto: UpdateRepositoryDto
  ): Promise<Repository> {
    const repository = await this.findOne(id, userId, userRole);

    // 只有仓库所有者或平台管理员可以更新
    if (repository.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('只有仓库所有者或管理员可以操作');
    }

    const { name, defaultBranch, visibility, description, isPublished } =
      updateRepositoryDto as any;
    const nextVisibility =
      this.normalizeVisibility(visibility) ?? repository.visibility;

    // 检查仓库名称是否重复
    if (name && name !== repository.name) {
      const existingRepo = await this.prisma.repository.findUnique({
        where: {
          ownerId_name: {
            ownerId: repository.ownerId,
            name,
          },
        },
      });

      if (existingRepo) {
        throw new ConflictException(`仓库 "${name}" 已存在`);
      }
    }

    // 校验默认分支是否存在
    if (defaultBranch && defaultBranch !== repository.defaultBranch) {
      const branchExists = await this.gitValidationService.checkBranchExists(
        repository.gitUrl,
        defaultBranch
      );
      if (!branchExists) {
        throw new BadRequestException(`分支 "${defaultBranch}" 不存在`);
      }
    }

    // compute publication state. PUBLIC/INTERNAL repositories are discoverable
    // in community by default; PRIVATE repositories must never stay published.
    let isPublishedUpdate: boolean | undefined = undefined;
    let publishedAtUpdate: Date | null | undefined = undefined;
    if (typeof isPublished === 'boolean') {
      isPublishedUpdate =
        isPublished && this.isCommunityVisible(nextVisibility);
      if (isPublishedUpdate && !repository.isPublished)
        publishedAtUpdate = new Date();
      if (!isPublishedUpdate && repository.isPublished)
        publishedAtUpdate = null;
    } else if (visibility !== undefined) {
      const shouldPublish = this.isCommunityVisible(nextVisibility);
      isPublishedUpdate = shouldPublish;
      if (shouldPublish && !repository.isPublished)
        publishedAtUpdate = new Date();
      if (!shouldPublish && repository.isPublished) publishedAtUpdate = null;
    }

    const updatedRepository = await this.prisma.repository.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(defaultBranch && { defaultBranch }),
        ...(visibility && { visibility: nextVisibility }),
        ...(description !== undefined && { description }),
        ...(isPublishedUpdate !== undefined && {
          isPublished: isPublishedUpdate,
        }),
        ...(publishedAtUpdate !== undefined && {
          publishedAt: publishedAtUpdate,
        }),
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    this.logger.log(`仓库 ${id} 更新成功`);
    return updatedRepository;
  }

  /**
   * 删除仓库。
   */
  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const repository = await this.findOne(id, userId, userRole);

    // 只有仓库所有者或平台管理员可以删除
    if (repository.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('只有仓库所有者或管理员可以操作');
    }

    await this.prisma.$transaction([
      this.prisma.comment.deleteMany({
        where: {
          snapshot: {
            repoId: id,
          },
        },
      }),
      this.prisma.repository.update({
        where: { id },
        data: {
          isActive: false,
          isPublished: false,
          publishedAt: null,
        },
      }),
    ]);

    this.logger.log(`仓库 ${id} 删除成功`);
  }

  /**
   * 获取指定分支的 HEAD SHA。
   */
  async getBranchHeadSha(
    repoId: string,
    userId: string,
    userRole: UserRole,
    branchName: string
  ): Promise<{ branch: string; sha: string }> {
    const repository = await this.findOne(repoId, userId, userRole);
    const sha = await this.gitValidationService.getCommitSha(
      repository.gitUrl,
      branchName
    );
    if (!sha) {
      throw new BadRequestException(`无法获取分支 ${branchName} 的 HEAD SHA`);
    }
    return { branch: branchName, sha };
  }

  /**
   * 校验 Git 连接。
   */
  async validateGitConnection(id: string, userId: string, userRole: UserRole) {
    const repository = await this.findOne(id, userId, userRole);

    const validation = await this.gitValidationService.validateGitUrl(
      repository.gitUrl
    );

    // 校验成功后更新时间戳
    if (validation.isValid) {
      await this.prisma.repository.update({
        where: { id },
        data: {
          lastSyncAt: new Date(),
        },
      });
    }

    return validation;
  }

  /**
   * 检查仓库访问权限。
   */
  private checkRepositoryAccess(
    repository: Repository,
    userId: string,
    userRole: UserRole
  ): void {
    // 平台管理员允许访问
    if (userRole === UserRole.ADMIN) {
      return;
    }

    // 仓库所有者允许访问
    if (repository.ownerId === userId) {
      return;
    }

    // 公共或内部仓库允许已登录用户读取
    if (
      repository.visibility === RepositoryVisibility.PUBLIC ||
      repository.visibility === RepositoryVisibility.INTERNAL
    ) {
      return;
    }

    // 私有仓库需要成员权限
    throw new ForbiddenException('无权访问仓库');
  }

  /**
   * 获取仓库分支列表，缺失时尝试从 Git 重新生成。
   */
  async getRepositoryBranches(
    repoId: string,
    userId: string,
    userRole: UserRole
  ): Promise<{
    branches: Array<{
      id: string;
      name: string;
      isDefault: boolean;
      commitSha: string;
    }>;
    defaultBranch: string;
  }> {
    // 检查访问权限
    const repository = await this.findOne(repoId, userId, userRole);

    // 查询数据库中的分支
    const repositoryBranches = await this.prisma.repositoryBranch.findMany({
      where: { repoId },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    // 如果数据库中没有分支，尝试从 Git 重新生成
    if (repositoryBranches.length === 0) {
      this.logger.log(
        `No branches found in DB for repo ${repoId}, creating from Git`
      );
      try {
        await this.baseSnapshotService.createBaseSnapshotsForRepository(repoId);
        // 重新查询分支
        const newBranches = await this.prisma.repositoryBranch.findMany({
          where: { repoId },
          orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
        });
        return {
          branches: newBranches.map((branch: any) => ({
            id: branch.id,
            name: branch.name,
            isDefault: branch.isDefault,
            commitSha: branch.commitSha,
          })),
          defaultBranch: repository.defaultBranch,
        };
      } catch (error) {
        this.logger.error(
          `Failed to create base snapshots for repo ${repoId}:`,
          error
        );
        // 回退到远程 Git 分支信息
        const info = await this.validateGitConnection(repoId, userId, userRole);
        return {
          branches: (info.branches || []).map(name => ({
            id: `temp-${name}`, // 临时 ID，仅用于前端展示
            name,
            isDefault: name === repository.defaultBranch,
            commitSha: '',
          })),
          defaultBranch: info.defaultBranch || repository.defaultBranch,
        };
      }
    }

    return {
      branches: repositoryBranches.map((branch: any) => ({
        id: branch.id,
        name: branch.name,
        isDefault: branch.isDefault,
        commitSha: branch.commitSha,
      })),
      defaultBranch: repository.defaultBranch,
    };
  }

  /**
   * 导入仓库：校验 Git URL、创建或复用仓库、确认分支 HEAD 并创建基础快照。
   */
  async importRepository(
    userId: string,
    userRole: UserRole,
    dto: ImportRepositoryDto
  ): Promise<ImportRepositoryResponseDto> {
    const gitUrl = (dto.gitUrl ?? '').trim();
    if (!gitUrl) {
      throw new BadRequestException('gitUrl 不能为空');
    }

    // 1) 校验 Git URL 可访问性
    const validation = await this.gitValidationService.validateGitUrl(gitUrl);
    if (!validation.isValid) {
      throw new BadRequestException(`Git 地址无效: ${validation.error}`);
    }

    // 2) 推导仓库名称
    const deriveName = (url: string): string => {
      try {
        const u = new URL(url.replace(/\.git$/, ''));
        const segs = u.pathname.split('/').filter(Boolean);
        return segs[segs.length - 1] ?? 'repository';
      } catch {
        return 'repository';
      }
    };
    const name = (dto.name ?? '').trim() || deriveName(gitUrl);
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      throw new BadRequestException(
        '仓库名称只能包含字母、数字、下划线和短横线'
      );
    }

    // 3) 创建或复用仓库
    const existing = await this.prisma.repository.findUnique({
      where: { ownerId_name: { ownerId: userId, name } },
    });
    const defaultBranch = validation.defaultBranch ?? 'main';

    let repository: Repository;
    if (existing) {
      // 复用已软删除的同名仓库
      if (!existing.isActive) {
        this.logger.log(`重新启用已删除仓库: ${name}`);
        const nextVisibility =
          this.normalizeVisibility(dto.visibility) ?? existing.visibility;
        const shouldPublish = this.isCommunityVisible(nextVisibility);
        repository = await this.prisma.repository.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            gitUrl, // 使用新的 Git URL 覆盖旧值
            defaultBranch,
            visibility: nextVisibility,
            description: dto.description ?? existing.description,
            isPublished: shouldPublish,
            publishedAt: shouldPublish ? new Date() : null,
            lastSyncAt: new Date(),
          },
        });
      } else {
        const nextVisibility =
          this.normalizeVisibility(dto.visibility) ?? existing.visibility;
        const shouldPublish = this.isCommunityVisible(nextVisibility);
        if (
          existing.gitUrl !== gitUrl ||
          existing.defaultBranch !== defaultBranch ||
          existing.visibility !== nextVisibility ||
          (dto.description !== undefined &&
            existing.description !== dto.description) ||
          existing.isPublished !== shouldPublish
        ) {
          repository = await this.prisma.repository.update({
            where: { id: existing.id },
            data: {
              gitUrl,
              defaultBranch,
              visibility: nextVisibility,
              ...(dto.description !== undefined && {
                description: dto.description,
              }),
              isPublished: shouldPublish,
              publishedAt: shouldPublish
                ? (existing.publishedAt ?? new Date())
                : null,
              lastSyncAt: new Date(),
            },
          });
        } else {
          repository = existing;
        }
      }
    } else {
      // 创建新仓库
      const visibility =
        this.normalizeVisibility(dto.visibility) ??
        RepositoryVisibility.PRIVATE;
      const shouldPublish = this.isCommunityVisible(visibility);
      repository = await this.prisma.repository.create({
        data: {
          name,
          gitUrl,
          ownerId: userId,
          defaultBranch,
          visibility,
          description: dto.description ?? null,
          isPublished: shouldPublish,
          publishedAt: shouldPublish ? new Date() : null,
          lastSyncAt: new Date(),
        },
      });

      // 创建者默认是仓库 OWNER
      await this.prisma.member.upsert({
        where: { repoId_userId: { repoId: repository.id, userId } } as any,
        update: { role: MemberRole.OWNER },
        create: { repoId: repository.id, userId, role: MemberRole.OWNER },
      });
    }

    // 4) 校验分支 HEAD
    const baseBranch = (dto.baseBranch ?? defaultBranch).trim();
    const featureBranch = (dto.featureBranch ?? '').trim() || undefined;

    const baseSha = await this.gitValidationService.getCommitSha(
      gitUrl,
      baseBranch
    );
    if (!baseSha) {
      throw new BadRequestException(`无法获取分支 ${baseBranch} 的 HEAD SHA`);
    }
    let featureSha: string | null = null;
    if (featureBranch) {
      featureSha = await this.gitValidationService.getCommitSha(
        gitUrl,
        featureBranch
      );
      if (!featureSha) {
        // feature 分支缺失时记录警告，后续不创建 Diff 快照
        this.logger.warn(
          `无法获取分支 ${featureBranch} 的 HEAD SHA，跳过 Diff 快照`
        );
      }
    }

    // 5) 创建基础快照
    try {
      const baseSnapshots =
        await this.baseSnapshotService.createBaseSnapshotsForRepository(
          repository.id
        );
      this.logger.log(
        `Created ${baseSnapshots.length} base snapshots for repository ${repository.id}`
      );
    } catch (e) {
      this.logger.warn(`创建基础快照失败 repo=${repository.id}`, e as any);
    }

    // 6) 返回快照标识。当前基础快照由异步任务补齐。
    let baseSnapshotId: string | undefined;
    let featureSnapshotId: string | undefined;

    return {
      repositoryId: repository.id,
      ...(baseSnapshotId ? { baseSnapshotId } : {}),
      ...(featureSnapshotId ? { featureSnapshotId } : {}),
      branches: {
        defaultBranch,
        baseBranch,
        ...(featureBranch ? { featureBranch } : {}),
      },
    };
  }

  /**
   * 获取当前用户在仓库中的成员状态，供 Web 的 my-status 使用。
   */
  async getMyStatus(
    repoId: string,
    userId: string
  ): Promise<{
    role: any | null;
    joinRequest: { id: string; status: any } | null;
  }> {
    // 已是成员时直接返回角色
    const member = await this.prisma.member.findUnique({
      where: { repoId_userId: { repoId, userId } } as any,
      select: { role: true },
    });
    if (member) {
      return { role: member.role, joinRequest: null } as any;
    }

    // 否则返回最近一次加入申请状态
    const jr = await this.prisma.joinRequest.findFirst({
      where: { repoId, userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true },
    });

    return {
      role: null,
      joinRequest: jr ? { id: jr.id, status: jr.status } : null,
    } as any;
  }

  // Normalize visibility value from various inputs
  private normalizeVisibility(v?: any): RepositoryVisibility | undefined {
    if (!v) return undefined as any;
    const s = String(v).toLowerCase();
    if (s === 'public' || s === 'public_all')
      return RepositoryVisibility.PUBLIC as any;
    if (s === 'internal' || s === 'public_readonly')
      return RepositoryVisibility.INTERNAL as any;
    if (s === 'private') return RepositoryVisibility.PRIVATE as any;
    return v as any;
  }

  private isCommunityVisible(visibility: RepositoryVisibility): boolean {
    return (
      visibility === RepositoryVisibility.PUBLIC ||
      visibility === RepositoryVisibility.INTERNAL
    );
  }
}
