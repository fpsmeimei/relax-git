import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateProxyConfigDto {
  @ApiProperty({
    description: 'HTTP代理地址',
    example: 'http://127.0.0.1:7899',
    required: false,
  })
  @IsOptional()
  @IsString()
  httpProxy?: string;

  @ApiProperty({
    description: 'HTTPS代理地址',
    example: 'http://127.0.0.1:7899',
    required: false,
  })
  @IsOptional()
  @IsString()
  httpsProxy?: string;

  @ApiProperty({
    description: '是否启用代理',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
