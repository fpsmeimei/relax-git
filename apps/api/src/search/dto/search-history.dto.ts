import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { SearchType } from './create-search.dto';

export class QuerySearchHistoryDto {
  @ApiProperty({
    description: '仓库ID（可选，筛选特定仓库的搜索历史）',
    example: 'clp1234567890abcdef',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  repositoryId?: string;

  @ApiProperty({
    description: '页码',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class SearchHistoryItemDto {
  @ApiProperty({
    description: '搜索历史ID',
    example: 'clp1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: '搜索关键词',
    example: 'function getUserById',
  })
  query: string;

  @ApiProperty({
    description: '搜索类型',
    enum: SearchType,
    example: SearchType.CONTENT,
  })
  searchType: SearchType;

  @ApiProperty({
    description: '结果数量',
    example: 15,
  })
  resultsCount: number;

  @ApiProperty({
    description: '仓库信息',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'clp1234567890abcdef' },
      name: { type: 'string', example: 'my-project' },
    },
  })
  repository: {
    id: string;
    name: string;
  };

  @ApiProperty({
    description: '快照信息（如果指定了快照）',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'clp1234567890abcdef' },
      title: { type: 'string', example: '初始快照' },
    },
    required: false,
  })
  snapshot?: {
    id: string;
    title: string;
  };

  @ApiProperty({
    description: '创建时间',
    example: '2025-09-16T12:00:00.000Z',
  })
  createdAt: string;
}

export class SearchHistoryResponseDto {
  @ApiProperty({
    description: '搜索历史列表',
    type: [SearchHistoryItemDto],
  })
  history: SearchHistoryItemDto[];

  @ApiProperty({
    description: '总数量',
    example: 50,
  })
  total: number;

  @ApiProperty({
    description: '当前页码',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '每页数量',
    example: 20,
  })
  limit: number;
}
