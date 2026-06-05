import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { UpdateProxyConfigDto } from './dto/update-proxy-config.dto';
import { ProxyConfigDto } from './dto/proxy-config.dto';

@ApiTags('配置管理')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('proxy')
  @ApiOperation({ summary: '获取代理配置' })
  @ApiResponse({
    status: 200,
    description: '代理配置信息',
    type: ProxyConfigDto,
  })
  async getProxyConfig(): Promise<ProxyConfigDto> {
    return this.configService.getProxyConfig();
  }

  @Put('proxy')
  @ApiOperation({ summary: '更新代理配置' })
  @ApiResponse({
    status: 200,
    description: '代理配置已更新',
    type: ProxyConfigDto,
  })
  async updateProxyConfig(
    @Body() updateDto: UpdateProxyConfigDto
  ): Promise<ProxyConfigDto> {
    return this.configService.updateProxyConfig(updateDto);
  }
}
