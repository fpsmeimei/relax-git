import { ApiPropertyOptional } from '@nestjs/swagger';
import { TimelineEventType } from '@relax-git/shared/generated/prisma-client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

/**
 * 时间线事件查询参数DTO
 */
export class TimelineQueryDto {
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
    description: '仓库ID过滤',
    example: 'clm1234567890abcdef',
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  @IsUUID(4, { message: '仓库ID必须是有效的UUID格式' })
  repoId?: string;

  @ApiPropertyOptional({
    description: '事件类型过滤',
    enum: TimelineEventType,
    example: TimelineEventType.COMMENT_CREATED,
  })
  @IsOptional()
  @IsEnum(TimelineEventType, { message: '事件类型无效' })
  type?: TimelineEventType;

  @ApiPropertyOptional({
    description: '操作者ID过滤',
    example: 'clm0987654321fedcba',
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  @IsUUID(4, { message: '操作者ID必须是有效的UUID格式' })
  actorId?: string;

  @ApiPropertyOptional({
    description: '快照ID过滤',
    example: 'clm0987654321fedcba',
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  @IsUUID(4, { message: '快照ID必须是有效的UUID格式' })
  snapshotId?: string;

  @ApiPropertyOptional({
    description: '评论ID过滤',
    example: 'clm0987654321fedcba',
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  @IsUUID(4, { message: '评论ID必须是有效的UUID格式' })
  commentId?: string;

  @ApiPropertyOptional({
    description: '开始时间过滤（ISO 8601格式）',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString({}, { message: '开始时间必须是有效的ISO 8601格式' })
  startDate?: string;

  @ApiPropertyOptional({
    description: '结束时间过滤（ISO 8601格式）',
    example: '2024-12-31T23:59:59.999Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString({}, { message: '结束时间必须是有效的ISO 8601格式' })
  endDate?: string;
}
