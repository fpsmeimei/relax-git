import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator';
/**
 * 应用根控制器
 * 处理根路径请求和基本信息
 */
@ApiTags('app')
@Controller('api')
@Public()
export class AppController {
  @Get('info')
  @ApiOperation({ summary: '应用基本信息' })
  @ApiResponse({ status: 200, description: '应用运行状态' })
  getInfo(): any {
    return {
      service: 'relax-git-api',
      version: '0.1.1',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }
}
