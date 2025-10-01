import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  RepositoryVisibility,
  TimelineEventType,
  UserRole,
} from '@relax-git/shared/generated/prisma-client';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  AggregationPeriod,
  RepositoryTimelineStatsDto,
  TimelineAggregationDataPointDto,
  TimelineAggregationQueryDto,
  TimelineAggregationResponseDto,
  TimelineEventResponseDto,
  TimelineEventsListResponseDto,
  TimelineHeatmapDto,
  TimelineQueryDto,
  TimelineStatsDto,
} from './dto';

/**
 * 时间线事件管理服务
 * 负责时间线事件的查询、聚合、统计和缓存功能
 */
@Injectable()
export class TimelineService {
  private readonly logger = new Logger(TimelineService.name);

  // 性能监控指标
  private performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    slowQueries: 0,
    totalQueries: 0,
    avgQueryTime: 0,
  };

  // 性能配置
  private readonly SLOW_QUERY_THRESHOLD = 1000; // 1秒
  private readonly MAX_QUERY_LIMIT = 100; // 最大查询限制
  private readonly CACHE_TTL = {
    EVENTS: 300, // 5分钟
    STATS: 1800, // 30分钟
    AGGREGATED: 3600, // 1小时
    HEATMAP: 21600, // 6小时
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {
    // 启动性能监控定时器
    this.startPerformanceMonitoring();
  }

  /**
   * 分页查询时间线事件
   */
  async findAll(
    userId: string,
    userRole: UserRole,
    queryDto: TimelineQueryDto
  ): Promise<TimelineEventsListResponseDto> {
    const startTime = Date.now();
    const {
      page = 1,
      limit = 10,
      repoId,
      type,
      actorId,
      snapshotId,
      commentId,
      startDate,
      endDate,
    } = queryDto;

    // 限制查询数量，防止性能问题
    const safeLimit = Math.min(limit, this.MAX_QUERY_LIMIT);
    const skip = (page - 1) * safeLimit;

    try {
      this.performanceMetrics.totalQueries++;

      // 尝试从缓存获取
      const cacheKey = this.generateOptimizedCacheKey(
        'events',
        userId,
        queryDto
      );
      const cachedResult =
        await this.getCachedEventsWithMetrics<TimelineEventsListResponseDto>(
          cacheKey
        );
      if (cachedResult) {
        this.recordQueryTime(startTime, 'findAll', true);
        return cachedResult;
      }
      // 构建查询条件
      const where: any = {};

      // 权限过滤
      if (repoId) {
        // 当提供了 repoId 时，进行等价于 RepoAccess('read') 的校验
        await this.validateRepositoryAccess(repoId, userId, userRole);
        // 通过校验后，不再额外叠加 repository 级别的 OR 过滤
      } else if (userRole !== UserRole.ADMIN) {
        // 全局查询：对非管理员按可公开读取的可见性与所有者做过滤
        where.repository = {
          OR: [
            { ownerId: userId },
            { visibility: RepositoryVisibility.PUBLIC },
            { visibility: RepositoryVisibility.INTERNAL },
          ],
        };
      }

      // 其他过滤条件
      if (repoId) where.repoId = repoId;
      if (type) where.type = type;
      if (actorId) where.actorId = actorId;
      if (snapshotId) where.snapshotId = snapshotId;
      if (commentId) where.commentId = commentId;

      // 时间范围过滤
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      // 执行优化的数据库查询
      const queryStartTime = Date.now();
      const [events, total] = await Promise.all([
        this.prisma.timelineEvent.findMany({
          where,
          include: {
            actor: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            repository: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          skip,
          take: safeLimit,
          orderBy: [
            { createdAt: 'desc' },
            { id: 'desc' }, // 添加二级排序确保一致性
          ],
        }),
        this.prisma.timelineEvent.count({ where }),
      ]);

      const _queryTime = Date.now() - queryStartTime;
      this.recordQueryTime(startTime, 'findAll', false);

      const result: TimelineEventsListResponseDto = {
        events: events.map(this.transformEventToDto),
        total,
        page,
        limit: safeLimit,
      };

      // 智能缓存策略：热点数据缓存更长时间
      const cacheTTL = this.calculateCacheTTL('events', queryDto);
      await this.setCachedEventsWithMetrics(cacheKey, result, cacheTTL);

      return result;
    } catch (error) {
      this.logger.error(`Failed to query timeline events:`, error);
      throw new InternalServerErrorException('查询时间线事件失败');
    }
  }

  /**
   * 获取特定仓库的时间线事件
   */
  async findByRepository(
    repoId: string,
    userId: string,
    userRole: UserRole,
    queryDto: Omit<TimelineQueryDto, 'repoId'>
  ): Promise<TimelineEventsListResponseDto> {
    // 验证仓库访问权限
    await this.validateRepositoryAccess(repoId, userId, userRole);

    return this.findAll(userId, userRole, { ...queryDto, repoId });
  }

  /**
   * 获取时间线统计数据
   */
  async getStats(
    userId: string,
    userRole: UserRole,
    repoId?: string
  ): Promise<TimelineStatsDto> {
    const startTime = Date.now();

    try {
      this.performanceMetrics.totalQueries++;

      const cacheKey = this.generateOptimizedCacheKey('stats', userId, {
        repoId,
      });
      const cachedStats =
        await this.getCachedEventsWithMetrics<TimelineStatsDto>(cacheKey);
      if (cachedStats) {
        this.recordQueryTime(startTime, 'getStats', true);
        return cachedStats;
      }

      // 构建基础查询条件
      const baseWhere: any = {};

      // 权限过滤
      if (userRole !== UserRole.ADMIN) {
        baseWhere.repository = {
          OR: [
            { ownerId: userId },
            { visibility: RepositoryVisibility.PUBLIC },
          ],
        };
      }

      if (repoId) {
        await this.validateRepositoryAccess(repoId, userId, userRole);
        baseWhere.repoId = repoId;
      }

      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const weekStart = new Date(
        todayStart.getTime() - 7 * 24 * 60 * 60 * 1000
      );
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // 并行查询统计数据
      const [
        totalEvents,
        todayEvents,
        weekEvents,
        monthEvents,
        eventsByType,
        topUsers,
      ] = await Promise.all([
        // 总事件数
        this.prisma.timelineEvent.count({ where: baseWhere }),

        // 今日事件数
        this.prisma.timelineEvent.count({
          where: { ...baseWhere, createdAt: { gte: todayStart } },
        }),

        // 本周事件数
        this.prisma.timelineEvent.count({
          where: { ...baseWhere, createdAt: { gte: weekStart } },
        }),

        // 本月事件数
        this.prisma.timelineEvent.count({
          where: { ...baseWhere, createdAt: { gte: monthStart } },
        }),

        // 按事件类型分组统计
        this.prisma.timelineEvent.groupBy({
          by: ['type'],
          where: baseWhere,
          _count: { type: true },
        }),

        // 最活跃用户
        this.prisma.timelineEvent.groupBy({
          by: ['actorId'],
          where: baseWhere,
          _count: { actorId: true },
          orderBy: { _count: { actorId: 'desc' } },
          take: 10,
        }),
      ]);

      // 获取用户信息
      const userIds = topUsers.map((u: { actorId: string }) => u.actorId);
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, username: true },
      });

      const userMap = new Map<string, string>(
        users.map((u: { id: string; username: string }) => [u.id, u.username])
      );

      // 构建统计结果
      const stats: TimelineStatsDto = {
        totalEvents,
        todayEvents,
        weekEvents,
        monthEvents,
        activeUsers: new Set(
          topUsers.map((u: { actorId: string }) => u.actorId)
        ).size,
        eventsByType: eventsByType.reduce(
          (
            acc: Record<TimelineEventType, number>,
            item: { type: TimelineEventType; _count: { type: number } }
          ) => {
            acc[item.type] = item._count.type;
            return acc;
          },
          {} as Record<TimelineEventType, number>
        ),
        topUsers: topUsers.map(
          (user: { actorId: string; _count: { actorId: number } }) => ({
            userId: user.actorId,
            username: userMap.get(user.actorId) || 'Unknown',
            eventCount: user._count.actorId,
          })
        ),
        generatedAt: new Date().toISOString(),
      };

      // 智能缓存策略
      const cacheTTL = this.calculateCacheTTL('stats', { repoId });
      await this.setCachedEventsWithMetrics(cacheKey, stats, cacheTTL);

      this.recordQueryTime(startTime, 'getStats', false);
      return stats;
    } catch (error) {
      this.logger.error(`Failed to get timeline stats:`, error);
      throw new InternalServerErrorException('获取时间线统计失败');
    }
  }

  /**
   * 获取仓库时间线统计数据
   */
  async getRepositoryStats(
    repoId: string,
    userId: string,
    userRole: UserRole
  ): Promise<RepositoryTimelineStatsDto> {
    await this.validateRepositoryAccess(repoId, userId, userRole);

    try {
      const cacheKey = this.generateOptimizedCacheKey('repo-stats', userId, {
        repoId,
      });
      const cachedStats =
        await this.getCachedEvents<RepositoryTimelineStatsDto>(cacheKey);
      if (cachedStats) {
        return cachedStats;
      }

      const [
        repository,
        totalEvents,
        eventsByType,
        lastEvent,
        participantCount,
      ] = await Promise.all([
        this.prisma.repository.findUnique({
          where: { id: repoId },
          select: { id: true, name: true },
        }),
        this.prisma.timelineEvent.count({ where: { repoId } }),
        this.prisma.timelineEvent.groupBy({
          by: ['type'],
          where: { repoId },
          _count: { type: true },
        }),
        this.prisma.timelineEvent.findFirst({
          where: { repoId },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
        this.prisma.timelineEvent.findMany({
          where: { repoId },
          select: { actorId: true },
          distinct: ['actorId'],
        }),
      ]);

      if (!repository) {
        throw new NotFoundException('仓库不存在');
      }

      const stats: RepositoryTimelineStatsDto = {
        repoId,
        repoName: repository.name,
        totalEvents,
        lastActivity:
          lastEvent?.createdAt.toISOString() || new Date().toISOString(),
        eventsByType: eventsByType.reduce(
          (
            acc: Record<TimelineEventType, number>,
            item: { type: TimelineEventType; _count: { type: number } }
          ) => {
            acc[item.type] = item._count.type;
            return acc;
          },
          {} as Record<TimelineEventType, number>
        ),
        participantCount: participantCount.length,
      };

      // 缓存30分钟
      await this.setCachedEventsWithMetrics(cacheKey, stats, 1800);
      return stats;
    } catch (error) {
      this.logger.error(`Failed to get repository timeline stats:`, error);
      throw new InternalServerErrorException('获取仓库时间线统计失败');
    }
  }

  /**
   * 获取聚合数据
   */
  async getAggregatedData(
    userId: string,
    userRole: UserRole,
    queryDto: TimelineAggregationQueryDto,
    repoId?: string
  ): Promise<TimelineAggregationResponseDto> {
    const { period, type } = queryDto;

    try {
      const cacheKey = this.generateOptimizedCacheKey('aggregated', userId, {
        period,
        type,
        repoId,
      });
      const cachedData =
        await this.getCachedEvents<TimelineAggregationResponseDto>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // 构建查询条件
      const baseWhere: any = {};

      if (userRole !== UserRole.ADMIN) {
        baseWhere.repository = {
          OR: [
            { ownerId: userId },
            { visibility: RepositoryVisibility.PUBLIC },
          ],
        };
      }

      if (repoId) {
        await this.validateRepositoryAccess(repoId, userId, userRole);
        baseWhere.repoId = repoId;
      }

      if (type) {
        baseWhere.type = type;
      }

      // 计算时间范围（最近30个周期）
      const now = new Date();
      const periodCount = 30;
      let startDate: Date;

      switch (period) {
        case AggregationPeriod.HOUR:
          startDate = new Date(now.getTime() - periodCount * 60 * 60 * 1000);
          break;
        case AggregationPeriod.DAY:
          startDate = new Date(
            now.getTime() - periodCount * 24 * 60 * 60 * 1000
          );
          break;
        case AggregationPeriod.WEEK:
          startDate = new Date(
            now.getTime() - periodCount * 7 * 24 * 60 * 60 * 1000
          );
          break;
        case AggregationPeriod.MONTH:
          startDate = new Date(
            now.getFullYear(),
            now.getMonth() - periodCount,
            1
          );
          break;
        default:
          throw new Error('Invalid aggregation period');
      }

      baseWhere.createdAt = { gte: startDate };

      // 简化的聚合查询（避免原生SQL的复杂性）
      const events = await this.prisma.timelineEvent.findMany({
        where: baseWhere,
        select: {
          createdAt: true,
          type: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // 在内存中进行聚合
      const aggregationMap = new Map<string, number>();

      events.forEach((event: { createdAt: Date; type: TimelineEventType }) => {
        const date = new Date(event.createdAt);
        let periodKey: string;
        let startTime: Date;
        let endTime: Date;

        switch (period) {
          case AggregationPeriod.HOUR:
            periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}`;
            startTime = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              date.getHours()
            );
            endTime = new Date(startTime.getTime() + 60 * 60 * 1000 - 1);
            break;
          case AggregationPeriod.DAY:
            periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            startTime = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate()
            );
            endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000 - 1);
            break;
          case AggregationPeriod.WEEK:
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            periodKey = `${weekStart.getFullYear()}-W${String(Math.ceil(weekStart.getDate() / 7)).padStart(2, '0')}`;
            startTime = weekStart;
            endTime = new Date(
              startTime.getTime() + 7 * 24 * 60 * 60 * 1000 - 1
            );
            break;
          case AggregationPeriod.MONTH:
            periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            startTime = new Date(date.getFullYear(), date.getMonth(), 1);
            endTime = new Date(
              date.getFullYear(),
              date.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            );
            break;
        }

        const key = `${periodKey}|${startTime.toISOString()}|${endTime.toISOString()}`;
        aggregationMap.set(key, (aggregationMap.get(key) || 0) + 1);
      });

      const dataPoints: TimelineAggregationDataPointDto[] = Array.from(
        aggregationMap.entries()
      )
        .map(([key, count]) => {
          const [period, startTime, endTime] = key.split('|');
          return {
            period: period || '',
            count,
            startTime: startTime || '',
            endTime: endTime || '',
            ...(type && { type }),
          };
        })
        .sort(
          (a, b) =>
            new Date(b.startTime || '').getTime() -
            new Date(a.startTime || '').getTime()
        );

      const totalEvents = dataPoints.reduce(
        (sum: number, point: TimelineAggregationDataPointDto) =>
          sum + point.count,
        0
      );

      const result: TimelineAggregationResponseDto = {
        period,
        data: dataPoints,
        totalDataPoints: dataPoints.length,
        totalEvents,
        ...(type && { filteredType: type }),
        timeRange: {
          startDate: startDate.toISOString(),
          endDate: now.toISOString(),
        },
        generatedAt: new Date().toISOString(),
      };

      // 缓存1小时
      await this.setCachedEventsWithMetrics(cacheKey, result, 3600);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get aggregated timeline data:`, error);
      throw new InternalServerErrorException('获取聚合时间线数据失败');
    }
  }

  /**
   * 获取热力图数据
   */
  async getHeatmapData(
    userId: string,
    userRole: UserRole,
    repoId?: string,
    days = 365
  ): Promise<TimelineHeatmapDto[]> {
    try {
      const cacheKey = this.generateOptimizedCacheKey('heatmap', userId, {
        repoId,
        days,
      });
      const cachedData =
        await this.getCachedEvents<TimelineHeatmapDto[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const endDate = new Date();
      const startDate = new Date(
        endDate.getTime() - days * 24 * 60 * 60 * 1000
      );

      const baseWhere: any = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (userRole !== UserRole.ADMIN) {
        baseWhere.repository = {
          OR: [
            { ownerId: userId },
            { visibility: RepositoryVisibility.PUBLIC },
          ],
        };
      }

      if (repoId) {
        await this.validateRepositoryAccess(repoId, userId, userRole);
        baseWhere.repoId = repoId;
      }

      const events = await this.prisma.timelineEvent.findMany({
        where: baseWhere,
        select: { createdAt: true },
      });

      // 按日期聚合
      const dateMap = new Map<string, number>();
      events.forEach((event: { createdAt: Date }) => {
        const date = event.createdAt.toISOString().split('T')[0] || '';
        if (date) {
          dateMap.set(date, (dateMap.get(date) || 0) + 1);
        }
      });

      // 生成完整的日期范围
      const heatmapData: TimelineHeatmapDto[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0] || '';
        const count = dateMap.get(dateStr) || 0;

        // 计算活跃度等级 (0-4)
        let level = 0;
        if (count > 0) {
          if (count >= 20) level = 4;
          else if (count >= 15) level = 3;
          else if (count >= 10) level = 2;
          else level = 1;
        }

        if (dateStr) {
          heatmapData.push({
            date: dateStr,
            count,
            level,
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 缓存6小时
      await this.setCachedEventsWithMetrics(cacheKey, heatmapData, 21600);
      return heatmapData;
    } catch (error) {
      this.logger.error(`Failed to get heatmap data:`, error);
      throw new InternalServerErrorException('获取热力图数据失败');
    }
  }

  /**
   * 创建时间线事件（核心方法）
   * 用于在系统中创建各种类型的时间线事件
   */
  async createTimelineEvent(
    type: TimelineEventType,
    repoId: string,
    actorId: string,
    payload: Record<string, unknown>,
    options?: {
      snapshotId?: string;
      commentId?: string;
      immediate?: boolean;
    }
  ): Promise<TimelineEventResponseDto> {
    const startTime = Date.now();

    try {
      // 验证仓库存在性
      const repository = await this.prisma.repository.findUnique({
        where: { id: repoId },
        select: { id: true, name: true },
      });

      if (!repository) {
        throw new NotFoundException('仓库不存在');
      }

      // 验证用户存在性
      const actor = await this.prisma.user.findUnique({
        where: { id: actorId },
        select: { id: true, username: true, avatar: true },
      });

      if (!actor) {
        throw new NotFoundException('用户不存在');
      }

      // 创建时间线事件
      const timelineEvent = await this.prisma.timelineEvent.create({
        data: {
          type,
          repoId,
          actorId,
          snapshotId: options?.snapshotId || null,
          commentId: options?.commentId || null,
          payload: payload as any,
        },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          repository: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // 转换为DTO
      const eventDto = this.transformEventToDto(timelineEvent);

      // 清除相关缓存
      await this.invalidateRelatedCaches(repoId, type);

      // 记录性能指标
      this.recordQueryTime(startTime, 'createTimelineEvent', false);

      this.logger.log(
        `Timeline event created: ${type} for repository ${repoId} by user ${actorId}`
      );

      return eventDto;
    } catch (error) {
      this.logger.error(`Failed to create timeline event:`, error);
      throw new InternalServerErrorException('创建时间线事件失败');
    }
  }

  /**
   * 批量创建时间线事件
   * 用于批量处理多个事件，提高性能
   */
  async createTimelineEvents(
    events: Array<{
      type: TimelineEventType;
      repoId: string;
      actorId: string;
      payload: Record<string, unknown>;
      snapshotId?: string;
      commentId?: string;
    }>
  ): Promise<TimelineEventResponseDto[]> {
    const startTime = Date.now();

    try {
      // 验证所有事件的基础数据
      const repoIds = [
        ...new Set(events.map((e: { repoId: string }) => e.repoId)),
      ];
      const actorIds = [
        ...new Set(events.map((e: { actorId: string }) => e.actorId)),
      ];

      const [repositories, actors] = await Promise.all([
        this.prisma.repository.findMany({
          where: { id: { in: repoIds } },
          select: { id: true, name: true },
        }),
        this.prisma.user.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, username: true, avatar: true },
        }),
      ]);

      const repoMap = new Map<string, { id: string; name: string }>(
        repositories.map((r: { id: string; name: string }) => [r.id, r])
      );
      const actorMap = new Map<
        string,
        { id: string; username: string; avatar: string | null }
      >(
        actors.map(
          (a: { id: string; username: string; avatar: string | null }) => [
            a.id,
            a,
          ]
        )
      );

      // 验证数据完整性
      for (const event of events) {
        if (!repoMap.has(event.repoId)) {
          throw new NotFoundException(`仓库 ${event.repoId} 不存在`);
        }
        if (!actorMap.has(event.actorId)) {
          throw new NotFoundException(`用户 ${event.actorId} 不存在`);
        }
      }

      // 批量创建事件
      const _createdEvents = await this.prisma.timelineEvent.createMany({
        data: events.map(
          (event: {
            type: TimelineEventType;
            repoId: string;
            actorId: string;
            snapshotId?: string;
            commentId?: string;
            payload: Record<string, unknown>;
          }) => ({
            type: event.type,
            repoId: event.repoId,
            actorId: event.actorId,
            snapshotId: event.snapshotId || null,
            commentId: event.commentId || null,
            payload: event.payload as any,
          })
        ),
      });

      // 获取创建的事件详情
      const eventIds = await this.prisma.timelineEvent.findMany({
        where: {
          repoId: { in: repoIds },
          actorId: { in: actorIds },
          createdAt: { gte: new Date(Date.now() - 1000) }, // 最近1秒创建的事件
        },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          repository: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: events.length,
      });

      // 清除相关缓存
      const uniqueRepoIds = [
        ...new Set(events.map((e: { repoId: string }) => e.repoId)),
      ];
      await Promise.all(
        uniqueRepoIds.map((repoId: string) =>
          this.invalidateRelatedCaches(repoId)
        )
      );

      // 记录性能指标
      this.recordQueryTime(startTime, 'createTimelineEvents', false);

      this.logger.log(
        `Batch timeline events created: ${events.length} events for ${uniqueRepoIds.length} repositories`
      );

      return eventIds.map((event: any) => this.transformEventToDto(event));
    } catch (error) {
      this.logger.error(`Failed to create batch timeline events:`, error);
      throw new InternalServerErrorException('批量创建时间线事件失败');
    }
  }

  /**
   * 获取事件聚合统计（按类型和时间）
   */
  async getEventTypeStats(
    userId: string,
    userRole: UserRole,
    repoId?: string,
    timeRange?: { startDate: string; endDate: string }
  ): Promise<Record<TimelineEventType, number>> {
    try {
      const cacheKey = this.generateOptimizedCacheKey('type-stats', userId, {
        repoId,
        timeRange,
      });
      const cachedStats =
        await this.getCachedEvents<Record<TimelineEventType, number>>(cacheKey);
      if (cachedStats) {
        return cachedStats;
      }

      // 构建查询条件
      const baseWhere: any = {};

      if (userRole !== UserRole.ADMIN) {
        baseWhere.repository = {
          OR: [
            { ownerId: userId },
            { visibility: RepositoryVisibility.PUBLIC },
          ],
        };
      }

      if (repoId) {
        await this.validateRepositoryAccess(repoId, userId, userRole);
        baseWhere.repoId = repoId;
      }

      if (timeRange) {
        baseWhere.createdAt = {
          gte: new Date(timeRange.startDate),
          lte: new Date(timeRange.endDate),
        };
      }

      // 按事件类型分组统计
      const eventsByType = await this.prisma.timelineEvent.groupBy({
        by: ['type'],
        where: baseWhere,
        _count: { type: true },
      });

      // 构建结果
      const stats = eventsByType.reduce(
        (
          acc: Record<TimelineEventType, number>,
          item: { type: TimelineEventType; _count: { type: number } }
        ) => {
          acc[item.type] = item._count.type;
          return acc;
        },
        {} as Record<TimelineEventType, number>
      );

      // 确保所有事件类型都有值
      Object.values(TimelineEventType).forEach(type => {
        if (!(type in stats)) {
          stats[type] = 0;
        }
      });

      // 缓存30分钟
      await this.setCachedEventsWithMetrics(cacheKey, stats, 1800);
      return stats;
    } catch (error) {
      this.logger.error(`Failed to get event type stats:`, error);
      throw new InternalServerErrorException('获取事件类型统计失败');
    }
  }

  /**
   * 获取用户活动时间线
   */
  async getUserTimeline(
    userId: string,
    targetUserId: string,
    userRole: UserRole,
    queryDto: TimelineQueryDto
  ): Promise<TimelineEventsListResponseDto> {
    const startTime = Date.now();

    try {
      // 验证目标用户存在性
      const targetUser = await this.prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, username: true },
      });

      if (!targetUser) {
        throw new NotFoundException('用户不存在');
      }

      // 权限检查：只能查看自己的活动或公开仓库的活动
      if (userId !== targetUserId && userRole !== UserRole.ADMIN) {
        // 只能查看目标用户在公开仓库的活动
        delete queryDto.repoId; // 重置仓库过滤，只查看公开仓库
      }

      // 设置用户过滤
      const userQueryDto = {
        ...queryDto,
        actorId: targetUserId,
      };

      // 复用现有的查询逻辑
      const result = await this.findAll(userId, userRole, userQueryDto);

      this.recordQueryTime(startTime, 'getUserTimeline', false);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get user timeline:`, error);
      throw new InternalServerErrorException('获取用户时间线失败');
    }
  }

  /**
   * 验证仓库访问权限
   */
  private async validateRepositoryAccess(
    repoId: string,
    userId: string,
    userRole: UserRole
  ): Promise<void> {
    const repository = await this.prisma.repository.findUnique({
      where: { id: repoId },
      select: { id: true, ownerId: true, visibility: true },
    });
    if (!repository) {
      throw new NotFoundException('仓库不存在');
    }
    const { canReadRepo } = await import('../auth/utils/access');
    const ok = await canReadRepo(
      this.prisma as any,
      repository as any,
      userId,
      userRole
    );
    if (!ok) {
      // 与对外接口保持一致的错误语义
      throw new NotFoundException('仓库不存在或无访问权限');
    }
  }

  /**
   * 获取缓存的事件数据
   */
  private async getCachedEvents<T>(key: string): Promise<T | null> {
    try {
      return await this.redis.get<T>(key);
    } catch (error) {
      this.logger.warn(`Failed to get cached data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * 转换时间线事件为DTO
   */
  private transformEventToDto(event: any): TimelineEventResponseDto {
    return {
      id: event.id,
      repoId: event.repoId,
      type: event.type,
      actorId: event.actorId,
      snapshotId: event.snapshotId,
      commentId: event.commentId,
      payload: event.payload,
      createdAt: event.createdAt.toISOString(),
      actor: event.actor
        ? {
            id: event.actor.id,
            username: event.actor.username,
            avatar: event.actor.avatar,
          }
        : {
            id: '',
            username: '',
          },
      repository: event.repository
        ? {
            id: event.repository.id,
            name: event.repository.name,
          }
        : {
            id: '',
            name: '',
          },
    };
  }

  // ===== 性能优化方法 =====

  /**
   * 启动性能监控
   */
  private startPerformanceMonitoring() {
    // 每5分钟输出性能指标
    setInterval(
      () => {
        this.logPerformanceMetrics();
      },
      5 * 60 * 1000
    );
  }

  /**
   * 记录查询时间
   */
  private recordQueryTime(
    startTime: number,
    operation: string,
    isCacheHit: boolean
  ): void {
    const duration = Date.now() - startTime;

    // 更新性能指标
    if (isCacheHit) {
      this.performanceMetrics.cacheHits++;
    } else {
      this.performanceMetrics.cacheMisses++;
    }

    // 检查慢查询
    if (duration > this.SLOW_QUERY_THRESHOLD) {
      this.performanceMetrics.slowQueries++;
      this.logger.warn(`Slow query detected: ${operation} took ${duration}ms`);
    }

    // 更新平均查询时间
    const totalQueries =
      this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses;
    this.performanceMetrics.avgQueryTime =
      (this.performanceMetrics.avgQueryTime * (totalQueries - 1) + duration) /
      totalQueries;
  }

  /**
   * 生成优化的缓存键
   */
  private generateOptimizedCacheKey(
    type: string,
    userId: string,
    params: Record<string, any>
  ): string {
    // 过滤掉null和undefined值，并排序参数
    const filteredParams = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');

    // 添加用户角色信息到缓存键中
    const keyComponents = [
      'timeline',
      type,
      userId.substring(0, 8), // 使用用户ID前8位
      filteredParams,
    ].filter(Boolean);

    return keyComponents.join(':');
  }

  /**
   * 带性能监控的缓存获取
   */
  private async getCachedEventsWithMetrics<T>(key: string): Promise<T | null> {
    try {
      const result = await this.redis.get<T>(key);
      if (result) {
        this.performanceMetrics.cacheHits++;
        this.logger.debug(`Cache hit: ${key}`);
      } else {
        this.performanceMetrics.cacheMisses++;
        this.logger.debug(`Cache miss: ${key}`);
      }
      return result;
    } catch (error) {
      this.performanceMetrics.cacheMisses++;
      this.logger.warn(`Failed to get cached data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * 带性能监控的缓存设置
   */
  private async setCachedEventsWithMetrics<T>(
    key: string,
    data: T,
    ttlSeconds: number
  ): Promise<void> {
    try {
      await this.redis.set(key, data as any, ttlSeconds);
      this.logger.debug(
        `Cached data with key: ${key}, TTL: ${ttlSeconds}s, size: ${JSON.stringify(data).length} bytes`
      );
    } catch (error) {
      this.logger.warn(`Failed to cache data for key ${key}:`, error);
    }
  }

  /**
   * 计算智能缓存TTL
   */
  private calculateCacheTTL(type: string, params: Record<string, any>): number {
    const baseTTL =
      this.CACHE_TTL[type.toUpperCase() as keyof typeof this.CACHE_TTL] ||
      this.CACHE_TTL.EVENTS;

    // 热点数据缓存更长时间
    if (params['repoId']) {
      // 特定仓库的数据缓存时间稍长
      return baseTTL * 1.5;
    }

    // 全局数据缓存时间较短
    return baseTTL;
  }

  /**
   * 输出性能指标
   */
  private logPerformanceMetrics() {
    const cacheHitRate =
      this.performanceMetrics.totalQueries > 0
        ? (
            (this.performanceMetrics.cacheHits /
              (this.performanceMetrics.cacheHits +
                this.performanceMetrics.cacheMisses)) *
            100
          ).toFixed(2)
        : '0.00';

    const slowQueryRate =
      this.performanceMetrics.totalQueries > 0
        ? (
            (this.performanceMetrics.slowQueries /
              this.performanceMetrics.totalQueries) *
            100
          ).toFixed(2)
        : '0.00';

    this.logger.log(`Performance Metrics:
      Total Queries: ${this.performanceMetrics.totalQueries}
      Cache Hit Rate: ${cacheHitRate}%
      Slow Queries: ${this.performanceMetrics.slowQueries} (${slowQueryRate}%)
      Avg Query Time: ${this.performanceMetrics.avgQueryTime.toFixed(2)}ms
    `);
  }

  /**
   * 获取性能指标（用于健康检查）
   */
  getPerformanceMetrics() {
    const cacheHitRate =
      this.performanceMetrics.totalQueries > 0
        ? (this.performanceMetrics.cacheHits /
            (this.performanceMetrics.cacheHits +
              this.performanceMetrics.cacheMisses)) *
          100
        : 0;

    return {
      ...this.performanceMetrics,
      cacheHitRate: parseFloat(cacheHitRate.toFixed(2)),
      slowQueryRate:
        this.performanceMetrics.totalQueries > 0
          ? parseFloat(
              (
                (this.performanceMetrics.slowQueries /
                  this.performanceMetrics.totalQueries) *
                100
              ).toFixed(2)
            )
          : 0,
    };
  }

  /**
   * 重置性能指标
   */
  resetPerformanceMetrics() {
    this.performanceMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      slowQueries: 0,
      totalQueries: 0,
      avgQueryTime: 0,
    };
    this.logger.log('Performance metrics reset');
  }

  /**
   * 清除相关缓存
   */
  private async invalidateRelatedCaches(
    repoId: string,
    eventType?: TimelineEventType
  ): Promise<void> {
    try {
      const cachePatterns = [
        `timeline:events:*`,
        `timeline:stats:*`,
        `timeline:aggregated:*`,
        `timeline:heatmap:*`,
        `timeline:type-stats:*`,
      ];

      // 如果指定了事件类型，也清除相关缓存
      if (eventType) {
        cachePatterns.push(`timeline:*:${eventType}:*`);
      }

      // 批量清除缓存
      await Promise.all(
        cachePatterns.map(pattern =>
          this.redis
            .del(pattern)
            .catch((error: any) =>
              this.logger.warn(
                `Failed to clear cache pattern ${pattern}:`,
                error
              )
            )
        )
      );

      this.logger.debug(`Cleared related caches for repository ${repoId}`);
    } catch (error) {
      this.logger.warn(`Failed to invalidate related caches:`, error);
    }
  }
}
