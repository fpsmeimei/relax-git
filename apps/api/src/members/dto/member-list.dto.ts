import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MemberRole } from '@relax-git/shared/generated/prisma-client';

export class MemberUserDto {
  @ApiProperty({ description: '用户ID' })
  id!: string;
  @ApiProperty({ description: '用户名' })
  username!: string;
  @ApiProperty({ description: '邮箱' })
  email!: string;
  @ApiPropertyOptional({ description: '头像URL' })
  avatar?: string | null;
}

export class MemberListItemDto {
  @ApiProperty({ description: '用户信息' })
  user!: MemberUserDto;
  @ApiProperty({ description: '成员角色', enum: MemberRole })
  role!: MemberRole;
  @ApiProperty({ description: '加入时间' })
  createdAt!: Date;
}

export class MemberListResponseDto {
  @ApiProperty({ type: [MemberListItemDto] })
  items!: MemberListItemDto[];
  @ApiProperty({ description: '分页信息' })
  pagination!: { page: number; limit: number; total: number; pages: number };
}
