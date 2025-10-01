import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JoinRequestStatus } from '@relax-git/shared/generated/prisma-client';

export class JoinRequestUserDto {
  @ApiProperty({ description: '用户ID' })
  id!: string;
  @ApiProperty({ description: '用户名' })
  username!: string;
  @ApiPropertyOptional({ description: '头像URL' })
  avatar?: string | null;
}

export class JoinRequestListItemDto {
  @ApiProperty({ description: '申请ID' })
  id!: string;
  @ApiProperty({ description: '仓库ID' })
  repoId!: string;
  @ApiProperty({ description: '申请人' })
  user!: JoinRequestUserDto;
  @ApiPropertyOptional({ description: '申请理由' })
  reason?: string | null;
  @ApiProperty({ description: '状态', enum: JoinRequestStatus })
  status!: JoinRequestStatus;
  @ApiProperty({ description: '创建时间' })
  createdAt!: Date;
  @ApiPropertyOptional({ description: '审核时间' })
  reviewedAt?: Date | null;
  @ApiPropertyOptional({ description: '审核人ID' })
  reviewedBy?: string | null;
}

export class JoinRequestListResponseDto {
  @ApiProperty({ type: [JoinRequestListItemDto] })
  items!: JoinRequestListItemDto[];
  @ApiProperty({ description: '分页信息' })
  pagination!: { page: number; limit: number; total: number; pages: number };
}
