import { ApiProperty } from '@nestjs/swagger';

export class RestrictedRepositoryDto {
  @ApiProperty({ description: '仓库ID' })
  id!: string;

  @ApiProperty({ description: '是否为受限访问' })
  isRestricted!: boolean;

  @ApiProperty({ description: '受限原因' })
  restrictionReason!: string;

  @ApiProperty({ description: '可见性类型' })
  visibility!: 'PUBLIC' | 'PRIVATE' | 'INTERNAL';

  @ApiProperty({ description: '创建时间' })
  createdAt!: string;
}
