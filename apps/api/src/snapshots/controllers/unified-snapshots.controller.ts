import {
  Controller,
  Delete,
  Get,
  Header,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RepoAccess } from '../../auth/decorators/repo-access.decorator';
import { RepoAccessGuard } from '../../auth/guards/repo-access.guard';
import { UnifiedSnapshotService } from '../services/unified-snapshot.service';

/**
 * 统一快照API控制器
 * 提供一致的REST接口，替代分散的多个控制器
 * 支持所有快照类型：BaseSnapshot、SessionSnapshot、传统Snapshot
 */
@ApiTags('Unified Snapshots')
@Controller('snapshots')
export class UnifiedSnapshotsController {
  constructor(
    private readonly unifiedSnapshotService: UnifiedSnapshotService
  ) {}

  /**
   * 获取快照详情
   * 统一处理所有类型的快照
   */
  @Get(':id')
  @ApiOperation({
    summary: '获取快照详情',
    description: '获取指定快照的详细信息，支持所有快照类型',
  })
  @ApiParam({ name: 'id', description: '快照ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取快照详情成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '快照ID' },
        type: {
          type: 'string',
          enum: ['base', 'session', 'traditional'],
          description: '快照类型',
        },
        status: { type: 'string', description: '快照状态' },
        repository: { type: 'object', description: '仓库信息' },
        createdAt: { type: 'string', description: '创建时间' },
        updatedAt: { type: 'string', description: '更新时间' },
      },
    },
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
  async getSnapshot(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ) {
    return this.unifiedSnapshotService.getSnapshot(id, userId, userRole);
  }

