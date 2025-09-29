import { ApiProperty } from '@nestjs/swagger';

export class ProxyConfigDto {
  @ApiProperty({
    description: 'HTTP代理地址',
    example: 'http://127.0.0.1:7899',
  })
  httpProxy: string;

  @ApiProperty({
    description: 'HTTPS代理地址',
    example: 'http://127.0.0.1:7899',
  })
  httpsProxy: string;

  @ApiProperty({ description: '是否启用代理', example: true })
  enabled: boolean;
}
