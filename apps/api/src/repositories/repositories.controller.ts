import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RepoAccess } from '../auth/decorators/repo-access.decorator';
import { RepoAccessGuard } from '../auth/guards/repo-access.guard';
import {
  CreateRepositoryDto,
  GitValidationResponseDto,
  ImportRepositoryDto,
  ImportRepositoryResponseDto,
  RepositoryListResponseDto,
  RepositoryResponseDto,
  UpdateRepositoryDto,
} from './dto';
import { RepositoriesService } from './repositories.service';
import type { FastifyRequest } from 'fastify';
import { UploadService } from '../upload/upload.service';

/**
 * 仓库管理控制器
 */
@ApiTags('repositories')
@Controller('api/repositories')
export class RepositoriesController {
  constructor(
    private readonly repositoriesService: RepositoriesService,
    private readonly uploadService: UploadService
  ) {}

  /**
   * 将仓库模型映射为响应 DTO
   */
  private toRepositoryResponseDto(repo: any): RepositoryResponseDto {
    return {
      id: String(repo.id),
      name: String(repo.name),
      gitUrl: String(repo.gitUrl),
      ownerId: String(repo.ownerId),
      defaultBranch: String(repo.defaultBranch),
      visibility: repo.visibility,
      ...(repo.coverImage ? { coverImage: String(repo.coverImage) } : {}),
      ...(typeof repo.isPublished === 'boolean'
        ? { isPublished: Boolean(repo.isPublished) }
        : {}),
      ...(repo.publishedAt
        ? { publishedAt: new Date(repo.publishedAt).toISOString() }
        : {}),
      ...(repo.description ? { description: String(repo.description) } : {}),
      isActive: Boolean(repo.isActive),
      ...(repo.lastSyncAt
        ? { lastSyncAt: new Date(repo.lastSyncAt).toISOString() }
        : {}),
      createdAt: new Date(repo.createdAt).toISOString(),
      updatedAt: new Date(repo.updatedAt).toISOString(),
      ...(repo.owner && {
        owner: {
          id: String(repo.owner.id),
          username: String(repo.owner.username),
        },
      }),
    };
  }

