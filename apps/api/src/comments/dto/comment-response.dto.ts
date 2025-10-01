import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CommentAnchorType,
  CommentStatus,
} from '@relax-git/shared/generated/prisma-client';

/**
 * 评论作者信息DTO
 */
export class CommentAuthorDto {
  @ApiProperty({
    description: '用户ID',
    example: 'clm0987654321fedcba',
  })
  id: string;

  @ApiProperty({
    description: '用户名',
    example: 'john_doe',
  })
  username: string;

  @ApiPropertyOptional({
    description: '头像URL',
    example: 'https://example.com/avatar.jpg',
  })
  avatar?: string;
}

/**
 * 评论响应DTO
 */
export class CommentResponseDto {
  @ApiProperty({
    description: '评论ID',
    example: 'clm1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: '快照ID',
    example: 'clm1234567890abcdef',
  })
  snapshotId: string;

  @ApiProperty({
    description: '作者ID',
    example: 'clm0987654321fedcba',
  })
  authorId: string;

  @ApiProperty({
    description: '评论内容（Markdown格式）',
    example: '这个实现看起来不错，但是建议添加错误处理。',
  })
  content: string;

  @ApiProperty({
    description: '锚点类型',
    enum: CommentAnchorType,
    example: CommentAnchorType.LINE,
  })
  anchorType: CommentAnchorType;

  @ApiPropertyOptional({
    description: 'Git提交SHA',
    example: 'a1b2c3d4e5f6789012345678901234567890abcd',
  })
  commitSha?: string;

  @ApiPropertyOptional({
    description: '文件路径',
    example: 'src/components/Button.tsx',
  })
  filePath?: string;

  @ApiPropertyOptional({
    description: '行级锚点开始行号',
    example: 15,
  })
  lineStart?: number;

  @ApiPropertyOptional({
    description: '行级锚点结束行号',
    example: 20,
  })
  lineEnd?: number;

  @ApiProperty({
    description: '评论状态',
    enum: CommentStatus,
    example: CommentStatus.PUBLISHED,
  })
  status: CommentStatus;

  @ApiPropertyOptional({
    description: '父评论ID',
    example: 'clm0987654321fedcba',
  })
  parentId?: string;

  @ApiProperty({
    description: '是否已解决',
    example: false,
  })
  isResolved: boolean;

  @ApiPropertyOptional({
    description: '解决时间',
    example: '2024-01-15T10:30:00.000Z',
  })
  resolvedAt?: string;

  @ApiPropertyOptional({
    description: '解决者ID',
    example: 'clm0987654321fedcba',
  })
  resolvedBy?: string;

  @ApiProperty({
    description: '创建时间',
    example: '2024-01-15T10:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: '更新时间',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: string;

  @ApiPropertyOptional({
    description: '作者信息',
    type: CommentAuthorDto,
  })
  author?: CommentAuthorDto;

  @ApiPropertyOptional({
    description: '回复数量',
    example: 3,
  })
  repliesCount?: number;

  @ApiPropertyOptional({
    description: '回复评论列表',
    type: [CommentResponseDto],
  })
  replies?: CommentResponseDto[];

  @ApiPropertyOptional({
    description: '点赞数量',
    example: 5,
  })
  likesCount?: number;

  @ApiPropertyOptional({
    description: '当前用户是否已点赞',
    example: false,
  })
  liked?: boolean;
}
