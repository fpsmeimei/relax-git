import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import type { SearchMatchDto } from './dto';
import {
  CreateSearchDto,
  QuerySearchHistoryDto,
  SearchHistoryResponseDto,
  SearchResponseDto,
  SearchResultDto,
  SearchStatus,
  SearchType,
} from './dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly searchQueueName = 'search:queue';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly websocketGateway: WebSocketGateway
  ) {}

  /**
   * 创建搜索任务
   */
  async createSearch(
    userId: string,
    createSearchDto: CreateSearchDto,
    userRole?: UserRole
  ): Promise<SearchResponseDto> {
    const { repositoryId, snapshotId, query, searchType, maxResults } =
      createSearchDto;

    // 1. 验证仓库访问权限
    const repository = await this.validateRepositoryAccess(
      repositoryId,
      userId,
      userRole
    );

    // 2. 如果指定了快照，验证快照存在且属于该仓库
    if (snapshotId) {
      await this.validateSnapshotAccess(snapshotId, repositoryId);
    }

    // 3. 生成搜索任务ID
    const searchId = randomUUID();

    // 4. 创建搜索历史记录
    await this.prisma.searchHistory.create({
      data: {
        id: searchId,
        userId,
        repositoryId,
        snapshotId: snapshotId || null,
        query,
        searchType: searchType as any,
        resultsCount: 0, // 初始为0，完成后更新
      },
    });

    // 5. 创建搜索任务
    const searchTask = {
      id: searchId,
      userId,
      repositoryId,
      snapshotId: snapshotId || '',
      query,
      searchType: searchType || SearchType.CONTENT,
      maxResults: maxResults || 100,
      createdAt: new Date(),
    };

    // 6. 推送任务到Redis队列
    try {
      await this.redis.enqueue(this.searchQueueName, searchTask);
      this.logger.log(`Enqueued search task ${searchId}`);
    } catch (error) {
      this.logger.error(`Failed to enqueue search task ${searchId}:`, error);
      throw new BadRequestException('搜索任务推送失败，请稍后重试');
    }

    // 7. 发送WebSocket通知
    this.websocketGateway.emitUserNotification(userId, {
      type: 'search:started',
      searchId,
      query,
      repositoryName: repository.name,
    });

    return {
      id: searchId,
      status: SearchStatus.QUEUED,
      estimatedTime: 30, // 预估30秒
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * 获取搜索结果
   */
  async getSearchResult(
    searchId: string,
    userId: string
  ): Promise<SearchResultDto> {
    // 验证搜索历史是否属于当前用户
    const searchHistory = await this.prisma.searchHistory.findFirst({
      where: {
        id: searchId,
        userId,
      },
    });

    if (!searchHistory) {
      throw new NotFoundException('搜索记录不存在');
    }

    // 从Redis获取搜索结果（RedisService.get 会自动解析 JSON）
    const resultKey = `search:result:${searchId}`;
    const result = await this.redis.get<{
      status: SearchStatus;
      results?: SearchMatchDto[];
      totalMatches?: number;
      processedAt?: string;
      errorMessage?: string;
    }>(resultKey);

    if (!result) {
      // 如果Redis中没有结果，返回处理中状态
      return {
        id: searchId,
        status: SearchStatus.PROCESSING,
        results: [],
        totalMatches: 0,
        processedAt: new Date().toISOString(),
      };
    }

    // 直接返回已解析的结果
    return {
      id: searchId,
      status: result.status,
      results: result.results ?? [],
      totalMatches: result.totalMatches ?? 0,
      processedAt: result.processedAt ?? new Date().toISOString(),
      ...(result.errorMessage ? { errorMessage: result.errorMessage } : {}),
    };
  }

  /**
   * 获取搜索历史
   */
  async getSearchHistory(
    userId: string,
    queryDto: QuerySearchHistoryDto
  ): Promise<SearchHistoryResponseDto> {
    const { repositoryId, page = 1, limit = 20 } = queryDto;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = { userId };
    if (repositoryId) {
      where.repositoryId = repositoryId;
    }

    const [history, total] = await Promise.all([
      this.prisma.searchHistory.findMany({
        where,
        include: {
          repository: {
            select: {
              id: true,
              name: true,
            },
          },
          snapshot: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.searchHistory.count({ where }),
    ]);

    return {
      history: history.map((item: any) => ({
        id: item.id,
        query: item.query,
        searchType: item.searchType as SearchType,
        resultsCount: item.resultsCount,
        repository: {
          id: item.repository.id,
          name: item.repository.name,
        },
        snapshot: item.snapshot
          ? {
              id: item.snapshot.id,
              title: item.snapshot.title || '未命名快照',
            }
          : undefined,
        createdAt: item.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  /**
   * 删除搜索历史
   */
  async deleteSearchHistory(userId: string, historyId: string): Promise<void> {
    const searchHistory = await this.prisma.searchHistory.findFirst({
      where: {
        id: historyId,
        userId,
      },
    });

    if (!searchHistory) {
      throw new NotFoundException('搜索历史不存在');
    }

    await this.prisma.searchHistory.delete({
      where: { id: historyId },
    });

    // 清理Redis中的搜索结果
    const resultKey = `search:result:${historyId}`;
    await this.redis.del(resultKey);

    this.logger.log(`Deleted search history ${historyId} for user ${userId}`);
  }

  /**
   * 验证仓库访问权限
   */
  private async validateRepositoryAccess(
    repositoryId: string,
    userId: string,
    userRole?: UserRole
  ) {
    const repository = await this.prisma.repository.findUnique({
      where: { id: repositoryId },
      include: {
        owner: {
          select: { id: true, username: true },
        },
      },
    });

    if (!repository) {
      throw new NotFoundException('仓库不存在');
    }

    // 统一权限检查（PUBLIC/INTERNAL 放行；PRIVATE 需成员；OWNER/ADMIN 放行）
    const { canReadRepo } = await import('../auth/utils/access');
    const ok = await canReadRepo(
      this.prisma as any,
      repository as any,
      userId,
      userRole ?? UserRole.USER
    );
    if (!ok) {
      throw new ForbiddenException('无权访问此仓库');
    }

    return repository;
  }

  /**
   * 验证快照访问权限
   */
  private async validateSnapshotAccess(
    snapshotId: string,
    repositoryId: string
  ) {
    const snapshot = await this.prisma.snapshot.findUnique({
      where: { id: snapshotId },
    });

    if (!snapshot) {
      throw new NotFoundException('快照不存在');
    }

    if (snapshot.repoId !== repositoryId) {
      throw new BadRequestException('快照不属于指定仓库');
    }

    if (snapshot.status !== 'READY') {
      throw new BadRequestException('快照尚未准备就绪');
    }

    return snapshot;
  }
}
