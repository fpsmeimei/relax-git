import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CommentAnchorType,
  CommentStatus,
  RepositoryVisibility,
  UserRole,
  Prisma,
} from '@relax-git/shared/generated/prisma-client';
import { PrismaService } from '../database/prisma.service';
import {
  CreateRepositoryCommentDto,
  RepositoryCommentQueryDto,
} from './dto/create-repository-comment.dto';
import { RepositoryCommentDto } from './dto/repository-interaction.dto';

export interface CommunityFeedItem {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  tags: string[];
  language: string | null;
  stars: number;
  viewCount: number;
  commentsCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  visibility: RepositoryVisibility; // 仓库可见性
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
  search?: string;
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
    const {
      cursor,
      limit = 20,
      sort = 'latest',
      language,
      tags = [],
      search,
    } = query;

    // 构建查询条件 - 社区显示所有可见性的仓库（包括私有）
    const where: any = {
      isPublished: true,
      isActive: true,
      // 移除 visibility 过滤，允许所有类型仓库在社区显示
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

    // 搜索过滤（大小写不敏感）：name / description；tags 做等值匹配（has）
    if (search && search.trim()) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { tags: { has: search } },
          ],
        },
      ];
    }

    // 排序逻辑 + 复合游标
    let orderBy: any[] = [{ createdAt: 'desc' }, { id: 'desc' }]; // 默认 latest
    const decodeCursor = (c?: string): any | null => {
      if (!c) return null;
      try {
        const json = Buffer.from(c, 'base64').toString('utf8');
        return JSON.parse(json);
      } catch {
        return null;
      }
    };
    const cur = decodeCursor(cursor);
    if (sort === 'trending') {
      // 趋势：trendingScore desc, id desc
      orderBy = [{ trendingScore: 'desc' }, { id: 'desc' }];
      if (cur && typeof cur.trendingScore === 'number' && cur.id) {
        where.AND = [
          ...(where.AND || []),
          {
            OR: [
              { trendingScore: { lt: cur.trendingScore } },
              {
                AND: [
                  { trendingScore: cur.trendingScore },
                  { id: { lt: cur.id } },
                ],
              },
            ],
          },
        ];
      }
    } else if (sort === 'popular') {
      // 热门：stars desc, id desc（短期可接受，浏览量不参与稳定键）
      orderBy = [{ stars: 'desc' }, { id: 'desc' }];
      if (cur && typeof cur.stars === 'number' && cur.id) {
        where.AND = [
          ...(where.AND || []),
          {
            OR: [
              { stars: { lt: cur.stars } },
              { AND: [{ stars: cur.stars }, { id: { lt: cur.id } }] },
            ],
          },
        ];
      }
    } else {
      // latest：createdAt desc, id desc
      orderBy = [{ createdAt: 'desc' }, { id: 'desc' }];
      if (cur && cur.createdAt && cur.id) {
        const created = new Date(cur.createdAt);
        if (!isNaN(created.getTime())) {
          where.AND = [
            ...(where.AND || []),
            {
              OR: [
                { createdAt: { lt: created } },
                { AND: [{ createdAt: created }, { id: { lt: cur.id } }] },
              ],
            },
          ];
        }
      }
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
    // 计算各仓库评论数（仅统计顶级、项目级、ACTIVE）
    const commentsCountMap = new Map<string, number>();
    try {
      const repoIds = items.map((r: any) => r.id);
      if (repoIds.length > 0) {
        const rows = (await this.prisma.$queryRaw(
          Prisma.sql`
            SELECT s."repoId" AS "repoId", COUNT(*)::bigint AS count
            FROM "Comment" c
            JOIN "BaseSnapshot" s ON c."snapshotId" = s."id"
            WHERE c."anchorType" = ${CommentAnchorType.PROJECT}
              AND c."status" = ${CommentStatus.ACTIVE}
              AND c."parentId" IS NULL
              AND s."repoId" IN (${Prisma.join(repoIds)})
            GROUP BY s."repoId"
          `
        )) as Array<{ repoId: string; count: bigint }>;
        rows.forEach((r: { repoId: string; count: bigint }) =>
          commentsCountMap.set(r.repoId, Number(r.count))
        );
      }
    } catch (e) {
      this.logger.warn(`Failed to aggregate comments count: ${e}`);
    }
    let nextCursor: string | null = null;
    if (hasMore) {
      const last: any = items[items.length - 1];
      if (sort === 'trending') {
        nextCursor = Buffer.from(
          JSON.stringify({
            trendingScore: last.trendingScore ?? 0,
            id: last.id,
          })
        ).toString('base64');
      } else if (sort === 'popular') {
        nextCursor = Buffer.from(
          JSON.stringify({ stars: last.stars ?? 0, id: last.id })
        ).toString('base64');
      } else {
        nextCursor = Buffer.from(
          JSON.stringify({ createdAt: last.createdAt, id: last.id })
        ).toString('base64');
      }
    }

    const feedItems: CommunityFeedItem[] = items.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      coverImage: repo.coverImage,
      tags: repo.tags,
      language: repo.language,
      stars: repo.stars,
      viewCount: repo.viewCount,
      commentsCount: commentsCountMap.get(repo.id) ?? 0,
      publishedAt: repo.publishedAt,
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt,
      visibility: repo.visibility, // 添加可见性字段
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
        OR: [
          { visibility: RepositoryVisibility.PUBLIC },
          { visibility: RepositoryVisibility.INTERNAL },
        ],
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

    // 统计顶级项目级评论总数（ACTIVE）
    const commentsCount = await this.prisma.comment.count({
      where: {
        snapshot: { repoId },
        anchorType: CommentAnchorType.PROJECT,
        status: CommentStatus.ACTIVE,
        parentId: null,
      },
    });

    return {
      ...repository,
      isLiked,
      isCollected,
      commentsCount,
    };
  }

  /**
   * 获取热门标签
   */
  async getPopularTags(
    limit = 20
  ): Promise<Array<{ tag: string; count: number }>> {
    try {
      const rows = (await this.prisma.$queryRaw(
        Prisma.sql`
          SELECT tag, COUNT(*)::bigint AS count
          FROM (
            SELECT unnest("tags") AS tag
            FROM "Repository"
            WHERE "isPublished" = true
              AND "isActive" = true
              AND "visibility" IN (${Prisma.join([
                RepositoryVisibility.PUBLIC,
                RepositoryVisibility.INTERNAL,
              ])})
              AND array_length("tags", 1) > 0
          ) t
          GROUP BY tag
          ORDER BY count DESC
          LIMIT ${limit}
        `
      )) as Array<{ tag: string; count: bigint }>;

      return rows.map(r => ({ tag: r.tag, count: Number(r.count) }));
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
  ): Promise<any> {
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
            repoId,
          },
          anchorType: CommentAnchorType.PROJECT,
          status: CommentStatus.ACTIVE,
        },
      });

      if (!parentComment) {
        throw new BadRequestException('父评论不存在或不可访问');
      }
    }

    // 获取仓库的任意一个基础快照用于关联评论（最新一个即可）
    // 项目级评论需要关联到快照，但不依赖具体的快照内容
    const snapshot = await this.prisma.baseSnapshot.findFirst({
      where: {
        repoId,
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
        _count: {
          select: {
            replies: true,
            likes: true,
          },
        },
      },
    });

    this.logger.log(
      `User ${userId} created repository comment ${comment.id} for repository ${repoId}`
    );

    // 返回前端友好的 DTO
    return {
      id: comment.id,
      content: comment.content,
      likesCount: comment._count?.likes ?? 0,
      isLiked: false,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.author,
      parentId: comment.parentId ?? null,
      replies: [],
    };
  }

  /**
   * 获取仓库评论列表
   */
  async getRepositoryComments(
    repoId: string,
    query: RepositoryCommentQueryDto,
    userId?: string
  ): Promise<{
    comments: RepositoryCommentDto[];
    nextCursor: string | null;
    total: number;
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

    // 游标解码（base64 JSON）
    const decodeCursor = (c?: string): any | null => {
      if (!c) return null;
      try {
        const json = Buffer.from(c, 'base64').toString('utf8');
        return JSON.parse(json);
      } catch {
        return null;
      }
    };
    const cur = decodeCursor(cursor);

    // 构建查询条件
    const where: any = {
      snapshot: {
        repoId,
      },
      anchorType: CommentAnchorType.PROJECT,
      status: CommentStatus.ACTIVE,
      parentId: null, // 只获取顶级评论
    };

    // 排序逻辑（稳定排序）
    let orderBy: any[] = [{ createdAt: 'desc' }, { id: 'desc' }]; // 默认最新
    if (sort === 'oldest') {
      orderBy = [{ createdAt: 'asc' }, { id: 'asc' }];
      if (cur && cur.createdAt && cur.id) {
        const created = new Date(cur.createdAt);
        if (!isNaN(created.getTime())) {
          where.OR = [
            { createdAt: { gt: created } },
            { AND: [{ createdAt: created }, { id: { gt: cur.id } }] },
          ];
        }
      }
    } else if (sort === 'popular') {
      // 关系计数排序：按点赞数降序 + 稳定键
      orderBy = [
        { likes: { _count: 'desc' } },
        { createdAt: 'desc' },
        { id: 'desc' },
      ];
      // 短期不支持基于 _count 的复合游标条件，退化为无 where 游标（可能轻微重复/遗漏）
    } else {
      // latest
      if (cur && cur.createdAt && cur.id) {
        const created = new Date(cur.createdAt);
        if (!isNaN(created.getTime())) {
          where.OR = [
            { createdAt: { lt: created } },
            { AND: [{ createdAt: created }, { id: { lt: cur.id } }] },
          ];
        }
      }
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
        replies: {
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
            replies: true,
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
    let nextCursor: string | null = null;
    if (hasMore) {
      const last: any = items[items.length - 1];
      if (sort === 'popular') {
        // 退化：仅返回最后一条的 id（无 where 复合条件）
        nextCursor = Buffer.from(JSON.stringify({ id: last.id })).toString(
          'base64'
        );
      } else if (sort === 'oldest') {
        nextCursor = Buffer.from(
          JSON.stringify({ createdAt: last.createdAt, id: last.id })
        ).toString('base64');
      } else {
        nextCursor = Buffer.from(
          JSON.stringify({ createdAt: last.createdAt, id: last.id })
        ).toString('base64');
      }
    }

    // 统计总数（用于前端展示/分页信息）
    const total = await this.prisma.comment.count({
      where: {
        snapshot: { repoId },
        anchorType: CommentAnchorType.PROJECT,
        status: CommentStatus.ACTIVE,
        parentId: null, // 仅统计顶级评论以匹配列表
      },
    });

    // 计算当前用户点赞集合（含回复）
    let likedSet: Set<string> = new Set();
    if (userId) {
      const ids = items.flatMap((c: any) => [
        c.id,
        ...(Array.isArray((c as any).replies)
          ? (c as any).replies.map((r: any) => r.id)
          : []),
      ]);
      if (ids.length) {
        const likes = await this.prisma.commentLike.findMany({
          where: { userId, commentId: { in: ids } },
          select: { commentId: true },
        });
        likedSet = new Set(likes.map((x: any) => x.commentId));
      }
    }

    // DTO 映射：补齐 likesCount/isLiked、replies 结构
    const commentsDto = (items as any[]).map((c: any) => ({
      id: c.id,
      content: c.content,
      likesCount: c._count?.likes ?? 0,
      isLiked: likedSet.has(c.id),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      author: c.author,
      parentId: c.parentId ?? null,
      replies: (Array.isArray(c.replies) ? c.replies : []).map((r: any) => ({
        id: r.id,
        content: r.content,
        likesCount: r._count?.likes ?? 0,
        isLiked: likedSet.has(r.id),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        author: r.author,
        parentId: r.parentId ?? null,
      })),
    }));

    return {
      comments: commentsDto as any,
      nextCursor,
      total,
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

    // 软删除评论（Schema 无 deletedAt 字段）
    await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        status: CommentStatus.DELETED,
      },
    });

    this.logger.log(`User ${userId} deleted repository comment ${commentId}`);
  }

  /**
   * 切换评论点赞状态（返回基于 CommentLike 计数的点赞数）
   */
  async toggleCommentLike(
    commentId: string,
    userId: string
  ): Promise<{ isLiked: boolean; likesCount: number }> {
    // 确认评论存在且可见
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment || comment.status === CommentStatus.DELETED) {
      throw new NotFoundException('评论不存在');
    }

    const result = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const existing = await tx.commentLike.findUnique({
          where: { commentId_userId: { commentId, userId } },
        });

        let isLiked = false;
        if (existing) {
          await tx.commentLike.delete({
            where: { commentId_userId: { commentId, userId } },
          });
          isLiked = false;
        } else {
          await tx.commentLike.create({ data: { commentId, userId } });
          isLiked = true;
        }

        const likesCount = await tx.commentLike.count({ where: { commentId } });
        return { isLiked, likesCount };
      }
    );

    return result;
  }
}
