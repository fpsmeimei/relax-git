import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';

/**
 * 浏览量聚合服务
 * 负责定期聚合仓库浏览数据，用于热度计算和统计分析
 */
@Injectable()
export class ViewsAggregationService {
  private readonly logger = new Logger(ViewsAggregationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 每天凌晨2点执行浏览量聚合
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async aggregateViews(): Promise<void> {
    this.logger.log('开始执行浏览量聚合任务');

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await this.aggregateViewsForDate(yesterday);
      this.logger.log(
        `浏览量聚合完成: ${yesterday.toISOString().split('T')[0]}`
      );
    } catch (error) {
      this.logger.error('浏览量聚合失败:', error);
    }
  }

  /**
   * 聚合指定日期的浏览量数据
   */
  async aggregateViewsForDate(date: Date): Promise<void> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // 查询当天的浏览记录，按仓库分组统计
    const viewStats = await this.prisma.repositoryView.groupBy({
      by: ['repoId'],
      where: {
        viewedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _count: {
        id: true,
      },
    });

    // 为每个仓库创建或更新聚合记录
    for (const stat of viewStats) {
      // 计算独立用户数（排除匿名用户的重复）
      const uniqueUsers = await this.prisma.repositoryView.groupBy({
        by: ['userId'],
        where: {
          repoId: stat.repoId,
          viewedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          userId: {
            not: null,
          },
        },
      });

      // 统计匿名用户（按IP去重）
      const uniqueAnonymous = await this.prisma.repositoryView.groupBy({
        by: ['ipAddress'],
        where: {
          repoId: stat.repoId,
          viewedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          userId: null,
          ipAddress: {
            not: null,
          },
        },
      });

      const totalUniqueUsers = uniqueUsers.length + uniqueAnonymous.length;

      // 创建或更新聚合记录
      await this.prisma.repositoryViewsAgg.upsert({
        where: {
          repoId_date: {
            repoId: stat.repoId,
            date: startOfDay,
          },
        },
        create: {
          repoId: stat.repoId,
          date: startOfDay,
          viewCount: stat._count.id,
          uniqueUsers: totalUniqueUsers,
        },
        update: {
          viewCount: stat._count.id,
          uniqueUsers: totalUniqueUsers,
        },
      });
    }

    this.logger.log(
      `聚合完成: ${date.toISOString().split('T')[0]}, 处理了 ${viewStats.length} 个仓库`
    );
  }

  /**
   * 手动触发聚合（用于补数据或测试）
   */
  async manualAggregate(date?: Date): Promise<void> {
    const targetDate = date || new Date();
    targetDate.setDate(targetDate.getDate() - 1); // 默认聚合昨天的数据

    this.logger.log(`手动触发聚合: ${targetDate.toISOString().split('T')[0]}`);
    await this.aggregateViewsForDate(targetDate);
  }

  /**
   * 获取仓库的热度分数（用于推荐排序）
   */
  async getRepositoryTrendingScore(repoId: string, days = 7): Promise<number> {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const aggregations = await this.prisma.repositoryViewsAgg.findMany({
      where: {
        repoId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (aggregations.length === 0) {
      return 0;
    }

    // 计算加权热度分数：近期权重更高
    let score = 0;
    const totalDays = aggregations.length;

    aggregations.forEach((agg: any, index: number) => {
      // 时间衰减因子：越近的日期权重越高
      const timeWeight = (totalDays - index) / totalDays;

      // 浏览量权重
      const viewScore = agg.viewCount * 1.0;

      // 独立用户权重（更重要）
      const userScore = agg.uniqueUsers * 2.0;

      score += (viewScore + userScore) * timeWeight;
    });

    return Math.round(score * 100) / 100; // 保留两位小数
  }

  /**
   * 批量更新仓库的热度分数
   */
  async updateTrendingScores(): Promise<void> {
    this.logger.log('开始更新仓库热度分数');

    // 获取所有已发布的仓库
    const repositories = await this.prisma.repository.findMany({
      where: {
        isPublished: true,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    let updatedCount = 0;

    for (const repo of repositories) {
      try {
        const trendingScore = await this.getRepositoryTrendingScore(repo.id);

        await this.prisma.repository.update({
          where: { id: repo.id },
          data: {
            trendingScore,
          },
        });

        updatedCount++;
      } catch (error) {
        this.logger.warn(`更新仓库 ${repo.id} 热度分数失败:`, error);
      }
    }

    this.logger.log(`热度分数更新完成，共更新 ${updatedCount} 个仓库`);
  }

  /**
   * 每小时更新一次热度分数
   */
  @Cron(CronExpression.EVERY_HOUR)
  async scheduledUpdateTrendingScores(): Promise<void> {
    await this.updateTrendingScores();
  }
}
