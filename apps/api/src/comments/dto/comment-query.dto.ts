import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  CommentAnchorType,
  CommentStatus,
} from '@relax-git/shared/generated/prisma-client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * 评论查询参数DTO
 */
export class CommentQueryDto {
  @ApiPropertyOptional({
    description: '页码',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于0' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须大于0' })
  @Max(100, { message: '每页数量不能超过100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: '快照ID过滤（字符串ID，支持 CUID/UUID 等）',
    example: 'cmfxxyb55000410zjanfewcw1',
  })
  @IsOptional()
  @IsString()
  snapshotId?: string;

  @ApiPropertyOptional({
    description: 'Diff ID 过滤（按对比聚合两个快照的评论）',
    example: 'clmdiff1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  diffId?: string;

  @ApiPropertyOptional({
    description: '评论状态过滤',
    enum: CommentStatus,
    example: CommentStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(CommentStatus, { message: '评论状态无效' })
  status?: CommentStatus;

  @ApiPropertyOptional({
    description: '锚点类型过滤',
    enum: CommentAnchorType,
    example: CommentAnchorType.LINE,
  })
  @IsOptional()
  @IsEnum(CommentAnchorType, { message: '锚点类型无效' })
  anchorType?: CommentAnchorType;

  @ApiPropertyOptional({
    description: '作者ID过滤（字符串ID，支持 CUID/UUID 等）',
    example: 'cmfxtqlp5000010zjyo8r8msb',
  })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({
    description: '父评论ID过滤（获取回复）—字符串ID（支持 CUID/UUID 等）',
    example: 'cmfxparent000410zjanfewcw1',
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({
    description: '是否只显示已解决的评论',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  isResolved?: boolean;

  @ApiPropertyOptional({
    description: '文件路径过滤',
    example: 'src/components/Button.tsx',
  })
  @IsOptional()
  @IsString()
  filePath?: string;

  @ApiPropertyOptional({
    description: '仅返回该时间点之后创建的评论（增量拉取，ISO 8601）',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  since?: string;

  @ApiPropertyOptional({
    description: '仓库ID过滤（项目级评论聚合）—字符串ID（支持 CUID/UUID 等）',
    example: 'cmfxxyagj000210zjj8yvjn8e',
  })
  @IsOptional()
  @IsString()
  repoId?: string;
}
