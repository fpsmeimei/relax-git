import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimelineEventType } from '@relax-git/shared/generated/prisma-client';

/**
 * 时间线事件响应DTO
 */
export class TimelineEventResponseDto {
  @ApiProperty({
    description: '事件ID',
    example: 'clm1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: '仓库ID',
    example: 'clm1234567890abcdef',
  })
  repoId: string;

  @ApiProperty({
    description: '事件类型',
    enum: TimelineEventType,
    example: TimelineEventType.COMMENT_CREATED,
  })
  type: TimelineEventType;

  @ApiProperty({
    description: '操作者ID',
    example: 'clm0987654321fedcba',
  })
  actorId: string;

  @ApiPropertyOptional({
    description: '快照ID（可选）',
    example: 'clm0987654321fedcba',
  })
  snapshotId?: string;

  @ApiPropertyOptional({
    description: '评论ID（可选）',
    example: 'clm0987654321fedcba',
  })
  commentId?: string;

  @ApiProperty({
    description: '事件载荷数据',
    example: {
      commitSha: 'abc123def456',
      branchName: 'feature/new-feature',
      title: '新功能快照',
    },
  })
  payload: Record<string, unknown>;

  @ApiProperty({
    description: '创建时间',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  createdAt: string;

  @ApiPropertyOptional({
    description: '操作者信息',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'clm0987654321fedcba' },
      username: { type: 'string', example: 'john_doe' },
      email: { type: 'string', example: 'john@example.com' },
      avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
    },
  })
  actor?: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  };

  @ApiPropertyOptional({
    description: '仓库信息',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'clm1234567890abcdef' },
      name: { type: 'string', example: 'my-awesome-project' },
    },
  })
  repository?: {
    id: string;
    name: string;
  };
}

/**
 * 时间线事件列表响应DTO
 */
export class TimelineEventsListResponseDto {
  @ApiProperty({
    description: '时间线事件列表',
    type: [TimelineEventResponseDto],
  })
  events: TimelineEventResponseDto[];

  @ApiProperty({
    description: '总数量',
    example: 150,
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
