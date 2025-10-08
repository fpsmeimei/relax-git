import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator';

/**
 * 应用根控制器
 * 处理根路径请求和基本信息
 */
@ApiTags('app')
@Controller()
@Public()
export class AppController {
  @Get()
  @ApiOperation({ summary: '应用基本信息' })
  @ApiResponse({ status: 200, description: '应用运行状态' })
  getAppInfo() {
    return {
      name: 'Relax-Git API',
      version: '0.1.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      docs: '/api/docs',
      health: '/health',
    };
  }
}