  @Get(':id/branch-head')
  @ApiOperation({ summary: '获取指定分支的最新 HEAD SHA' })
  @ApiParam({ name: 'id', description: '仓库ID' })
  @ApiQuery({ name: 'branch', required: true, description: '分支名称' })
  @ApiResponse({ status: HttpStatus.OK, description: '成功返回 HEAD SHA' })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async getBranchHead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query('branch') branch: string
  ): Promise<{ branch: string; sha: string }> {
    return this.repositoriesService.getBranchHeadSha(
      id,
      userId,
      userRole,
      branch
    );
  }

  @Post()
  @ApiOperation({ summary: '创建仓库' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '仓库创建成功',
    type: RepositoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Git仓库验证失败或参数错误',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '仓库名称已存在',
  })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createRepositoryDto: CreateRepositoryDto
  ): Promise<RepositoryResponseDto> {
    const repo = await this.repositoriesService.create(
      userId,
      createRepositoryDto
    );
    return this.toRepositoryResponseDto(repo);
  }

  @Get()
  @ApiOperation({ summary: '获取仓库列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每页数量',
    example: 10,
  })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取仓库列表成功',
    type: RepositoryListResponseDto,
  })
  async findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ): Promise<RepositoryListResponseDto> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const result = await this.repositoriesService.findAll(
      userId,
      userRole,
      pageNum,
      limitNum,
      search
    );

    return {
      repositories: result.repositories.map(r =>
        this.toRepositoryResponseDto(r)
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id/branches')
  @ApiOperation({
    summary: '获取仓库的分支列表（包含branchId用于Session快照）',
  })
  @ApiParam({ name: 'id', description: '仓库ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '成功返回分支信息' })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async getBranches(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ): Promise<{
    branches: Array<{
      id: string;
      name: string;
      isDefault: boolean;
      commitSha: string;
    }>;
    defaultBranch: string;
  }> {
    return this.repositoriesService.getRepositoryBranches(id, userId, userRole);
  }

  @Get(':id/my-status')
  @ApiOperation({ summary: '获取当前用户在该仓库的角色与加入申请状态' })
  @ApiParam({ name: 'id', description: '仓库ID' })
  async getMyStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ): Promise<{
    role: any | null;
    joinRequest: { id: string; status: any } | null;
  }> {
    return (await this.repositoriesService.getMyStatus(id, userId)) as any;
  }

  @Get(':id')
  @ApiOperation({ summary: '获取仓库详情' })
  @ApiParam({ name: 'id', description: '仓库ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取仓库详情成功',
    type: RepositoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '仓库不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权访问此仓库',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ): Promise<RepositoryResponseDto> {
    const repo = await this.repositoriesService.findOne(id, userId, userRole);
    return this.toRepositoryResponseDto(repo);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新仓库' })
  @ApiParam({ name: 'id', description: '仓库ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '仓库更新成功',
    type: RepositoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '仓库不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权修改此仓库',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '仓库名称已存在',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() updateRepositoryDto: UpdateRepositoryDto
  ): Promise<RepositoryResponseDto> {
    const repo = await this.repositoriesService.update(
      id,
      userId,
      userRole,
      updateRepositoryDto
    );
    return this.toRepositoryResponseDto(repo);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除仓库' })
  @ApiParam({ name: 'id', description: '仓库ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '仓库删除成功',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '仓库不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权删除此仓库',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ): Promise<void> {
    return this.repositoriesService.remove(id, userId, userRole);
  }

  @Post('validate-url')
  @ApiOperation({ summary: '验证任意 Git URL 并返回分支及默认分支' })
  @ApiResponse({ status: HttpStatus.OK, type: GitValidationResponseDto })
  async validateGitUrl(
    @Body() body: { gitUrl: string }
  ): Promise<GitValidationResponseDto> {
    return this.repositoriesService.validateGitUrlPublic(
      (body as any)?.gitUrl ?? ''
    );
  }

  @Post('import')
  @ApiOperation({
    summary: '导入 Git 仓库（URL → 创建/复用仓库 → 创建快照）',
    description:
      '返回仓库ID与快照IDs（如创建）；若快照创建/排队失败也会返回 repositoryId 与分支信息以便后续操作。不再自动创建 Diff；可通过 /snapshots/:id/status 轮询快照状态',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      '导入任务已创建（异步处理快照，若快照创建失败仍返回 repositoryId 以保持闭环）；不再自动创建 Diff',
    type: ImportRepositoryResponseDto,
  })
  async importRepository(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() dto: ImportRepositoryDto
  ): Promise<ImportRepositoryResponseDto> {
    const result = await this.repositoriesService.importRepository(
      userId,
      userRole,
      dto
    );
    return result;
  }

  @Post(':id/validate')
  @ApiOperation({ summary: '验证Git仓库连接' })
  @ApiParam({ name: 'id', description: '仓库ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Git仓库验证结果',
    type: GitValidationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '仓库不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权访问此仓库',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async validateGitConnection(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ): Promise<GitValidationResponseDto> {
    return this.repositoriesService.validateGitConnection(id, userId, userRole);
  }

  @Post(':id/cover')
  @ApiOperation({ summary: '上传仓库封面（multipart/form-data）' })
  @ApiParam({ name: 'id', description: '仓库ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '封面上传成功' })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async uploadCover(
    @Param('id') id: string,
    @Req() req: FastifyRequest,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ): Promise<RepositoryResponseDto> {
    const data: any = await (req as any).file();
    if (!data) {
      throw new Error('未接收到文件');
    }

    // 使用 UploadService 处理文件上传
    const coverUrl = await this.uploadService.uploadRepositoryCover(data, id);

    const updated = await this.repositoriesService.updateCoverImage(
      id,
      userId,
      userRole,
      coverUrl
    );
    return this.toRepositoryResponseDto(updated);
  }
}
