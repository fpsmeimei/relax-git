import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  SnapshotStatus,
  UserRole,
} from '@relax-git/shared/generated/prisma-client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RepoAccess } from '../auth/decorators/repo-access.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RepoAccessGuard } from '../auth/guards/repo-access.guard';
import {
  CreateSnapshotDto,
  CreateSnapshotResponseDto,
  SnapshotListResponseDto,
  SnapshotResponseDto,
  SnapshotStatusResponseDto,
  UpdateSnapshotDto,
} from './dto';
import { SnapshotsService } from './snapshots.service';

/**
 * 快照管理控制器
 */
@ApiTags('snapshots')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('snapshots')
export class SnapshotsController {
  constructor(private readonly snapshotsService: SnapshotsService) {}

  /**
   * 转换快照对象为响应DTO
   */
  private toSnapshotResponseDto(snapshot: any): SnapshotResponseDto {
    return {
      id: snapshot.id,
      repoId: snapshot.repoId,
      ownerId: snapshot.ownerId,
      commitSha: snapshot.commitSha,
      branchName: snapshot.branchName,
      status: snapshot.status,
      title: snapshot.title,
      description: snapshot.description,
      worktreePath: snapshot.worktreePath,
      bundlePath: snapshot.bundlePath,
      expiresAt: snapshot.expiresAt.toISOString(),
      processedAt: snapshot.processedAt?.toISOString(),
      errorMessage: snapshot.errorMessage,
      createdAt: snapshot.createdAt.toISOString(),
      updatedAt: snapshot.updatedAt.toISOString(),
      repository: snapshot.repository
        ? {
            id: String(snapshot.repository.id),
            name: String(snapshot.repository.name),
            gitUrl: String(snapshot.repository.gitUrl),
            visibility: String(snapshot.repository.visibility),
            ...(snapshot.repository.owner && {
              owner: {
                id: String(snapshot.repository.owner.id),
                username: String(snapshot.repository.owner.username),
                email: String(snapshot.repository.owner.email),
              },
            }),
          }
        : undefined,
      ...(snapshot.owner && {
        owner: {
          id: String(snapshot.owner.id),
          username: String(snapshot.owner.username),
          email: String(snapshot.owner.email),
        },
      }),
    };
  }

  @Post()
  @ApiOperation({ summary: '创建快照' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '快照创建成功',
    type: CreateSnapshotResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '参数错误或仓库验证失败',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '仓库不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权访问此仓库',
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: '已达到最大并发快照数量限制',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('admin')
  async create(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() createSnapshotDto: CreateSnapshotDto
  ): Promise<CreateSnapshotResponseDto> {
    const snapshot = await this.snapshotsService.create(
      userId,
      createSnapshotDto,
      userRole
    );

    return {
      id: snapshot.id,
      status: snapshot.status,
      estimatedTime: 180, // 预估3分钟
      queuePosition: 1, // TODO: 实现队列位置查询
      createdAt: snapshot.createdAt.toISOString(),
    };
  }

  @Get()
  @ApiOperation({ summary: '获取快照列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每页数量',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: '状态过滤',
    enum: SnapshotStatus,
  })
  @ApiQuery({
    name: 'repoId',
    required: false,
    description: '仓库ID（可选，用于过滤；未提供时返回当前用户可见范围）',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取快照列表成功',
    type: SnapshotListResponseDto,
  })
  // 列表接口放宽权限守卫：不强制绑定具体仓库，由服务层按用户可见范围过滤
  async findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: SnapshotStatus,
    @Query('repoId') repoId?: string
  ): Promise<SnapshotListResponseDto> {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit
      ? Math.min(100, Math.max(1, parseInt(limit, 10)))
      : 10;

    const result = await this.snapshotsService.findAll(
      userId,
      userRole,
      pageNum,
      limitNum,
      status,
      repoId
    );

    return {
      snapshots: result.snapshots.map(snapshot =>
        this.toSnapshotResponseDto(snapshot)
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取快照详情' })
  @ApiParam({ name: 'id', description: '快照ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取快照详情成功',
    type: SnapshotResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '快照不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权访问此快照',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ): Promise<SnapshotResponseDto> {
    const snapshot = await this.snapshotsService.findOne(id, userId, userRole);
    return this.toSnapshotResponseDto(snapshot);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新快照' })
  @ApiParam({ name: 'id', description: '快照ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '快照更新成功',
    type: SnapshotResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '快照不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权修改此快照',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('admin')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() updateSnapshotDto: UpdateSnapshotDto
  ): Promise<SnapshotResponseDto> {
    const snapshot = await this.snapshotsService.update(
      id,
      userId,
      userRole,
      updateSnapshotDto
    );

    return this.toSnapshotResponseDto(snapshot);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除快照' })
  @ApiParam({ name: 'id', description: '快照ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '快照删除成功',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '快照不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权删除此快照',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('admin')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ): Promise<void> {
    return this.snapshotsService.remove(id, userId, userRole);
  }

  @Get(':id/status')
  @ApiOperation({ summary: '获取快照实时状态' })
  @ApiParam({ name: 'id', description: '快照ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取快照状态成功',
    type: SnapshotStatusResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '快照不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权访问此快照',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async getStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ): Promise<SnapshotStatusResponseDto> {
    return this.snapshotsService.getStatus(id, userId, userRole);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: '重试失败的快照' })
  @ApiParam({ name: 'id', description: '快照ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '快照重试成功',
    type: SnapshotResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '只有失败的快照可以重试',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '快照不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权重试此快照',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('admin')
  async retry(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ): Promise<SnapshotResponseDto> {
    const snapshot = await this.snapshotsService.retry(id, userId, userRole);

    return this.toSnapshotResponseDto(snapshot);
  }

  @Post(':id/refresh')
  @ApiOperation({ summary: '刷新快照为其分支最新 HEAD（保留原快照ID）' })
  @ApiParam({ name: 'id', description: '快照ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: SnapshotResponseDto,
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('admin')
  async refresh(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ): Promise<SnapshotResponseDto> {
    const snapshot = await this.snapshotsService.refresh(id, userId, userRole);
    return this.toSnapshotResponseDto(snapshot);
  }

  @Get(':id/file')
  @ApiOperation({ summary: '读取快照内指定文件的内容（text/plain）' })
  @ApiParam({ name: 'id', description: '快照ID' })
  @ApiQuery({
    name: 'path',
    required: true,
    description: '文件路径（相对快照根目录）',
  })
  @ApiResponse({ status: HttpStatus.OK, description: '返回文件纯文本内容' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '文件不存在或不可访问',
  })
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async getFileContent(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query('path') filePath: string
  ): Promise<string> {
    return this.snapshotsService.getFileContent(id, userId, userRole, filePath);
  }

  @Get(':id/tree')
  @ApiOperation({ summary: '列出快照内指定目录（单层）' })
  @ApiParam({ name: 'id', description: '快照ID' })
  @ApiQuery({
    name: 'path',
    required: false,
    description: '目录路径，相对快照根目录；默认根目录',
  })
  @ApiResponse({ status: HttpStatus.OK, description: '返回目录条目列表' })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async getTree(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query('path') dirPath?: string
  ): Promise<Array<{ name: string; type: 'dir' | 'file'; size?: number }>> {
    return this.snapshotsService.getTree(id, userId, userRole, dirPath ?? '');
  }
}
