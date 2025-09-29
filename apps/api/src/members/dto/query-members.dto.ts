import { ApiPropertyOptional } from '@nestjs/swagger';
import { MemberRole } from '@relax-git/shared/generated/prisma-client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class QueryMembersDto {
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

  @ApiPropertyOptional({ description: '搜索关键字（用户名/邮箱）' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '角色过滤', enum: MemberRole })
  @IsOptional()
  @IsEnum(MemberRole)
  role?: MemberRole;
}
