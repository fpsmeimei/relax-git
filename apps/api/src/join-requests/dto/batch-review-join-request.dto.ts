import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';

export class BatchReviewJoinRequestDto {
  @ApiProperty({ description: '申请ID列表', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids!: string[];

  @ApiProperty({ description: '是否通过' })
  @IsBoolean()
  approve!: boolean;

  @ApiPropertyOptional({ description: '审批备注', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class BatchReviewJoinRequestResponseDto {
  @ApiProperty({ description: '成功处理的申请数量' })
  successCount!: number;

  @ApiProperty({ description: '跳过的申请数量（已处理过的）' })
  skippedCount!: number;

  @ApiProperty({ description: '失败的申请数量' })
  failedCount!: number;

  @ApiProperty({ description: '处理结果详情', type: [Object] })
  details!: Array<{
    id: string;
    status: 'success' | 'skipped' | 'failed';
    message?: string;
  }>;
}
