import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '@relax-git/shared/generated/prisma-client';
import { IsEnum } from 'class-validator';

export class UpdateMemberRoleDto {
  @ApiProperty({ description: '成员角色', enum: MemberRole })
  @IsEnum(MemberRole)
  role!: MemberRole;
}
