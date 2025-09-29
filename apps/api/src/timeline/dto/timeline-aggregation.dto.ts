import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { TimelineEventType } from '@relax-git/shared/generated/prisma-client';

/**
 * 时间线聚合周期枚举
 */
export enum AggregationPeriod {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

/**
 * 时间线聚合查询参数DTO
 */
export class TimelineAggregationQueryDto {
  @ApiProperty({
    description: '聚合周期',
    enum: AggregationPeriod,
    example: AggregationPeriod.DAY,
  })
  @IsEnum(AggregationPeriod, { message: '聚合周期无效' })
  period: AggregationPeriod;

  @ApiPropertyOptional({
    description: '事件类型过滤',
    enum: TimelineEventType,
    example: TimelineEventType.COMMENT_CREATED,
  })
  @IsOptional()
  @IsEnum(TimelineEventType, { message: '事件类型无效' })
  type?: TimelineEventType;
}

/**
 * 时间线聚合数据点DTO
 */
export class TimelineAggregationDataPointDto {
  @ApiProperty({
    description: '时间周期标识',
    example: '2024-01-15',
  })
  period: string;

  @ApiProperty({
    description: '事件数量',
    example: 25,
  })
  count: number;

  @ApiPropertyOptional({
    description: '事件类型',
    enum: TimelineEventType,
    example: TimelineEventType.COMMENT_CREATED,
  })
  type?: TimelineEventType;

  @ApiProperty({
    description: '周期开始时间',
    example: '2024-01-15T00:00:00.000Z',
    format: 'date-time',
  })
  startTime: string;

  @ApiProperty({
    description: '周期结束时间',
    example: '2024-01-15T23:59:59.999Z',
    format: 'date-time',
  })
  endTime: string;
}

/**
 * 时间线聚合响应DTO
 */
export class TimelineAggregationResponseDto {
  @ApiProperty({
    description: '聚合周期',
    enum: AggregationPeriod,
    example: AggregationPeriod.DAY,
  })
  period: AggregationPeriod;

  @ApiProperty({
    description: '聚合数据点列表',
    type: [TimelineAggregationDataPointDto],
  })
  data: TimelineAggregationDataPointDto[];

  @ApiProperty({
    description: '总数据点数量',
    example: 30,
  })
  totalDataPoints: number;

  @ApiProperty({
    description: '总事件数量',
    example: 750,
  })
  totalEvents: number;

  @ApiPropertyOptional({
    description: '过滤的事件类型',
    enum: TimelineEventType,
    example: TimelineEventType.COMMENT_CREATED,
  })
  filteredType?: TimelineEventType;

  @ApiProperty({
    description: '数据时间范围',
    type: 'object',
    properties: {
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
    },
  })
  timeRange: {
    startDate: string;
    endDate: string;
  };

  @ApiProperty({
    description: '聚合数据生成时间',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  generatedAt: string;
}

/**
 * 时间线热力图数据DTO
 */
export class TimelineHeatmapDto {
  @ApiProperty({
    description: '日期（YYYY-MM-DD格式）',
    example: '2024-01-15',
  })
  date: string;

  @ApiProperty({
    description: '事件数量',
    example: 12,
  })
  count: number;

  @ApiProperty({
    description: '活跃度等级（0-4）',
    example: 3,
    minimum: 0,
    maximum: 4,
  })
  level: number;
}
