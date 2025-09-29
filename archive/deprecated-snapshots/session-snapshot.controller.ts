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
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SessionSnapshot } from '@relax-git/shared/generated/prisma-client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionSnapshotService } from './session-snapshot.service';
import { SnapshotCleanupService } from './snapshot-cleanup.service';

/**
 * 会话快照控制器
 * 处理用户代码浏览时的临时快照管理
 */
@ApiTags('Session Snapshots')
@Controller('session-snapshots')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SessionSnapshotController {
  constructor(
    private readonly sessionSnapshotService: SessionSnapshotService,
    private readonly cleanupService: SnapshotCleanupService
  ) {}

  /**
   * 创建会话快照
   * 用于用户浏览代码时创建临时快照
   */
  @Post(':repoId/branches/:branchId')
  @ApiOperation({
    summary: '创建会话快照',
    description: '为用户创建临时的代码浏览快照，从基础快照派生',
  })
  @ApiParam({ name: 'repoId', description: '仓库ID' })
  @ApiParam({ name: 'branchId', description: '分支ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '会话快照创建成功',
  })
  async createSessionSnapshot(
    @CurrentUser('id') userId: string,
    @Param('repoId') repoId: string,
    @Param('branchId') branchId: string
  ): Promise<SessionSnapshot> {
    return this.sessionSnapshotService.createSessionSnapshot(
      userId,
      repoId,
      branchId
    );
  }

  /**
   * 获取会话快照详情
   */
  @Get(':id')
  @ApiOperation({
    summary: '获取会话快照详情',
    description: '获取指定会话快照的详细信息',
  })
  @ApiParam({ name: 'id', description: '会话快照ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '会话快照详情',
  })
  async getSessionSnapshot(
    @CurrentUser('id') userId: string,
    @Param('id') id: string
  ): Promise<SessionSnapshot> {
    return this.sessionSnapshotService.getSessionSnapshot(id, userId);
  }

  /**
   * 获取用户的活跃会话快照列表
   */
  @Get()
  @ApiOperation({
    summary: '获取用户活跃会话快照',
    description: '获取当前用户所有活跃的会话快照列表',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '活跃会话快照列表',
  })
  async getUserActiveSessionSnapshots(
    @CurrentUser('id') userId: string
  ): Promise<SessionSnapshot[]> {
    return this.sessionSnapshotService.getUserActiveSessionSnapshots(userId);
  }

  /**
   * 延长会话快照TTL
   */
  @Post(':id/extend')
  @ApiOperation({
    summary: '延长会话快照TTL',
    description: '延长指定会话快照的生存时间',
  })
  @ApiParam({ name: 'id', description: '会话快照ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'TTL延长成功',
  })
  async extendSessionSnapshot(
    @CurrentUser('id') userId: string,
    @Param('id') id: string
  ): Promise<SessionSnapshot> {
    return this.sessionSnapshotService.extendSessionSnapshot(id, userId);
  }

  /**
   * 删除会话快照
   */
  @Delete(':id')
  @ApiOperation({
    summary: '删除会话快照',
    description: '手动删除指定的会话快照',
  })
  @ApiParam({ name: 'id', description: '会话快照ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '会话快照删除成功',
  })
  async deleteSessionSnapshot(
    @CurrentUser('id') userId: string,
    @Param('id') id: string
  ): Promise<void> {
    return this.sessionSnapshotService.deleteSessionSnapshot(id, userId);
  }

  /**
   * 获取会话快照的文件树
   */
  @Get(':id/tree')
  @ApiOperation({
    summary: '获取会话快照文件树',
    description: '获取指定会话快照的文件和目录列表',
  })
  @ApiParam({ name: 'id', description: '会话快照ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '文件树获取成功',
  })
  async getSessionSnapshotTree(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Query('path') dirPath?: string
  ): Promise<Array<{ name: string; type: 'dir' | 'file'; size?: number }>> {
    return this.sessionSnapshotService.getSessionSnapshotTree(
      id,
      userId,
      dirPath ?? ''
    );
  }

  /**
   * 获取会话快照的文件内容
   */
  @Get(':id/file')
  @ApiOperation({
    summary: '获取会话快照文件内容',
    description: '获取指定会话快照中文件的内容',
  })
  @ApiParam({ name: 'id', description: '会话快照ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '文件内容获取成功',
  })
  @Header('Content-Type', 'text/plain; charset=utf-8')
  async getSessionSnapshotFileContent(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Query('path') filePath: string
  ): Promise<string> {
    return this.sessionSnapshotService.getSessionSnapshotFileContent(
      id,
      userId,
      filePath
    );
  }

  /**
   * 获取清理统计信息（管理员功能）
   */
  @Get('admin/cleanup-stats')
  @ApiOperation({
    summary: '获取清理统计信息',
    description: '获取会话快照清理的统计信息（管理员功能）',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '清理统计信息',
  })
  async getCleanupStats(): Promise<{
    activeSessionSnapshots: number;
    expiredSessionSnapshots: number;
    totalSessionDirectories: number;
    orphanDirectories: number;
  }> {
    return this.cleanupService.getCleanupStats();
  }

  /**
   * 手动触发清理（管理员功能）
   */
  @Post('admin/cleanup')
  @ApiOperation({
    summary: '手动触发清理',
    description: '手动触发会话快照的全面清理（管理员功能）',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '清理完成',
  })
  async manualCleanup(): Promise<{
    expiredSnapshots: number;
    staleSnapshots: number;
    orphanDirectories: number;
  }> {
    return this.cleanupService.manualFullCleanup();
  }
}
