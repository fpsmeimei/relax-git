import { ApiPropertyOptional } from '@nestjs/swagger';
import { JoinRequestStatus } from '@relax-git/shared/generated/prisma-client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class QueryJoinRequestsDto {
  @ApiPropertyOptional({ description: '状态筛选', enum: JoinRequestStatus })
  @IsOptional()
  @IsEnum(JoinRequestStatus)
  status?: JoinRequestStatus;

  @ApiPropertyOptional({ description: '搜索申请人（用户名/邮箱）' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '分页大小', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}
