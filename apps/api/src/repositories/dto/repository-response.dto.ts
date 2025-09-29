import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RepositoryVisibility } from '@relax-git/shared/generated/prisma-client';

/**
 * 仓库响应DTO
 */
export class RepositoryResponseDto {
  @ApiProperty({
    description: '仓库ID',
    example: 'clm1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: '仓库名称',
    example: 'my-awesome-project',
  })
  name: string;

  @ApiProperty({
    description: 'Git仓库URL',
    example: 'https://github.com/user/repo.git',
  })
  gitUrl: string;

  @ApiProperty({
    description: '仓库所有者ID',
    example: 'clm1234567890abcdef',
  })
  ownerId: string;

  @ApiProperty({
    description: '默认分支名称',
    example: 'main',
  })
  defaultBranch: string;

  @ApiProperty({
    description: '仓库可见性',
    enum: RepositoryVisibility,
  })
  visibility: RepositoryVisibility;

  @ApiPropertyOptional({
    description: '社区封面图片URL',
    example: '/uploads/repositories/clm123/1710000000000.jpg',
  })
  coverImage?: string;

  @ApiPropertyOptional({
    description: '是否已发布到社区',
    example: true,
  })
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: '发布到社区的时间',
    example: '2025-08-13T10:10:00Z',
  })
  publishedAt?: string;

  @ApiPropertyOptional({
    description: '仓库描述',
    example: '这是一个很棒的项目',
  })
  description?: string;

  @ApiProperty({
    description: '是否激活',
    example: true,
  })
  isActive: boolean;

  @ApiPropertyOptional({
    description: '最后同步时间',
    example: '2025-08-13T10:30:00Z',
  })
  lastSyncAt?: string;

  @ApiProperty({
    description: '创建时间',
    example: '2025-08-13T10:00:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: '更新时间',
    example: '2025-08-13T10:30:00Z',
  })
  updatedAt: string;

  @ApiPropertyOptional({
    description: '仓库所有者信息',
  })
  owner?: {
    id: string;
    username: string;
    email: string;
  };
}

/**
 * 仓库列表响应DTO
 */
export class RepositoryListResponseDto {
  @ApiProperty({
    description: '仓库列表',
    type: [RepositoryResponseDto],
  })
  repositories: RepositoryResponseDto[];

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
 * Git验证响应DTO
 */
export class GitValidationResponseDto {
  @ApiProperty({
    description: '验证是否成功',
    example: true,
  })
  isValid: boolean;

  @ApiPropertyOptional({
    description: '错误信息',
    example: '无法连接到Git仓库',
  })
  error?: string;

  @ApiPropertyOptional({
    description: '检测到的分支列表',
    example: ['main', 'develop', 'feature/auth'],
  })
  branches?: string[];

  @ApiPropertyOptional({
    description: '默认分支',
    example: 'main',
  })
  defaultBranch?: string;
}
