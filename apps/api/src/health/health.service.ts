import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';

/**
 * 健康检查服务
 */
@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  /**
   * 综合健康检查
   */
  async check() {
    const startTime = Date.now();

    const [databaseHealth, redisHealth] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const responseTime = Date.now() - startTime;
    const isHealthy = databaseHealth.healthy && redisHealth.healthy;

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        database: databaseHealth,
        redis: redisHealth,
      },
      version: '0.1.0',
      environment: process.env['NODE_ENV'] ?? 'development',
    };
  }

  /**
   * 数据库健康检查
   */
  async checkDatabase() {
    try {
      const startTime = Date.now();
      const isHealthy = await this.prisma.healthCheck();
      const responseTime = Date.now() - startTime;

      if (isHealthy) {
        const stats = await this.prisma.getStats();
        return {
          healthy: true,
          responseTime: `${responseTime}ms`,
          stats,
        };
      } else {
        return {
          healthy: false,
          responseTime: `${responseTime}ms`,
          error: 'Database connection failed',
        };
      }
    } catch (error) {
      return {
        healthy: false,
        error:
          error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }

  /**
   * Redis 健康检查
   */
  async checkRedis() {
    try {
      const startTime = Date.now();
      const isHealthy = await this.redis.healthCheck();
      const responseTime = Date.now() - startTime;

      if (isHealthy) {
        return {
          healthy: true,
          responseTime: `${responseTime}ms`,
        };
      } else {
        return {
          healthy: false,
          responseTime: `${responseTime}ms`,
          error: 'Redis connection failed',
        };
      }
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown Redis error',
      };
    }
  }

  /**
   * 获取系统统计信息
   */
  async getStats() {
    try {
      const [databaseStats, redisStats] = await Promise.all([
        this.prisma.getStats(),
        this.redis.getStats(),
      ]);

      return {
        database: databaseStats,
        redis: redisStats,
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
