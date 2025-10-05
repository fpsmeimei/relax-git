import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Phase 1.4: 快照系统监控和指标服务
 * 提供性能指标、健康检查和日志追踪
 */
@Injectable()
export class SnapshotMetricsService {
  private readonly logger = new Logger(SnapshotMetricsService.name);
  private metrics: SnapshotMetrics = this.initMetrics();
  private readonly METRICS_KEY = 'snapshot:metrics';
  private readonly WINDOW_SIZE = 60 * 60 * 1000; // 1小时滑动窗口

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.loadMetricsFromCache();
  }

  /**
   * 记录工件创建
   */
  async recordArtifactCreated(
    artifactId: string,
    repoId: string,
    commitSha: string,
    isReused = false
  ): Promise<void> {
    const timestamp = Date.now();

    if (isReused) {
      this.metrics.artifactReuseCount++;
      this.logger.debug(
        `Artifact reused: ${artifactId} for commit ${commitSha}`
      );
    } else {
      this.metrics.artifactCreateCount++;
      this.logger.debug(
        `Artifact created: ${artifactId} for commit ${commitSha}`
      );
    }

    // 记录到时间序列
    this.metrics.recentArtifacts.push({
      artifactId,
      repoId,
      commitSha,
      timestamp,
      isReused,
    });

    // 清理旧数据
    this.cleanupOldMetrics();

    // 发送事件
    this.eventEmitter.emit('metrics.artifact.created', {
      artifactId,
      repoId,
      commitSha,
      isReused,
      timestamp,
    });

    await this.saveMetricsToCache();
  }

  /**
   * 记录任务处理时间
   */
  async recordProcessingTime(
    artifactId: string,
    startTime: number,
    success: boolean
  ): Promise<void> {
    const duration = Date.now() - startTime;

    this.metrics.processingTimes.push({
      artifactId,
      duration,
      success,
      timestamp: Date.now(),
    });

    if (success) {
      this.metrics.successCount++;
      this.metrics.totalProcessingTime += duration;
      this.metrics.avgProcessingTime =
        this.metrics.totalProcessingTime / this.metrics.successCount;

      this.logger.log(
        `Artifact ${artifactId} processed successfully in ${duration}ms`
      );
    } else {
      this.metrics.failureCount++;
      this.logger.warn(
        `Artifact ${artifactId} processing failed after ${duration}ms`
      );
    }

    // 发送事件
    this.eventEmitter.emit('metrics.processing.complete', {
      artifactId,
      duration,
      success,
    });

    await this.saveMetricsToCache();
  }

  /**
   * 记录队列长度
   */
  async recordQueueLength(length: number): Promise<void> {
    this.metrics.currentQueueLength = length;

    if (length > this.metrics.maxQueueLength) {
      this.metrics.maxQueueLength = length;
      this.logger.warn(`Queue length reached new maximum: ${length}`);
    }

    this.metrics.queueLengthHistory.push({
      length,
      timestamp: Date.now(),
    });

    // 队列积压告警
    if (length > 50) {
      this.logger.error(`Queue backlog alert! Current length: ${length}`);
      this.eventEmitter.emit('metrics.queue.backlog', { length });
    }

    await this.saveMetricsToCache();
  }

  /**
   * 获取当前指标
   */
  async getMetrics(): Promise<SnapshotMetrics> {
    // 实时查询数据库状态
    const [
      totalArtifacts,
      readyArtifacts,
      failedArtifacts,
      queuedArtifacts,
      activeSessions,
    ] = await Promise.all([
      this.prisma.snapshotArtifact.count(),
      this.prisma.snapshotArtifact.count({
        where: { status: 'READY' },
      }),
      this.prisma.snapshotArtifact.count({
        where: { status: 'FAILED' },
      }),
      this.prisma.snapshotArtifact.count({
        where: { status: 'QUEUED' },
      }),
      this.prisma.sessionSnapshot.count({
        where: {
          status: 'READY',
          expiresAt: { gt: new Date() },
        },
      }),
    ]);

    // 计算复用率
    const reuseRate =
      this.metrics.artifactCreateCount > 0
        ? (this.metrics.artifactReuseCount /
            (this.metrics.artifactCreateCount +
              this.metrics.artifactReuseCount)) *
          100
        : 0;

    // 计算成功率
    const successRate =
      this.metrics.successCount + this.metrics.failureCount > 0
        ? (this.metrics.successCount /
            (this.metrics.successCount + this.metrics.failureCount)) *
          100
        : 100;

    return {
      ...this.metrics,
      totalArtifacts,
      readyArtifacts,
      failedArtifacts,
      queuedArtifacts,
      activeSessions,
      reuseRate: parseFloat(reuseRate.toFixed(2)),
      successRate: parseFloat(successRate.toFixed(2)),
      timestamp: Date.now(),
    };
  }

  /**
   * 获取健康状态
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const metrics = await this.getMetrics();
    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // 检查队列积压
    if (metrics.currentQueueLength > 100) {
      issues.push(
        `Queue severely backlogged: ${metrics.currentQueueLength} tasks`
      );
      status = 'unhealthy';
    } else if (metrics.currentQueueLength > 50) {
      issues.push(`Queue backlogged: ${metrics.currentQueueLength} tasks`);
      status = 'degraded';
    }

    // 检查失败率
    const failureRate = 100 - metrics.successRate;
    if (failureRate > 20) {
      issues.push(`High failure rate: ${failureRate.toFixed(2)}%`);
      status = status === 'unhealthy' ? 'unhealthy' : 'degraded';
    }

    // 检查平均处理时间
    if (metrics.avgProcessingTime > 60000) {
      // 超过1分钟
      issues.push(
        `Slow processing: avg ${(metrics.avgProcessingTime / 1000).toFixed(2)}s`
      );
      status = status === 'unhealthy' ? 'unhealthy' : 'degraded';
    }

    // 检查Redis连接
    try {
      // TODO: 实现 Redis ping 检查
      // await this.redis.ping();
    } catch (error) {
      issues.push('Redis connection failed');
      status = 'unhealthy';
    }

    // 检查数据库连接
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      issues.push('Database connection failed');
      status = 'unhealthy';
    }

    return {
      status,
      issues,
      metrics: {
        queueLength: metrics.currentQueueLength,
        successRate: metrics.successRate,
        reuseRate: metrics.reuseRate,
        avgProcessingTime: metrics.avgProcessingTime,
        activeSessions: metrics.activeSessions,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * 定时收集指标（每分钟）
   */
  @Interval(60000)
  async collectMetrics(): Promise<void> {
    try {
      // 获取队列长度
      const queueLength = await this.redis.getQueueLength('snapshot:queue');
      await this.recordQueueLength(queueLength);

      // 记录指标快照
      const metrics = await this.getMetrics();
      this.logger.debug(
        `Metrics snapshot: ${JSON.stringify({
          queue: metrics.currentQueueLength,
          success: metrics.successRate,
          reuse: metrics.reuseRate,
          active: metrics.activeSessions,
        })}`
      );

      // 检查健康状态
      const health = await this.getHealthStatus();
      if (health.status !== 'healthy') {
        this.logger.warn(`System health: ${health.status}`, health.issues);
      }
    } catch (error) {
      this.logger.error('Failed to collect metrics:', error);
    }
  }

  /**
   * 重置指标（用于测试或维护）
   */
  async resetMetrics(): Promise<void> {
    this.metrics = this.initMetrics();
    await this.redis.del(this.METRICS_KEY);
    this.logger.warn('Metrics have been reset');
  }

  /**
   * 获取性能报告
   */
  async getPerformanceReport(
    startDate?: Date,
    endDate?: Date
  ): Promise<PerformanceReport> {
    const start = startDate || new Date(Date.now() - 24 * 60 * 60 * 1000); // 默认24小时
    const end = endDate || new Date();

    // 查询时间范围内的数据
    const [artifactsCreated, artifactsProcessed, sessionCreated, failedTasks] =
      await Promise.all([
        this.prisma.snapshotArtifact.count({
          where: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        }),
        this.prisma.snapshotArtifact.count({
          where: {
            processedAt: {
              gte: start,
              lte: end,
            },
            status: 'READY',
          },
        }),
        this.prisma.sessionSnapshot.count({
          where: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        }),
        this.prisma.snapshotArtifact.count({
          where: {
            updatedAt: {
              gte: start,
              lte: end,
            },
            status: 'FAILED',
          },
        }),
      ]);

    // 计算峰值队列长度
    const peakQueueLength = Math.max(
      ...this.metrics.queueLengthHistory
        .filter(
          h => h.timestamp >= start.getTime() && h.timestamp <= end.getTime()
        )
        .map(h => h.length),
      0
    );

    // 计算平均处理时间
    const relevantProcessingTimes = this.metrics.processingTimes.filter(
      p => p.timestamp >= start.getTime() && p.timestamp <= end.getTime()
    );

    const avgProcessingTime =
      relevantProcessingTimes.length > 0
        ? relevantProcessingTimes.reduce((sum, p) => sum + p.duration, 0) /
          relevantProcessingTimes.length
        : 0;

    return {
      period: {
        start,
        end,
      },
      summary: {
        artifactsCreated,
        artifactsProcessed,
        sessionCreated,
        failedTasks,
        peakQueueLength,
        avgProcessingTime,
      },
      hourlyBreakdown: this.getHourlyBreakdown(start, end),
      topRepositories: await this.getTopRepositories(start, end),
    };
  }

  /**
   * 初始化指标
   */
  private initMetrics(): SnapshotMetrics {
    return {
      artifactCreateCount: 0,
      artifactReuseCount: 0,
      successCount: 0,
      failureCount: 0,
      avgProcessingTime: 0,
      totalProcessingTime: 0,
      currentQueueLength: 0,
      maxQueueLength: 0,
      totalArtifacts: 0,
      readyArtifacts: 0,
      failedArtifacts: 0,
      queuedArtifacts: 0,
      activeSessions: 0,
      reuseRate: 0,
      successRate: 100,
      recentArtifacts: [],
      processingTimes: [],
      queueLengthHistory: [],
      timestamp: Date.now(),
    };
  }

  /**
   * 清理旧指标数据
   */
  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - this.WINDOW_SIZE;

    this.metrics.recentArtifacts = this.metrics.recentArtifacts.filter(
      a => a.timestamp > cutoff
    );

    this.metrics.processingTimes = this.metrics.processingTimes.filter(
      p => p.timestamp > cutoff
    );

    this.metrics.queueLengthHistory = this.metrics.queueLengthHistory
      .filter(q => q.timestamp > cutoff)
      .slice(-100); // 最多保留100条
  }

  /**
   * 从缓存加载指标
   */
  private async loadMetricsFromCache(): Promise<void> {
    try {
      const cached = await this.redis.get(this.METRICS_KEY);
      if (cached) {
        this.metrics = JSON.parse(cached);
        this.logger.debug('Loaded metrics from cache');
      }
    } catch (error) {
      this.logger.warn('Failed to load metrics from cache:', error);
    }
  }

  /**
   * 保存指标到缓存
   */
  private async saveMetricsToCache(): Promise<void> {
    try {
      await this.redis.set(
        this.METRICS_KEY,
        JSON.stringify(this.metrics),
        3600 // 1小时过期
      );
    } catch (error) {
      this.logger.warn('Failed to save metrics to cache:', error);
    }
  }

  /**
   * 获取小时级别的分解数据
   */
  private getHourlyBreakdown(_start: Date, _end: Date): any[] {
    // 简化实现，实际应该聚合数据
    return [];
  }

  /**
   * 获取最活跃的仓库
   */
  private async getTopRepositories(start: Date, end: Date): Promise<any[]> {
    // 简化实现
    return this.prisma.$queryRaw`
      SELECT 
        repo_id,
        COUNT(*) as artifact_count
      FROM snapshot_artifacts
      WHERE created_at >= ${start} AND created_at <= ${end}
      GROUP BY repo_id
      ORDER BY artifact_count DESC
      LIMIT 10
    `;
  }
}

