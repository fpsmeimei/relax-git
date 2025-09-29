import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimelineEventType } from '@relax-git/shared/generated/prisma-client';

/**
 * 时间线统计数据DTO
 */
export class TimelineStatsDto {
  @ApiProperty({
    description: '总事件数量',
    example: 1250,
  })
  totalEvents: number;

  @ApiProperty({
    description: '今日事件数量',
    example: 45,
  })
  todayEvents: number;

  @ApiProperty({
    description: '本周事件数量',
    example: 320,
  })
  weekEvents: number;

  @ApiProperty({
    description: '本月事件数量',
    example: 890,
  })
  monthEvents: number;

  @ApiProperty({
    description: '活跃用户数量',
    example: 12,
  })
  activeUsers: number;

  @ApiProperty({
    description: '按事件类型分组的统计',
    type: 'object',
    example: {
      COMMENT_CREATED: 450,
      SNAPSHOT_CREATED: 320,
      SNAPSHOT_READY: 280,
      REPOSITORY_CREATED: 25,
    },
  })
  eventsByType: Record<TimelineEventType, number>;

  @ApiProperty({
    description: '最活跃的用户列表',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'clm0987654321fedcba' },
        username: { type: 'string', example: 'john_doe' },
        eventCount: { type: 'number', example: 125 },
      },
    },
  })
  topUsers: Array<{
    userId: string;
    username: string;
    eventCount: number;
  }>;

  @ApiPropertyOptional({
    description: '统计时间范围',
    type: 'object',
    properties: {
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
    },
  })
  timeRange?: {
    startDate: string;
    endDate: string;
  };

  @ApiProperty({
    description: '统计生成时间',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  generatedAt: string;
}

/**
 * 仓库时间线统计数据DTO
 */
export class RepositoryTimelineStatsDto {
  @ApiProperty({
    description: '仓库ID',
    example: 'clm1234567890abcdef',
  })
  repoId: string;

  @ApiProperty({
    description: '仓库名称',
    example: 'my-awesome-project',
  })
  repoName: string;

  @ApiProperty({
    description: '仓库总事件数量',
    example: 450,
  })
  totalEvents: number;

  @ApiProperty({
    description: '最近活动时间',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  lastActivity: string;

  @ApiProperty({
    description: '按事件类型分组的统计',
    type: 'object',
    example: {
      COMMENT_CREATED: 180,
      SNAPSHOT_CREATED: 120,
      SNAPSHOT_READY: 100,
      COMMENT_UPDATED: 50,
    },
  })
  eventsByType: Record<TimelineEventType, number>;

  @ApiProperty({
    description: '参与用户数量',
    example: 8,
  })
  participantCount: number;
}
