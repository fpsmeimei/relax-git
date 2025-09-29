import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { CommentStatus } from '@relax-git/shared/generated/prisma-client';

/**
 * 更新评论请求DTO
 */
export class UpdateCommentDto {
  @ApiPropertyOptional({
    description: '评论内容（支持Markdown格式）',
    example: '这个实现看起来不错，但是建议添加错误处理。已更新内容。',
    minLength: 1,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @Length(1, 2000, { message: '评论内容长度必须在1-2000字符之间' })
  @Transform(({ value }) => value?.trim())
  content?: string;

  @ApiPropertyOptional({
    description: '评论状态',
    enum: CommentStatus,
    example: CommentStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(CommentStatus, { message: '评论状态无效' })
  status?: CommentStatus;

  @ApiPropertyOptional({
    description: '是否已解决',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: '解决状态必须是布尔值' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  isResolved?: boolean;
}
