import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJoinRequestResponseDto {
  @ApiProperty({ description: '状态', enum: ['member', 'pending'] })
  status!: 'member' | 'pending';

  @ApiPropertyOptional({ description: '申请ID（当 status=pending 时返回）' })
  id?: string;
}
