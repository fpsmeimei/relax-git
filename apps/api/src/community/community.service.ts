import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Comment,
  CommentAnchorType,
  CommentStatus,
  RepositoryVisibility,
  UserRole,
} from '@relax-git/shared/generated/prisma-client';
import { PrismaService } from '../database/prisma.service';
import {
  CreateRepositoryCommentDto,
  RepositoryCommentQueryDto,
} from './dto/create-repository-comment.dto';

export interface CommunityFeedItem {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  tags: string[];
  language: string | null;
  stars: number;
  viewCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    username: string;
    avatar: string | null;
  };
  isLiked?: boolean; // 当前用户是否已点赞
  isCollected?: boolean; // 当前用户是否已收藏
}

export interface CommunityFeedQuery {
  cursor?: string;
  limit?: number;
  sort?: 'latest' | 'trending' | 'popular';
  language?: string;
  tags?: string[];
}

/**
 * 社区服务
 * 负责社区功能的核心逻辑：feed流、点赞、收藏、浏览统计等
 */
@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  /**
   * 获取社区feed流
   */
  async getCommunityFeed(
    query: CommunityFeedQuery,
    userId?: string
  ): Promise<{
    items: CommunityFeedItem[];
    nextCursor: string | null;
    hasMore: boolean;
  }> {
    const { cursor, limit = 20, sort = 'latest', language, tags = [] } = query;

    // 构建查询条件
    const where: any = {
      isPublished: true,
      isActive: true,
      OR: [
        { visibility: RepositoryVisibility.PUBLIC },
        { visibility: RepositoryVisibility.INTERNAL },
      ],
    };

    // 语言过滤
    if (language) {
      where.language = language;
    }

    // 标签过滤
    if (tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    // 游标分页
    if (cursor) {
      where.id = {
        lt: cursor,
      };
    }

    // 排序逻辑
    let orderBy: any = { createdAt: 'desc' }; // 默认最新
    if (sort === 'trending') {
      // 趋势排序：使用热度分数
      orderBy = [{ trendingScore: 'desc' }, { createdAt: 'desc' }];
    } else if (sort === 'popular') {
      // 热门排序：总点赞数和浏览量
      orderBy = [{ stars: 'desc' }, { viewCount: 'desc' }];
    }

    const repositories = await this.prisma.repository.findMany({
      where,
      orderBy,
      take: limit + 1, // 多取一个用于判断是否有更多
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        // 如果用户已登录，查询点赞和收藏状态
        ...(userId
          ? {
              likes: {
                where: { userId },
                select: { id: true },
              },
              collections: {
                where: { userId },
                select: { id: true },
              },
            }
          : {}),
      },
    });

    const hasMore = repositories.length > limit;
    const items = repositories.slice(0, limit);
    const nextCursor = hasMore ? items[items.length - 1]?.id || null : null;

    const feedItems: CommunityFeedItem[] = items.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      coverImage: repo.coverImage,
      tags: repo.tags,
      language: repo.language,
      stars: repo.stars,
      viewCount: repo.viewCount,
      publishedAt: repo.publishedAt,
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt,
      owner: repo.owner,
      ...(userId
        ? {
            isLiked: (repo as any).likes?.length > 0,
            isCollected: (repo as any).collections?.length > 0,
          }
        : {}),
    }));

    return {
      items: feedItems,
      nextCursor,
      hasMore,
    };
  }

  /**
   * 记录仓库浏览
   */
  async recordRepositoryView(
    repoId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      // 检查仓库是否存在
      const repository = await this.prisma.repository.findFirst({
        where: {
          id: repoId,
          isActive: true,
        },
      });

      if (!repository) {
        return; // 静默失败，不影响用户体验
      }

      // 防重复浏览：同一用户或IP在1小时内的重复浏览不计数
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const existingView = await this.prisma.repositoryView.findFirst({
        where: {
          repoId,
          viewedAt: {
            gte: oneHourAgo,
          },
          ...(userId ? { userId } : { ipAddress }),
        },
      });

      if (existingView) {
        return; // 重复浏览，不记录
      }

      // 创建浏览记录并更新统计
      await this.prisma.$transaction([
        this.prisma.repositoryView.create({
          data: {
            repoId,
            userId,
            ipAddress,
            userAgent,
          },
        }),
        this.prisma.repository.update({
          where: { id: repoId },
          data: {
            viewCount: {
              increment: 1,
            },
          },
        }),
      ]);

      this.logger.log(
        `Recorded view for repository ${repoId} by ${userId || ipAddress}`
      );
    } catch (error) {
      this.logger.error(`Failed to record repository view: ${error}`);
      // 静默失败，不影响用户体验
    }
  }

  /**
   * 获取仓库详情（包含用户互动状态）
   */
  async getRepositoryDetail(repoId: string, userId?: string): Promise<any> {
    const repository = await this.prisma.repository.findFirst({
      where: {
        id: repoId,
        isActive: true,
        OR: [{ visibility: 'PUBLIC' }, { visibility: 'INTERNAL' }],
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!repository) {
      throw new NotFoundException('仓库不存在或不可访问');
    }

    // 如果用户已登录，获取互动状态
    let isLiked = false;
    let isCollected = false;

    if (userId) {
      const [like, collection] = await Promise.all([
        this.prisma.repositoryLike.findUnique({
          where: {
            repoId_userId: {
              repoId,
              userId,
            },
          },
        }),
        this.prisma.repositoryCollection.findUnique({
          where: {
            repoId_userId: {
              repoId,
              userId,
            },
          },
        }),
      ]);

      isLiked = !!like;
      isCollected = !!collection;
    }

    return {
      ...repository,
      isLiked,
      isCollected,
    };
  }

  /**
   * 获取热门标签
   */
  async getPopularTags(
    limit = 20
  ): Promise<Array<{ tag: string; count: number }>> {
    try {
      // 获取所有公开且已发布的仓库
      const repositories = await this.prisma.repository.findMany({
        where: {
          isPublished: true,
          isActive: true,
          OR: [
            { visibility: RepositoryVisibility.PUBLIC },
            { visibility: RepositoryVisibility.INTERNAL },
          ],
          tags: {
            isEmpty: false,
          },
        },
        select: {
          tags: true,
        },
      });

      // 统计标签出现次数
      const tagCounts = new Map<string, number>();
      repositories.forEach((repo: { tags: string[] }) => {
        repo.tags.forEach((tag: string) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });

      // 排序并返回前N个
      return Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      this.logger.error('获取热门标签失败:', error);
      return [];
    }
  }

  /**
   * 获取热门编程语言
   */
  async getPopularLanguages(
    limit = 10
  ): Promise<Array<{ language: string; count: number }>> {
    const result = await this.prisma.repository.groupBy({
      by: ['language'],
      where: {
        isPublished: true,
        isActive: true,
        language: {
          not: null,
        },
        OR: [
          { visibility: RepositoryVisibility.PUBLIC },
          { visibility: RepositoryVisibility.INTERNAL },
        ],
      },
      _count: {
        language: true,
      },
      orderBy: {
        _count: {
          language: 'desc',
        },
      },
      take: limit,
    });

    return result.map((item: any) => ({
      language: item.language!,
      count: item._count.language,
    }));
  }

  /**
   * 创建仓库评论
   */
  async createRepositoryComment(
    repoId: string,
    userId: string,
    dto: CreateRepositoryCommentDto
  ): Promise<Comment> {
    // 检查仓库是否存在且可访问
    const repository = await this.prisma.repository.findFirst({
      where: {
        id: repoId,
        isActive: true,
        OR: [
          { visibility: RepositoryVisibility.PUBLIC },
          { visibility: RepositoryVisibility.INTERNAL },
        ],
      },
    });

    if (!repository) {
      throw new NotFoundException('仓库不存在或不可访问');
    }

    // 如果是回复评论，检查父评论是否存在
    if (dto.parentId) {
      const parentComment = await this.prisma.comment.findFirst({
        where: {
          id: dto.parentId,
          snapshot: {
            repositoryId: repoId,
          },
          anchorType: CommentAnchorType.PROJECT,
          status: CommentStatus.ACTIVE,
        },
      });

      if (!parentComment) {
        throw new BadRequestException('父评论不存在或不可访问');
      }
    }

    // 获取仓库的任意一个快照用于关联评论
    // 项目级评论需要关联到快照，但不依赖具体的快照内容
    const snapshot = await this.prisma.snapshot.findFirst({
      where: {
        repositoryId: repoId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!snapshot) {
      throw new BadRequestException('仓库尚未创建快照，无法评论');
    }

    // 创建评论
    const comment = await this.prisma.comment.create({
      data: {
        snapshotId: snapshot.id,
        authorId: userId,
        content: dto.content,
        anchorType: CommentAnchorType.PROJECT,
        parentId: dto.parentId,
        status: CommentStatus.ACTIVE,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        parent: {
          select: {
            id: true,
            authorId: true,
            content: true,
            author: {
              select: {
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            children: true,
            likes: true,
          },
        },
      },
    });

    this.logger.log(
      `User ${userId} created repository comment ${comment.id} for repository ${repoId}`
    );

    return comment;
  }

  /**
   * 获取仓库评论列表
   */
  async getRepositoryComments(
    repoId: string,
    query: RepositoryCommentQueryDto,
    userId?: string
  ): Promise<{
    comments: Comment[];
    nextCursor: string | null;
    hasMore: boolean;
  }> {
    // 检查仓库是否存在且可访问
    const repository = await this.prisma.repository.findFirst({
      where: {
        id: repoId,
        isActive: true,
        OR: [
          { visibility: RepositoryVisibility.PUBLIC },
          { visibility: RepositoryVisibility.INTERNAL },
        ],
      },
    });

    if (!repository) {
      throw new NotFoundException('仓库不存在或不可访问');
    }

    const { cursor, limit = 20, sort = 'latest' } = query;

    // 构建查询条件
    const where: any = {
      snapshot: {
        repositoryId: repoId,
      },
      anchorType: CommentAnchorType.PROJECT,
      status: CommentStatus.ACTIVE,
      parentId: null, // 只获取顶级评论
    };

    // 游标分页
    if (cursor) {
      where.id = {
        lt: cursor,
      };
    }

    // 排序逻辑
    let orderBy: any = { createdAt: 'desc' }; // 默认最新
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'popular') {
      orderBy = [{ likesCount: 'desc' }, { createdAt: 'desc' }];
    }

    const comments = await this.prisma.comment.findMany({
      where,
      orderBy,
      take: limit + 1, // 多取一个用于判断是否有更多
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        children: {
          where: {
            status: CommentStatus.ACTIVE,
          },
          orderBy: {
            createdAt: 'asc',
          },
          take: 3, // 只显示前3个回复
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
        },
        _count: {
          select: {
            children: true,
            likes: true,
          },
        },
        // 如果用户已登录，查询点赞状态
        ...(userId
          ? {
              likes: {
                where: { userId },
                select: { id: true },
              },
            }
          : {}),
      },
    });

    const hasMore = comments.length > limit;
    const items = comments.slice(0, limit);
    const nextCursor = hasMore ? items[items.length - 1]?.id || null : null;

    return {
      comments: items as Comment[],
      nextCursor,
      hasMore,
    };
  }

  /**
   * 删除仓库评论
   */
  async deleteRepositoryComment(
    commentId: string,
    userId: string,
    userRole: UserRole
  ): Promise<void> {
    // 查找评论
    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        anchorType: CommentAnchorType.PROJECT,
        status: CommentStatus.ACTIVE,
      },
      include: {
        snapshot: {
          include: {
            repository: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    // 权限检查：只有评论作者、仓库所有者或管理员可以删除
    const canDelete =
      comment.authorId === userId ||
      comment.snapshot.repository.ownerId === userId ||
      userRole === UserRole.ADMIN;

    if (!canDelete) {
      throw new BadRequestException('没有权限删除此评论');
    }

    // 软删除评论
    await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        status: CommentStatus.DELETED,
        deletedAt: new Date(),
      },
    });

    this.logger.log(`User ${userId} deleted repository comment ${commentId}`);
  }
}
