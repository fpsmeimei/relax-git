import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { UpdateProxyConfigDto } from './dto/update-proxy-config.dto';
import { ProxyConfigDto } from './dto/proxy-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('配置管理')
@Controller('config')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
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
