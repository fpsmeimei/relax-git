import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseSnapshotStatus } from '@relax-git/shared/generated/prisma-client';

/**
 * 快照响应DTO
 */
export class SnapshotResponseDto {
  @ApiProperty({
    description: '快照ID',
    example: 'clm1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: '仓库ID',
    example: 'clm1234567890abcdef',
  })
  repoId: string;

  @ApiProperty({
    description: '所有者ID',
    example: 'clm1234567890abcdef',
  })
  ownerId: string;

  @ApiProperty({
    description: 'Git提交SHA',
    example: 'a1b2c3d4e5f6789012345678901234567890abcd',
  })
  commitSha: string;

  @ApiProperty({
    description: '分支名称',
    example: 'main',
  })
  branchName: string;

  @ApiProperty({
    description: '快照状态',
    enum: BaseSnapshotStatus,
    example: BaseSnapshotStatus.READY,
  })
  status: BaseSnapshotStatus;

  @ApiPropertyOptional({
    description: '快照标题',
    example: '新功能开发快照',
  })
  title?: string;

  @ApiPropertyOptional({
    description: '快照描述',
    example: '这是一个包含新用户界面功能的开发快照',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Worktree路径',
    example: '/tmp/relax-git-worktrees/snapshot-123',
  })
  worktreePath?: string;

  @ApiPropertyOptional({
    description: 'Bundle路径',
    example: '/tmp/relax-git-bundles/snapshot-123.bundle',
  })
  bundlePath?: string;

  @ApiProperty({
    description: '过期时间',
    example: '2025-08-20T10:30:00Z',
  })
  expiresAt: string;

  @ApiPropertyOptional({
    description: '处理完成时间',
    example: '2025-08-13T10:35:00Z',
  })
  processedAt?: string;

  @ApiPropertyOptional({
    description: '错误信息',
    example: 'Git仓库克隆失败',
  })
  errorMessage?: string;

  @ApiProperty({
    description: '创建时间',
    example: '2025-08-13T10:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: '更新时间',
    example: '2025-08-13T10:35:00Z',
  })
  updatedAt: string;

  @ApiPropertyOptional({
    description: '关联仓库信息',
  })
  repository?: {
    id: string;
    name: string;
    gitUrl: string;
    visibility: string;
    owner?: {
      id: string;
      username: string;
      email: string;
    };
  };

  @ApiPropertyOptional({
    description: '快照所有者信息',
  })
  owner?: {
    id: string;
    username: string;
    email: string;
  };
}

/**
 * 快照列表响应DTO
 */
export class SnapshotListResponseDto {
  @ApiProperty({
    description: '快照列表',
    type: [SnapshotResponseDto],
  })
  snapshots: SnapshotResponseDto[];

  @ApiProperty({
    description: '总数量',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: '当前页码',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '每页数量',
    example: 10,
  })
  limit: number;
}

/**
 * 快照状态响应DTO
 */
export class SnapshotStatusResponseDto {
  @ApiProperty({
    description: '快照ID',
    example: 'clm1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: '快照状态',
    enum: BaseSnapshotStatus,
    example: BaseSnapshotStatus.PROCESSING,
  })
  status: BaseSnapshotStatus;

  @ApiPropertyOptional({
    description: '进度百分比',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  progress?: number;

  @ApiPropertyOptional({
    description: '预估剩余时间（秒）',
    example: 30,
  })
  estimatedTimeRemaining?: number;

  @ApiPropertyOptional({
    description: '错误信息',
    example: 'Git仓库克隆失败',
  })
  errorMessage?: string;

  @ApiProperty({
    description: '状态更新时间',
    example: '2025-08-13T10:35:00Z',
  })
  updatedAt: string;
}
