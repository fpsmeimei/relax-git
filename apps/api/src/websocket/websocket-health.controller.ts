import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WebSocketGateway } from './websocket.gateway';

/**
 * WebSocket健康检查控制器
 * 提供WebSocket网关状态监控和性能指标查询
 */
@ApiTags('WebSocket Health')
@Controller('websocket/health')
@UseGuards(RolesGuard)
export class WebSocketHealthController {
  constructor(private readonly websocketGateway: WebSocketGateway) {}

  /**
   * 获取WebSocket网关状态
   */
  @Get('status')
  @ApiOperation({
    summary: '获取WebSocket网关状态',
    description:
      '获取WebSocket网关的实时状态信息，包括连接数、事件统计、性能指标等',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取网关状态',
    schema: {
      type: 'object',
      properties: {
        totalConnections: { type: 'number', description: '总连接数' },
        activeConnections: { type: 'number', description: '活跃连接数' },
        totalEventsSent: { type: 'number', description: '总发送事件数' },
        avgEventLatency: { type: 'number', description: '平均事件延迟(ms)' },
        cacheHitRate: { type: 'number', description: '缓存命中率(%)' },
        slowEventRate: { type: 'number', description: '慢事件率(%)' },
        uptime: { type: 'number', description: '运行时间(ms)' },
        errorCount: { type: 'number', description: '错误计数' },
        eventStats: {
          type: 'object',
          properties: {
            total: { type: 'number', description: '事件总数' },
            byType: { type: 'object', description: '按类型统计的事件数' },
            byRepository: { type: 'object', description: '按仓库统计的事件数' },
            avgLatency: { type: 'number', description: '平均延迟(ms)' },
          },
        },
        connections: {
          type: 'object',
          properties: {
            total: { type: 'number', description: '总连接数' },
            active: { type: 'number', description: '活跃连接数' },
            byUser: { type: 'object', description: '按用户统计的连接数' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '未认证',
  })
  @ApiResponse({
    status: 403,
    description: '权限不足',
  })
  getGatewayStatus() {
    return this.websocketGateway.getGatewayStatus();
  }

  /**
   * 重置WebSocket网关性能指标
   */
  @Post('reset-metrics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '重置性能指标',
    description: '重置WebSocket网关的性能指标统计（仅管理员）',
  })
  @ApiResponse({
    status: 200,
    description: '成功重置性能指标',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: '操作结果消息' },
        timestamp: { type: 'string', description: '重置时间' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '未认证',
  })
  @ApiResponse({
    status: 403,
    description: '权限不足',
  })
  resetMetrics() {
    this.websocketGateway.resetPerformanceMetrics();
    return {
      message: '性能指标已重置',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 获取WebSocket连接统计
   */
  @Get('connections')
  @ApiOperation({
    summary: '获取连接统计',
    description: '获取WebSocket连接的详细统计信息',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取连接统计',
    schema: {
      type: 'object',
      properties: {
        totalConnections: { type: 'number', description: '总连接数' },
        activeConnections: { type: 'number', description: '活跃连接数' },
        connectionStats: {
          type: 'object',
          properties: {
            byUser: { type: 'object', description: '按用户统计的连接数' },
            byRepository: { type: 'object', description: '按仓库统计的订阅数' },
          },
        },
      },
    },
  })
  getConnectionStats() {
    const status = this.websocketGateway.getGatewayStatus();
    return {
      totalConnections: status.totalConnections,
      activeConnections: status.activeConnections,
      connectionStats: {
        byUser: status.connections.byUser,
        byRepository: this.getRepositorySubscriptionStats(),
      },
    };
  }

  /**
   * 获取事件统计
   */
  @Get('events')
  @ApiOperation({
    summary: '获取事件统计',
    description: '获取WebSocket事件的详细统计信息',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取事件统计',
    schema: {
      type: 'object',
      properties: {
        totalEvents: { type: 'number', description: '总事件数' },
        avgLatency: { type: 'number', description: '平均延迟(ms)' },
        eventStats: {
          type: 'object',
          properties: {
            byType: { type: 'object', description: '按类型统计的事件数' },
            byRepository: { type: 'object', description: '按仓库统计的事件数' },
          },
        },
        performanceMetrics: {
          type: 'object',
          properties: {
            slowEventRate: { type: 'number', description: '慢事件率(%)' },
            errorRate: { type: 'number', description: '错误率(%)' },
          },
        },
      },
    },
  })
  getEventStats() {
    const status = this.websocketGateway.getGatewayStatus();
    const totalEvents = status.totalEventsSent;
    const errorRate =
      totalEvents > 0 ? (status.errorCount / totalEvents) * 100 : 0;

    return {
      totalEvents,
      avgLatency: status.eventStats.avgLatency,
      eventStats: {
        byType: status.eventStats.byType,
        byRepository: status.eventStats.byRepository,
      },
      performanceMetrics: {
        slowEventRate: status.slowEventRate,
        errorRate,
      },
    };
  }

  /**
   * 获取性能指标
   */
  @Get('performance')
  @ApiOperation({
    summary: '获取性能指标',
    description: '获取WebSocket网关的详细性能指标',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取性能指标',
    schema: {
      type: 'object',
      properties: {
        uptime: { type: 'number', description: '运行时间(ms)' },
        memoryUsage: { type: 'object', description: '内存使用情况' },
        performanceMetrics: {
          type: 'object',
          properties: {
            avgEventLatency: {
              type: 'number',
              description: '平均事件延迟(ms)',
            },
            cacheHitRate: { type: 'number', description: '缓存命中率(%)' },
            slowEventRate: { type: 'number', description: '慢事件率(%)' },
            errorCount: { type: 'number', description: '错误计数' },
          },
        },
      },
    },
  })
  getPerformanceMetrics() {
    const status = this.websocketGateway.getGatewayStatus();
    const memoryUsage = process.memoryUsage();

    return {
      uptime: status.uptime,
      memoryUsage: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      },
      performanceMetrics: {
        avgEventLatency: status.avgEventLatency,
        cacheHitRate: status.cacheHitRate,
        slowEventRate: status.slowEventRate,
        errorCount: status.errorCount,
      },
    };
  }

  /**
   * 获取仓库订阅统计
   */
  private getRepositorySubscriptionStats() {
    // 这里可以添加获取仓库订阅统计的逻辑
    // 由于WebSocketGateway的timelineSubscriptions是私有的，我们需要通过其他方式获取
    return {};
  }
}
