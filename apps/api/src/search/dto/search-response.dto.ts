import { ApiProperty } from '@nestjs/swagger';

export enum SearchStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class SearchMatchDto {
  @ApiProperty({
    description: '文件路径',
    example: 'src/users/users.service.ts',
  })
  filePath: string;

  @ApiProperty({
    description: '行号',
    example: 42,
  })
  lineNumber: number;

  @ApiProperty({
    description: '行内容',
    example: '  async getUserById(id: string): Promise<User> {',
  })
  lineContent: string;

  @ApiProperty({
    description: '匹配开始位置',
    example: 8,
  })
  matchStart: number;

  @ApiProperty({
    description: '匹配结束位置',
    example: 19,
  })
  matchEnd: number;
}

export class SearchResponseDto {
  @ApiProperty({
    description: '搜索任务ID',
    example: 'clp1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: '搜索状态',
    enum: SearchStatus,
    example: SearchStatus.QUEUED,
  })
  status: SearchStatus;

  @ApiProperty({
    description: '预估完成时间（秒）',
    example: 30,
  })
  estimatedTime: number;

  @ApiProperty({
    description: '创建时间',
    example: '2025-09-16T12:00:00.000Z',
  })
  createdAt: string;
}

export class SearchResultDto {
  @ApiProperty({
    description: '搜索任务ID',
    example: 'clp1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: '搜索状态',
    enum: SearchStatus,
    example: SearchStatus.COMPLETED,
  })
  status: SearchStatus;

  @ApiProperty({
    description: '搜索结果',
    type: [SearchMatchDto],
  })
  results: SearchMatchDto[];

  @ApiProperty({
    description: '总匹配数量',
    example: 15,
  })
  totalMatches: number;

  @ApiProperty({
    description: '处理完成时间',
    example: '2025-09-16T12:00:30.000Z',
  })
  processedAt: string;

  @ApiProperty({
    description: '错误信息（如果失败）',
    example: null,
    required: false,
  })
  errorMessage?: string;
}
