import { IsString, Length, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * 创建仓库评论请求DTO
 */
export class CreateRepositoryCommentDto {
  @ApiProperty({
    description: '评论内容（支持Markdown格式）',
    example: '这个项目很棒！代码结构清晰，文档也很完善。',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @Length(1, 2000, { message: '评论内容长度必须在1-2000字符之间' })
  @Transform(({ value }) => value?.trim())
  content: string;

  @ApiPropertyOptional({
    description: '父评论ID（回复评论时必需）',
    example: 'clm0987654321fedcba',
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({
    description: '被回复的用户ID（用于正确显示回复关系）',
    example: 'clm1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  replyToUserId?: string;
}

/**
 * 仓库评论查询DTO
 */
export class RepositoryCommentQueryDto {
  @ApiPropertyOptional({
    description: '分页游标',
    example: 'clm1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: '每页数量，默认20，最大100',
    example: 20,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number;

  @ApiPropertyOptional({
    description: '排序方式',
    enum: ['latest', 'oldest', 'popular'],
    example: 'latest',
  })
  @IsOptional()
  @IsString()
  sort?: 'latest' | 'oldest' | 'popular';
}
