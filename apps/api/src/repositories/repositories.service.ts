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
 * ??????
 * ?????CRUD???????
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
   * ?? Git URL ????????????????????????
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
   * ????
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

    // ??????????????????
    const existingRepo = await this.prisma.repository.findUnique({
      where: {
        ownerId_name: {
          ownerId: userId,
          name,
        },
      },
    });

    if (existingRepo) {
      throw new ConflictException(`???? "${name}" ???`);
    }

    // ??Git????
    const validation = await this.gitValidationService.validateGitUrl(gitUrl);
    if (!validation.isValid) {
      throw new BadRequestException(`Git??????: ${validation.error}`);
    }

    // ??????????????????
    if (
      defaultBranch !== 'main' &&
      validation.branches &&
      !validation.branches.includes(defaultBranch)
    ) {
      throw new BadRequestException(`??????? "${defaultBranch}" ???`);
    }

    // ??????
    const repository = await this.prisma.repository.create({
      data: {
        name,
        gitUrl,
        ownerId: userId,
        defaultBranch: validation.defaultBranch ?? defaultBranch,
        visibility,
        description: description ?? null,
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

    // ????????????OWNER?
    await this.prisma.member.upsert({
      where: { repoId_userId: { repoId: repository.id, userId } } as any,
      update: { role: MemberRole.OWNER },
      create: { repoId: repository.id, userId, role: MemberRole.OWNER },
    });

    this.logger.log(`?? ${userId} ?????: ${name}`);
    return repository;
  }

  /**
   * ??????
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

    // ??????
    const where: any = { isActive: true };

    // ????????????????PUBLIC/INTERNAL????
    if (userRole !== UserRole.ADMIN) {
      const andConditions: any[] = [
        {
          OR: [
            { ownerId: userId },
            { visibility: RepositoryVisibility.PUBLIC },
            { visibility: RepositoryVisibility.INTERNAL },
          ],
        },
      ];
      if (search) {
        andConditions.unshift({
          name: { contains: search, mode: 'insensitive' },
        });
      }
      where.AND = andConditions;
    } else if (search) {
      where.name = { contains: search, mode: 'insensitive' };
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
      throw new NotFoundException('?????');
    }

    // ????
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

    // ???????????????
    if (repository.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('?????????????????');
    }

    const { name, defaultBranch, visibility, description, isPublished } =
      updateRepositoryDto as any;

    // ?????????????
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
        throw new ConflictException(`???? "${name}" ???`);
      }
    }

    // ?????????????????
    if (defaultBranch && defaultBranch !== repository.defaultBranch) {
      const branchExists = await this.gitValidationService.checkBranchExists(
        repository.gitUrl,
        defaultBranch
      );
      if (!branchExists) {
        throw new BadRequestException(`?? "${defaultBranch}" ???`);
      }
    }

    // compute publishedAt update when toggling publish state
    let publishedAtUpdate: Date | null | undefined = undefined;
    if (typeof isPublished === 'boolean') {
      if (isPublished && !repository.isPublished)
        publishedAtUpdate = new Date();
      if (!isPublished && repository.isPublished) publishedAtUpdate = null;
    }

    const updatedRepository = await this.prisma.repository.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(defaultBranch && { defaultBranch }),
        ...(visibility && { visibility }),
        ...(description !== undefined && { description }),
        ...(isPublished !== undefined && { isPublished }),
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

    this.logger.log(`?? ${id} ???`);
    return updatedRepository;
  }

  /**
   * ????
   */
  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const repository = await this.findOne(id, userId, userRole);

    // ???????????????
    if (repository.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('?????????????????');
    }

    // ????????????
    await this.prisma.repository.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    this.logger.log(`?? ${id} ???`);
  }

  /**
   * ??????????? HEAD SHA
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
      throw new BadRequestException(`????? ${branchName} ? HEAD ??`);
    }
    return { branch: branchName, sha };
  }

  /**
   * ??Git????
   */
  async validateGitConnection(id: string, userId: string, userRole: UserRole) {
    const repository = await this.findOne(id, userId, userRole);

    const validation = await this.gitValidationService.validateGitUrl(
      repository.gitUrl
    );

    // ???????????????
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
   * ????????
   */
  private checkRepositoryAccess(
    repository: Repository,
    userId: string,
    userRole: UserRole
  ): void {
    // ???????????
    if (userRole === UserRole.ADMIN) {
      return;
    }

    // ?????????
    if (repository.ownerId === userId) {
      return;
    }

    // ????????????
    if (
      repository.visibility === RepositoryVisibility.PUBLIC ||
      repository.visibility === RepositoryVisibility.INTERNAL
    ) {
      return;
    }

    // ????????
    throw new ForbiddenException('???????');
  }

  /**
   * ????????????branchId?
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
    // ????
    const repository = await this.findOne(repoId, userId, userRole);

    // ???????????
    const repositoryBranches = await this.prisma.repositoryBranch.findMany({
      where: { repoId },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    // ????????????????Git?????
    if (repositoryBranches.length === 0) {
      this.logger.log(
        `No branches found in DB for repo ${repoId}, creating from Git`
      );
      try {
        await this.baseSnapshotService.createBaseSnapshotsForRepository(repoId);
        // ????????
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
        // ??????Git??????
        const info = await this.validateGitConnection(repoId, userId, userRole);
        return {
          branches: (info.branches || []).map(name => ({
            id: `temp-${name}`, // ??ID??????????
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
   * ??????? Git URL -> ??/???? -> ???? HEAD -> ???? -> ???? Diff
   */
  async importRepository(
    userId: string,
    userRole: UserRole,
    dto: ImportRepositoryDto
  ): Promise<ImportRepositoryResponseDto> {
    const gitUrl = (dto.gitUrl ?? '').trim();
    if (!gitUrl) {
      throw new BadRequestException('gitUrl ????');
    }

    // 1) ?? Git URL ?????
    const validation = await this.gitValidationService.validateGitUrl(gitUrl);
    if (!validation.isValid) {
      throw new BadRequestException(`Git ??????: ${validation.error}`);
    }

    // 2) ????
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
      throw new BadRequestException('?????????????????????');
    }

    // 3) ??/????
    const existing = await this.prisma.repository.findUnique({
      where: { ownerId_name: { ownerId: userId, name } },
    });
    const defaultBranch = validation.defaultBranch ?? 'main';

    let repository: Repository;
    if (existing) {
      // ????????????????
      if (!existing.isActive) {
        this.logger.log(`??????????: ${name}`);
        repository = await this.prisma.repository.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            gitUrl, // ??Git URL???????
            defaultBranch,
            visibility:
              this.normalizeVisibility(dto.visibility) ?? existing.visibility,
            description: dto.description ?? existing.description,
            lastSyncAt: new Date(),
          },
        });
      } else {
        repository = existing;
      }
    } else {
      // ?????
      repository = await this.prisma.repository.create({
        data: {
          name,
          gitUrl,
          ownerId: userId,
          defaultBranch,
          visibility:
            this.normalizeVisibility(dto.visibility) ??
            RepositoryVisibility.PRIVATE,
          description: dto.description ?? null,
          lastSyncAt: new Date(),
        },
      });

      // ????????????OWNER?
      await this.prisma.member.upsert({
        where: { repoId_userId: { repoId: repository.id, userId } } as any,
        update: { role: MemberRole.OWNER },
        create: { repoId: repository.id, userId, role: MemberRole.OWNER },
      });
    }

    // 4) ????
    const baseBranch = (dto.baseBranch ?? defaultBranch).trim();
    const featureBranch = (dto.featureBranch ?? '').trim() || undefined;

    const baseSha = await this.gitValidationService.getCommitSha(
      gitUrl,
      baseBranch
    );
    if (!baseSha) {
      throw new BadRequestException(`????? ${baseBranch} ? HEAD ??`);
    }
    let featureSha: string | null = null;
    if (featureBranch) {
      featureSha = await this.gitValidationService.getCommitSha(
        gitUrl,
        featureBranch
      );
      if (!featureSha) {
        // ???????????? Warning
        this.logger.warn(`?????????? ${featureBranch} ? HEAD??? Diff ??`);
      }
    }

    // 5) ???????????????
    try {
      const baseSnapshots =
        await this.baseSnapshotService.createBaseSnapshotsForRepository(
          repository.id
        );
      this.logger.log(
        `Created ${baseSnapshots.length} base snapshots for repository ${repository.id}`
      );
    } catch (e) {
      this.logger.warn(`?????????repo=${repository.id}`, e as any);
    }

    // 6) ??????????BaseSnapshot???????????
    // ?????????????????BaseSnapshot????
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
   * ?????????????????????? Web ??my-status????
   */
  async getMyStatus(
    repoId: string,
    userId: string
  ): Promise<{
    role: any | null;
    joinRequest: { id: string; status: any } | null;
  }> {
    // ????
    const member = await this.prisma.member.findUnique({
      where: { repoId_userId: { repoId, userId } } as any,
      select: { role: true },
    });
    if (member) {
      return { role: member.role, joinRequest: null } as any;
    }

    // ????????????
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
}
