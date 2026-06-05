import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export enum SearchType {
  CONTENT = 'CONTENT',
  FILENAME = 'FILENAME',
  REGEX = 'REGEX',
}

export class CreateSearchDto {
  @ApiProperty({
    description: '仓库ID',
    example: 'clp1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty({ message: '仓库ID不能为空' })
  repositoryId: string;

  @ApiProperty({
    description: '快照ID（可选，不指定则搜索整个仓库）',
    example: 'clp1234567890abcdef',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '快照ID不能为空' })
  snapshotId?: string;

  @ApiProperty({
    description: '搜索关键词',
    example: 'function getUserById',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500, { message: '搜索关键词不能超过500个字符' })
  query: string;

  @ApiProperty({
    description: '搜索类型',
    enum: SearchType,
    example: SearchType.CONTENT,
    default: SearchType.CONTENT,
  })
  @IsOptional()
  @IsEnum(SearchType, { message: '搜索类型必须是 CONTENT、FILENAME 或 REGEX' })
  searchType?: SearchType = SearchType.CONTENT;

  @ApiProperty({
    description: '最大结果数量',
    example: 100,
    minimum: 1,
    maximum: 1000,
    default: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: '最大结果数量不能小于1' })
  @Max(1000, { message: '最大结果数量不能超过1000' })
  maxResults?: number = 100;
}
