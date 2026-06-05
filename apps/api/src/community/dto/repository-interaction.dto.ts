import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

/**
 * 仓库点赞响应DTO
 */
export class RepositoryLikeResponseDto {
  @ApiProperty({ description: '是否已点赞' })
  isLiked: boolean;

  @ApiProperty({ description: '总点赞数' })
  likesCount: number;
}

/**
 * 仓库收藏响应DTO
 */
export class RepositoryCollectionResponseDto {
  @ApiProperty({ description: '是否已收藏' })
  isCollected: boolean;

  @ApiProperty({ description: '总收藏数' })
  collectionsCount: number;
}

/**
 * 创建仓库评论DTO
 */
export class CreateRepositoryInteractionCommentDto {
  @ApiProperty({ description: '评论内容', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiProperty({ description: '父评论ID（回复时使用）', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;
}

/**
 * 更新仓库评论DTO
 */
export class UpdateRepositoryCommentDto {
  @ApiProperty({ description: '评论内容', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}

/**
 * 仓库评论响应DTO
 */
export class RepositoryCommentDto {
  @ApiProperty({ description: '评论ID' })
  id: string;

  @ApiProperty({ description: '评论内容' })
  content: string;

  @ApiProperty({ description: '点赞数' })
  likesCount: number;

  @ApiProperty({ description: '当前用户是否已点赞' })
  isLiked: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  @ApiProperty({ description: '作者信息' })
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };

  @ApiProperty({ description: '父评论ID', required: false })
  parentId?: string | null;

  @ApiProperty({
    description: '回复列表',
    type: [RepositoryCommentDto],
    required: false,
  })
  replies?: RepositoryCommentDto[];
}

/**
 * 仓库评论列表响应DTO
 */
export class RepositoryCommentsResponseDto {
  @ApiProperty({ description: '评论列表', type: [RepositoryCommentDto] })
  comments: RepositoryCommentDto[];

  @ApiProperty({ description: '总评论数' })
  total: number;

  @ApiProperty({ description: '下一页游标', required: false })
  nextCursor?: string | null;

  @ApiProperty({ description: '是否有更多数据' })
  hasMore: boolean;
}