  /**
   * 获取快照文件树
   * 统一的文件树获取接口，支持共享访问
   */
  @Get(':id/tree')
  @ApiOperation({
    summary: '获取快照文件树',
    description: '列出快照内指定目录的文件和子目录',
  })
  @ApiParam({ name: 'id', description: '快照ID' })
  @ApiQuery({
    name: 'path',
    required: false,
    description: '目录路径，相对快照根目录；默认根目录',
    example: 'src/components',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取文件树成功',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: '文件/目录名' },
          type: {
            type: 'string',
            enum: ['file', 'dir'],
            description: '类型',
          },
          size: { type: 'number', description: '文件大小（仅文件）' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '快照或目录不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权访问此快照',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async getTree(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query('path') dirPath?: string
  ): Promise<Array<{ name: string; type: 'dir' | 'file'; size?: number }>> {
    return this.unifiedSnapshotService.getTree(
      id,
      userId,
      userRole,
      dirPath || ''
    );
  }

  /**
   * 获取快照文件内容
   * 统一的文件内容获取接口，支持共享访问
   */
  @Get(':id/file')
  @ApiOperation({
    summary: '获取快照文件内容',
    description: '读取快照内指定文件的内容',
  })
  @ApiParam({ name: 'id', description: '快照ID' })
  @ApiQuery({
    name: 'path',
    required: true,
    description: '文件路径（相对快照根目录）',
    example: 'src/App.tsx',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回文件纯文本内容',
    schema: {
      type: 'string',
      description: '文件内容',
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '文件不存在或不可访问',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权访问此快照',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '文件路径无效或文件过大',
  })
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async getFile(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query('path') filePath: string
  ): Promise<string> {
    return this.unifiedSnapshotService.getFile(id, userId, userRole, filePath);
  }

  /**
   * 创建会话快照
   * 为用户浏览代码创建临时快照
   */
  @Post('session/:repoId/branches/:branchId')
  @ApiOperation({
    summary: '创建会话快照',
    description: '为用户创建临时的代码浏览快照，从基础快照派生',
  })
  @ApiParam({ name: 'repoId', description: '仓库ID' })
  @ApiParam({ name: 'branchId', description: '分支ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '会话快照创建成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '会话快照ID' },
        type: { type: 'string', enum: ['session'], description: '快照类型' },
        status: { type: 'string', description: '快照状态' },
        expiresAt: { type: 'string', description: '过期时间' },
        createdAt: { type: 'string', description: '创建时间' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '仓库或分支不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权访问此仓库',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async createSessionSnapshot(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Param('repoId') repoId: string,
    @Param('branchId') branchId: string
  ) {
    const sessionSnapshot =
      await this.unifiedSnapshotService.createOrGetSessionSnapshot(
        userId,
        repoId,
        branchId,
        userRole
      );

    return {
      id: sessionSnapshot.id,
      type: 'session',
      status: sessionSnapshot.status,
      expiresAt: sessionSnapshot.expiresAt.toISOString(),
      createdAt: sessionSnapshot.createdAt.toISOString(),
      baseSnapshotId: sessionSnapshot.baseSnapshotId,
    };
  }

  /**
   * 延长会话快照TTL（前端保活用）
   */
  @Post(':id/extend')
  @ApiOperation({
    summary: '延长会话快照TTL',
    description: '将会话快照的过期时间顺延，如非会话快照或不存在则返回404',
  })
  @ApiParam({ name: 'id', description: '会话快照ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '续期成功' })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async extendSessionSnapshot(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ) {
    return this.unifiedSnapshotService.extendSessionSnapshot(
      id,
      userId,
      userRole
    );
  }

  /**
   * 释放会话快照（退出浏览即删除）
   */
  @Delete(':id')
  @ApiOperation({
    summary: '释放会话快照',
    description: '退出浏览时删除会话快照（仅本人或管理员可操作）',
  })
  @ApiParam({ name: 'id', description: '会话快照ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: '释放成功' })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async releaseSessionSnapshot(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ): Promise<void> {
    await this.unifiedSnapshotService.releaseSessionSnapshot(
      id,
      userId,
      userRole
    );
  }

  /**
   * 获取快照访问统计
   * 用于监控和分析
   */
  @Get(':id/stats')
  @ApiOperation({
    summary: '获取快照访问统计',
    description: '获取快照的访问统计信息，用于监控和分析',
  })
  @ApiParam({ name: 'id', description: '快照ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取统计信息成功',
    schema: {
      type: 'object',
      properties: {
        snapshotId: { type: 'string', description: '快照ID' },
        accessCount: { type: 'number', description: '访问次数' },
        lastAccessedAt: { type: 'string', description: '最后访问时间' },
        createdAt: { type: 'string', description: '创建时间' },
        repository: { type: 'object', description: '仓库信息' },
      },
    },
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
  async getSnapshotStats(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ) {
    return this.unifiedSnapshotService.getSnapshotStats(id, userId, userRole);
  }
}

/**
 * 向后兼容的废弃端点控制器
 * 提供session-snapshots路径的兼容性支持
 *
 * @deprecated 请使用 /snapshots 端点替代
 */
@ApiTags('Session Snapshots (Deprecated)')
@Controller('session-snapshots')
export class DeprecatedSessionSnapshotsController {
  constructor(
    private readonly unifiedSnapshotService: UnifiedSnapshotService
  ) {}

  /**
   * @deprecated 请使用 GET /snapshots/:id 替代
   */
  @Get(':id')
  @ApiOperation({
    summary: '获取会话快照详情 (已废弃)',
    description: '⚠️ 此端点已废弃，请使用 GET /snapshots/:id 替代',
    deprecated: true,
  })
  @ApiParam({ name: 'id', description: '快照ID' })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async getSessionSnapshot(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ) {
    // 添加废弃警告头
    return this.unifiedSnapshotService.getSnapshot(id, userId, userRole);
  }

  /**
   * @deprecated 请使用 GET /snapshots/:id/tree 替代
   */
  @Get(':id/tree')
  @ApiOperation({
    summary: '获取会话快照文件树 (已废弃)',
    description: '⚠️ 此端点已废弃，请使用 GET /snapshots/:id/tree 替代',
    deprecated: true,
  })
  @ApiParam({ name: 'id', description: '快照ID' })
  @ApiQuery({ name: 'path', required: false, description: '目录路径' })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async getSessionSnapshotTree(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query('path') dirPath?: string
  ) {
    return this.unifiedSnapshotService.getTree(
      id,
      userId,
      userRole,
      dirPath || ''
    );
  }

  /**
   * @deprecated 请使用 GET /snapshots/:id/file 替代
   */
  @Get(':id/file')
  @ApiOperation({
    summary: '获取会话快照文件内容 (已废弃)',
    description: '⚠️ 此端点已废弃，请使用 GET /snapshots/:id/file 替代',
    deprecated: true,
  })
  @ApiParam({ name: 'id', description: '快照ID' })
  @ApiQuery({ name: 'path', required: true, description: '文件路径' })
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async getSessionSnapshotFile(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query('path') filePath: string
  ) {
    return this.unifiedSnapshotService.getFile(id, userId, userRole, filePath);
  }
}
