import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { BaseSnapshotStatus } from '@relax-git/shared/generated/prisma-client';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { PrismaService } from '../database/prisma.service';
import { BaseSnapshotService } from './base-snapshot.service';

/**
 * Artifacts 风格的 REST API
 * 提供清晰的RESTful接口访问快照工件
 */
@Controller('api/artifacts')
export class ArtifactsController {
  constructor(
    private readonly baseSnapshotService: BaseSnapshotService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * 获取artifact信息
   * GET /api/artifacts/:id
   */
  @Get(':id')
  async getArtifact(@Param('id') id: string, @Request() req: any) {
    // 先尝试从base_snapshots获取
    const baseSnapshot = await this.prisma.baseSnapshot.findUnique({
      where: { id },
      include: {
        repository: true,
        branch: true,
      },
    });

    if (baseSnapshot) {
      // 检查访问权限
      await this.checkRepositoryAccess(baseSnapshot.repository.id, req.user.id);

      return {
        id: baseSnapshot.id,
        repoId: baseSnapshot.repoId,
        branchId: baseSnapshot.branchId,
        commitSha: baseSnapshot.commitSha,
        status: baseSnapshot.status,
        worktreePath: baseSnapshot.worktreePath,
        bundlePath: baseSnapshot.bundlePath,
        processedAt: baseSnapshot.processedAt,
        errorMessage: baseSnapshot.errorMessage,
        createdAt: baseSnapshot.createdAt,
        repository: {
          id: baseSnapshot.repository.id,
          name: baseSnapshot.repository.name,
        },
        branch: {
          id: baseSnapshot.branch.id,
          name: baseSnapshot.branch.name,
        },
      };
    }

    // 兼容性：尝试从旧 snapshots 表获取（仅当存在时）
    const legacySnapshots = (this.prisma as any).snapshot;
    if (legacySnapshots?.findUnique) {
      const snapshot = await legacySnapshots.findUnique({
        where: { id },
        include: {
          repository: true,
        },
      });

      if (snapshot) {
        await this.checkRepositoryAccess(snapshot.repository.id, req.user.id);

        return {
          id: snapshot.id,
          repoId: snapshot.repoId,
          commitSha: snapshot.commitSha,
          status: snapshot.status,
          worktreePath: snapshot.worktreePath,
          bundlePath: snapshot.bundlePath,
          processedAt: snapshot.processedAt,
          errorMessage: snapshot.errorMessage,
          createdAt: snapshot.createdAt,
          repository: {
            id: snapshot.repository.id,
            name: snapshot.repository.name,
          },
        };
      }
    }

    throw new NotFoundException('Artifact not found');
  }

  /**
   * 查询artifact状态
   * GET /api/artifacts/:id/status
   */
  @Get(':id/status')
  async getArtifactStatus(@Param('id') id: string, @Request() req: any) {
    const artifact = await this.getArtifact(id, req);
    return {
      id: artifact.id,
      status: artifact.status,
      processedAt: artifact.processedAt,
      errorMessage: artifact.errorMessage,
    };
  }

  /**
   * 获取文件树
   * GET /api/artifacts/:id/tree
   */
  @Get(':id/tree')
  async getTree(
    @Param('id') id: string,
    @Query('path') dirPath = '',
    @Request() req: any
  ) {
    const artifact = await this.getArtifact(id, req);

    if (artifact.status !== 'READY') {
      throw new BadRequestException(
        `Artifact is not ready, current status: ${artifact.status}`
      );
    }

    if (!artifact.worktreePath) {
      throw new NotFoundException('Worktree path not available');
    }

    const root = path.resolve(artifact.worktreePath);
    const target = path.resolve(path.join(root, dirPath || '.'));

    // 安全检查
    if (!target.startsWith(root + path.sep) && target !== root) {
      throw new ForbiddenException('Invalid directory path');
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
        throw new NotFoundException('Directory not found');
      }
      throw new BadRequestException('Failed to read directory');
    }
  }

  /**
   * 读取文件内容
   * GET /api/artifacts/:id/file
   */
  @Get(':id/file')
  async getFile(
    @Param('id') id: string,
    @Query('path') filePath: string,
    @Request() req: any
  ) {
    if (!filePath) {
      throw new BadRequestException('File path is required');
    }

    const artifact = await this.getArtifact(id, req);

    if (artifact.status !== 'READY') {
      throw new BadRequestException(
        `Artifact is not ready, current status: ${artifact.status}`
      );
    }

    if (!artifact.worktreePath) {
      throw new NotFoundException('Worktree path not available');
    }

    const root = path.resolve(artifact.worktreePath);
    const target = path.resolve(path.join(root, filePath));

    // 安全检查
    if (!target.startsWith(root + path.sep)) {
      throw new ForbiddenException('Invalid file path');
    }

    try {
      const content = await fs.readFile(target, 'utf-8');
      return {
        path: filePath,
        content,
        encoding: 'utf-8',
      };
    } catch (e: any) {
      if (e?.code === 'ENOENT') {
        throw new NotFoundException('File not found');
      }
      if (e?.code === 'EISDIR') {
        throw new BadRequestException('Path is a directory, not a file');
      }
      throw new BadRequestException('Failed to read file');
    }
  }