// 类型定义
export interface SnapshotMetrics {
  artifactCreateCount: number;
  artifactReuseCount: number;
  successCount: number;
  failureCount: number;
  avgProcessingTime: number;
  totalProcessingTime: number;
  currentQueueLength: number;
  maxQueueLength: number;
  totalArtifacts: number;
  readyArtifacts: number;
  failedArtifacts: number;
  queuedArtifacts: number;
  activeSessions: number;
  reuseRate: number;
  successRate: number;
  recentArtifacts: Array<{
    artifactId: string;
    repoId: string;
    commitSha: string;
    timestamp: number;
    isReused: boolean;
  }>;
  processingTimes: Array<{
    artifactId: string;
    duration: number;
    success: boolean;
    timestamp: number;
  }>;
  queueLengthHistory: Array<{
    length: number;
    timestamp: number;
  }>;
  timestamp: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  issues: string[];
  metrics: {
    queueLength: number;
    successRate: number;
    reuseRate: number;
    avgProcessingTime: number;
    activeSessions: number;
  };
  timestamp: number;
}

export interface PerformanceReport {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    artifactsCreated: number;
    artifactsProcessed: number;
    sessionCreated: number;
    failedTasks: number;
    peakQueueLength: number;
    avgProcessingTime: number;
  };
  hourlyBreakdown: any[];
  topRepositories: any[];
}
