import { ApiProperty } from '@nestjs/swagger';

export class ReviewJoinRequestResponseDto {
  @ApiProperty({ description: '状态', enum: ['approved', 'rejected'] })
  status!: 'approved' | 'rejected';
}