  /**
   * 重试失败的artifact（仅管理员）
   * POST /api/artifacts/:id/retry
   */
  @Post(':id/retry')
  async retryArtifact(@Param('id') id: string, @Request() req: any) {
    const artifact = await this.getArtifact(id, req);

    // 检查是否为仓库owner或admin
    const member = await this.prisma.member.findUnique({
      where: {
        repoId_userId: {
          repoId: artifact.repoId,
          userId: req.user.id,
        },
      },
    });

    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      throw new ForbiddenException(
        'Only repository owner or admin can retry artifacts'
      );
    }

    if (artifact.status !== 'FAILED') {
      throw new BadRequestException(
        `Can only retry failed artifacts, current status: ${artifact.status}`
      );
    }

    // 重新入队
    const updated = await this.prisma.baseSnapshot.update({
      where: { id },
      data: {
        status: BaseSnapshotStatus.QUEUED,
        errorMessage: null,
        processedAt: null,
        worktreePath: null,
        bundlePath: null,
      },
    });

    // 重新推送到队列
    await this.baseSnapshotService['enqueueBaseSnapshotTask'](updated);

    return {
      id: updated.id,
      status: updated.status,
      message: 'Artifact retry initiated',
    };
  }

  /**
   * 获取或创建分支的artifact（兼容接口）
   * GET /api/repositories/:repoId/branches/:branchId/artifact
   */
  @Get('../repositories/:repoId/branches/:branchId/artifact')
  async getBranchArtifact(
    @Param('repoId') repoId: string,
    @Param('branchId') branchId: string,
    @Request() req: any
  ) {
    await this.checkRepositoryAccess(repoId, req.user.id);

    // 获取分支信息
    const branch = await this.prisma.repositoryBranch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.repoId !== repoId) {
      throw new NotFoundException('Branch not found');
    }

    // 确保artifact存在
    const artifact = await this.baseSnapshotService.ensureArtifact(
      repoId,
      branch.commitSha,
      branchId
    );

    return {
      id: artifact.id,
      status: artifact.status,
      commitSha: artifact.commitSha,
      worktreePath: artifact.worktreePath,
      processedAt: artifact.processedAt,
      errorMessage: artifact.errorMessage,
    };
  }

  /**
   * 通过 repoId + branchId 获取（或创建）artifact
   * 标准路径：GET /api/artifacts/by-branch/:repoId/:branchId
   * 便于前端稳定调用，避免相对路径的路由歧义
   */
  @Get('by-branch/:repoId/:branchId')
  async getArtifactByBranch(
    @Param('repoId') repoId: string,
    @Param('branchId') branchId: string,
    @Request() req: any
  ) {
    console.log(
      '🔍 [getArtifactByBranch] START - repoId:',
      repoId,
      'branchId:',
      branchId
    );
    console.log('🔍 [getArtifactByBranch] req.user:', req.user);

    try {
      await this.checkRepositoryAccess(repoId, req.user.id);

      const branch = await this.prisma.repositoryBranch.findUnique({
        where: { id: branchId },
      });

      if (!branch || branch.repoId !== repoId) {
        throw new NotFoundException('Branch not found');
      }

      const artifact = await this.baseSnapshotService.ensureArtifact(
        repoId,
        branch.commitSha,
        branchId
      );

      console.log('🔍 [getArtifactByBranch] SUCCESS');
      return {
        id: artifact.id,
        status: artifact.status,
        commitSha: artifact.commitSha,
        worktreePath: artifact.worktreePath,
        processedAt: artifact.processedAt,
        errorMessage: artifact.errorMessage,
      };
    } catch (error) {
      console.error('❌ [getArtifactByBranch] ERROR:', error);
      throw error;
    }
  }

  /**
   * 检查仓库访问权限
   */
  private async checkRepositoryAccess(
    repoId: string,
    userId: string
  ): Promise<void> {
    console.log(
      '🔍 [checkRepositoryAccess] repoId:',
      repoId,
      'userId:',
      userId
    );
    console.log('🔍 [checkRepositoryAccess] prisma exists:', !!this.prisma);
    console.log(
      '🔍 [checkRepositoryAccess] prisma.repository exists:',
      !!this.prisma?.repository
    );
    console.log(
      '🔍 [checkRepositoryAccess] typeof prisma.repository:',
      typeof this.prisma?.repository
    );

    const repository = await this.prisma.repository.findUnique({
      where: { id: repoId },
    });

    if (!repository) {
      throw new NotFoundException('Repository not found');
    }

    // PUBLIC: 所有人可读
    if (repository.visibility === 'PUBLIC') {
      return;
    }

    // INTERNAL: 登录用户可读
    if (repository.visibility === 'INTERNAL') {
      return; // 已通过全局 JwtAuthGuard，说明已登录
    }

    // PRIVATE: 仅成员可读
    const member = await this.prisma.member.findUnique({
      where: {
        repoId_userId: {
          repoId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }
  }
}
