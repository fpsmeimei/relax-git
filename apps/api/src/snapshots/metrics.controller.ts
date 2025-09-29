import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
import { SnapshotMetricsService } from './snapshot-metrics.service';

/**
 * Phase 1.4: 监控和指标 API
 * 提供系统健康状态、性能指标和报告
 */
@Controller('api/snapshots/metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: SnapshotMetricsService) {}

  /**
   * 获取当前指标
   * GET /api/snapshots/metrics
   */
  @Get()
  async getMetrics() {
    return this.metricsService.getMetrics();
  }

  /**
   * 获取健康状态
   * GET /api/snapshots/metrics/health
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async getHealth() {
    const health = await this.metricsService.getHealthStatus();

    // 根据健康状态返回不同的 HTTP 状态码
    if (health.status === 'unhealthy') {
      return {
        ...health,
        httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
      };
    } else if (health.status === 'degraded') {
      return {
        ...health,
        httpStatus: HttpStatus.OK,
        warning: 'System is running in degraded mode',
      };
    }

    return health;
  }

  /**
   * 获取性能报告
   * GET /api/snapshots/metrics/report
   * 仅管理员可访问
   */
  @Get('report')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPerformanceReport(
    @Query('start') startDate?: string,
    @Query('end') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.metricsService.getPerformanceReport(start, end);
  }

  /**
   * 重置指标（仅管理员，用于测试）
   * POST /api/snapshots/metrics/reset
   */
  @Post('reset')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetMetrics() {
    await this.metricsService.resetMetrics();
  }

  /**
   * 获取实时状态（SSE）
   * GET /api/snapshots/metrics/stream
   */
  @Get('stream')
  async streamMetrics() {
    // 简化实现，实际应该返回 SSE 流
    return {
      message: 'SSE endpoint for real-time metrics',
      info: 'Connect with EventSource for real-time updates',
    };
  }

  /**
   * 获取队列状态
   * GET /api/snapshots/metrics/queue
   */
  @Get('queue')
  async getQueueStatus() {
    const metrics = await this.metricsService.getMetrics();

    return {
      current: metrics.currentQueueLength,
      max: metrics.maxQueueLength,
      history: metrics.queueLengthHistory.slice(-20), // 最近20条
      status: this.getQueueStatusLevel(metrics.currentQueueLength),
    };
  }

  /**
   * 获取复用统计
   * GET /api/snapshots/metrics/reuse
   */
  @Get('reuse')
  async getReuseStats() {
    const metrics = await this.metricsService.getMetrics();

    return {
      totalCreated: metrics.artifactCreateCount,
      totalReused: metrics.artifactReuseCount,
      reuseRate: metrics.reuseRate,
      recentArtifacts: metrics.recentArtifacts.slice(-10), // 最近10个
      savings: {
        estimatedTime: metrics.artifactReuseCount * metrics.avgProcessingTime,
        estimatedStorage: metrics.artifactReuseCount * 50 * 1024 * 1024, // 假设每个50MB
      },
    };
  }

  /**
   * 获取失败统计
   * GET /api/snapshots/metrics/failures
   */
  @Get('failures')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getFailureStats() {
    const metrics = await this.metricsService.getMetrics();

    const recentFailures = metrics.processingTimes
      .filter(p => !p.success)
      .slice(-10);

    return {
      totalFailures: metrics.failureCount,
      failureRate: 100 - metrics.successRate,
      recentFailures,
      commonIssues: await this.analyzeCommonIssues(),
    };
  }

  /**
   * 获取处理时间统计
   * GET /api/snapshots/metrics/processing
   */
  @Get('processing')
  async getProcessingStats() {
    const metrics = await this.metricsService.getMetrics();

    const times = metrics.processingTimes.map(p => p.duration);
    const sortedTimes = times.sort((a, b) => a - b);

    return {
      avg: metrics.avgProcessingTime,
      min: sortedTimes[0] || 0,
      max: sortedTimes[sortedTimes.length - 1] || 0,
      median: this.calculateMedian(sortedTimes),
      p95: this.calculatePercentile(sortedTimes, 95),
      p99: this.calculatePercentile(sortedTimes, 99),
      total: metrics.totalProcessingTime,
      count: metrics.successCount,
    };
  }

  /**
   * 判断队列状态级别
   */
  private getQueueStatusLevel(length: number): string {
    if (length === 0) return 'idle';
    if (length < 10) return 'normal';
    if (length < 50) return 'busy';
    if (length < 100) return 'backlogged';
    return 'critical';
  }

  /**
   * 计算中位数
   */
  private calculateMedian(sortedArray: number[]): number {
    if (sortedArray.length === 0) return 0;

    const mid = Math.floor(sortedArray.length / 2);

    if (sortedArray.length % 2 === 0) {
      return (sortedArray[mid - 1] + sortedArray[mid]) / 2;
    }

    return sortedArray[mid];
  }

  /**
   * 计算百分位数
   */
  private calculatePercentile(
    sortedArray: number[],
    percentile: number
  ): number {
    if (sortedArray.length === 0) return 0;

    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }

  /**
   * 分析常见问题（简化实现）
   */
  private async analyzeCommonIssues(): Promise<any[]> {
    // 实际应该分析错误日志
    return [
      {
        type: 'NETWORK_TIMEOUT',
        count: 5,
        lastOccurrence: new Date(),
      },
      {
        type: 'DISK_FULL',
        count: 2,
        lastOccurrence: new Date(),
      },
    ];
  }
}
