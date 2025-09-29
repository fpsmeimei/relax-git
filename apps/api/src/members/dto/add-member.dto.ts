import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '@relax-git/shared/generated/prisma-client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ description: '用户ID' })
  @IsString()
  userId!: string;

  @ApiProperty({ description: '成员角色', enum: MemberRole, required: false })
  @IsOptional()
  @IsEnum(MemberRole)
  role?: MemberRole;
}
