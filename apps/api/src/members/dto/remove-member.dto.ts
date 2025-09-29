import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RemoveMemberDto {
  @ApiProperty({ description: '用户ID' })
  @IsString()
  userId!: string;
}
