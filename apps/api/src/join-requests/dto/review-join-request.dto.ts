import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewJoinRequestDto {
  @ApiProperty({ description: '是否通过' })
  @IsBoolean()
  approve!: boolean;

  @ApiPropertyOptional({ description: '审批备注', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
