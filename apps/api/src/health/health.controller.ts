import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { HealthService } from './health.service';

/**
 * 健康检查控制器
 */
@ApiTags('health')
@Controller('api/health')
@Public()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: '系统健康检查' })
  @ApiResponse({ status: 200, description: '系统健康状态' })
  async check() {
    return await this.healthService.check();
  }

  @Get('database')
  @ApiOperation({ summary: '数据库健康检查' })
  @ApiResponse({ status: 200, description: '数据库健康状态' })
  async checkDatabase() {
    return await this.healthService.checkDatabase();
  }

  @Get('redis')
  @ApiOperation({ summary: 'Redis 健康检查' })
  @ApiResponse({ status: 200, description: 'Redis 健康状态' })
  async checkRedis() {
    return await this.healthService.checkRedis();
  }

  @Get('stats')
  @ApiOperation({ summary: '系统统计信息' })
  @ApiResponse({ status: 200, description: '系统统计数据' })
  async getStats() {
    return await this.healthService.getStats();
  }
}
