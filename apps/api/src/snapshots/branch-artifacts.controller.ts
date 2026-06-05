import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Request,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { BaseSnapshotService } from './base-snapshot.service';

@Controller('api/repositories')
export class BranchArtifactsController {
  constructor(
    private readonly baseSnapshotService: BaseSnapshotService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * 获取或创建分支的 artifact（旧前端兼容接口）
   * GET /api/repositories/:repoId/branches/:branchId/artifact
   */
  @Get(':repoId/branches/:branchId/artifact')
  async getBranchArtifact(
    @Param('repoId') repoId: string,
    @Param('branchId') branchId: string,
    @Request() req: any
  ) {
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

    return {
      id: artifact.id,
      status: artifact.status,
      commitSha: artifact.commitSha,
      processedAt: artifact.processedAt,
      errorMessage: artifact.errorMessage,
    };
  }

  private async checkRepositoryAccess(
    repoId: string,
    userId: string
  ): Promise<void> {
    const repository = await this.prisma.repository.findUnique({
      where: { id: repoId },
    });

    if (!repository) {
      throw new NotFoundException('Repository not found');
    }

    if (
      repository.visibility === 'PUBLIC' ||
      repository.visibility === 'INTERNAL'
    ) {
      return;
    }

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
