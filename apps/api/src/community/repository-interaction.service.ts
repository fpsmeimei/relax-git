import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateRepositoryCommentDto,
  RepositoryCollectionResponseDto,
  RepositoryCommentDto,
  RepositoryCommentsResponseDto,
  RepositoryLikeResponseDto,
} from './dto/repository-interaction.dto';

/**
 * 仓库互动服务
 * 处理点赞、收藏、评论等社区互动功能
 */
@Injectable()
export class RepositoryInteractionService {
  private readonly logger = new Logger(RepositoryInteractionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 切换仓库点赞状态
   */
  async toggleRepositoryLike(
    repoId: string,
    userId: string
  ): Promise<RepositoryLikeResponseDto> {
    // 检查仓库是否存在且可访问
    const repository = await this.prisma.repository.findFirst({
      where: {
        id: repoId,
        isActive: true,
        OR: [{ visibility: 'PUBLIC' }, { visibility: 'INTERNAL' }],
      },
    });

    if (!repository) {
      throw new NotFoundException('仓库不存在或不可访问');
    }

    // 检查是否已点赞
    const existingLike = await this.prisma.repositoryLike.findUnique({
      where: {
        repoId_userId: {
          repoId,
          userId,
        },
      },
    });

    let isLiked: boolean;
    let likesCountChange: number;

    if (existingLike) {
      // 取消点赞
      await this.prisma.repositoryLike.delete({
        where: { id: existingLike.id },
      });
      isLiked = false;
      likesCountChange = -1;
    } else {
      // 添加点赞
      await this.prisma.repositoryLike.create({
        data: {
          repoId,
          userId,
        },
      });
      isLiked = true;
      likesCountChange = 1;
    }

    // 更新仓库点赞数缓存
    const updatedRepo = await this.prisma.repository.update({
      where: { id: repoId },
      data: {
        stars: {
          increment: likesCountChange,
        },
      },
    });

    return {
      isLiked,
      likesCount: updatedRepo.stars,
    };
  }

  /**
   * 切换仓库收藏状态
   */
  async toggleRepositoryCollection(
    repoId: string,
    userId: string
  ): Promise<RepositoryCollectionResponseDto> {
    // 检查仓库是否存在且可访问
    const repository = await this.prisma.repository.findFirst({
      where: {
        id: repoId,
        isActive: true,
        OR: [{ visibility: 'PUBLIC' }, { visibility: 'INTERNAL' }],
      },
    });

    if (!repository) {
      throw new NotFoundException('仓库不存在或不可访问');
    }

    // 检查是否已收藏
    const existingCollection =
      await this.prisma.repositoryCollection.findUnique({
        where: {
          repoId_userId: {
            repoId,
            userId,
          },
        },
      });

    let isCollected: boolean;

    if (existingCollection) {
      // 取消收藏
      await this.prisma.repositoryCollection.delete({
        where: { id: existingCollection.id },
      });
      isCollected = false;
    } else {
      // 添加收藏
      await this.prisma.repositoryCollection.create({
        data: {
          repoId,
          userId,
        },
      });
      isCollected = true;
    }

    // 统计总收藏数
    const collectionsCount = await this.prisma.repositoryCollection.count({
      where: { repoId },
    });

    return {
      isCollected,
      collectionsCount,
    };
  }

  /**
   * 创建仓库评论
   */
  async createRepositoryComment(
    repoId: string,
    userId: string,
    dto: CreateRepositoryCommentDto
  ): Promise<RepositoryCommentDto> {
    // 检查仓库是否存在且可访问
    const repository = await this.prisma.repository.findFirst({
      where: {
        id: repoId,
        isActive: true,
        OR: [{ visibility: 'PUBLIC' }, { visibility: 'INTERNAL' }],
      },
    });

    if (!repository) {
      throw new NotFoundException('仓库不存在或不可访问');
    }

    // 如果是回复，检查父评论是否存在
    if (dto.parentId) {
      const parentComment = await this.prisma.comment.findFirst({
        where: {
          id: dto.parentId,
          anchorType: 'REPOSITORY',
          anchorKey: repoId,
        },
      });

      if (!parentComment) {
        throw new BadRequestException('父评论不存在');
      }
    }

    // 创建评论
    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        authorId: userId,
        anchorType: 'REPOSITORY',
        anchorKey: repoId,
        parentId: dto.parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return {
      id: comment.id,
      content: comment.content,
      likesCount: comment.likesCount,
      isLiked: false, // 新创建的评论当前用户肯定没点赞
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.author,
      parentId: comment.parentId,
    };
  }

  /**
   * 获取仓库评论列表
   */
  async getRepositoryComments(
    repoId: string,
    userId?: string,
    cursor?: string,
    limit = 20
  ): Promise<RepositoryCommentsResponseDto> {
    // 检查仓库是否存在且可访问
    const repository = await this.prisma.repository.findFirst({
      where: {
        id: repoId,
        isActive: true,
        OR: [{ visibility: 'PUBLIC' }, { visibility: 'INTERNAL' }],
      },
    });

    if (!repository) {
      throw new NotFoundException('仓库不存在或不可访问');
    }

    // 构建查询条件
    const where: any = {
      anchorType: 'REPOSITORY',
      anchorKey: repoId,
      parentId: null, // 只获取顶级评论
    };

    if (cursor) {
      where.id = { lt: cursor };
    }

    // 查询评论
    const comments = await this.prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        replies: {
          orderBy: { createdAt: 'asc' },
          take: 3, // 只显示前3个回复
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    const hasMore = comments.length > limit;
    const items = hasMore ? comments.slice(0, -1) : comments;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    // 如果用户已登录，检查点赞状态
    let userLikes: Set<string> = new Set();
    if (userId) {
      const allCommentIds = items.flatMap((comment: any) => [
        comment.id,
        ...comment.replies.map((reply: any) => reply.id),
      ]);

      const likes = await this.prisma.commentLike.findMany({
        where: {
          userId,
          commentId: { in: allCommentIds },
        },
        select: { commentId: true },
      });

      userLikes = new Set(likes.map((like: any) => like.commentId));
    }

    // 转换为DTO格式
    const commentsDto: RepositoryCommentDto[] = items.map((comment: any) => ({
      id: comment.id,
      content: comment.content,
      likesCount: comment.likesCount,
      isLiked: userLikes.has(comment.id),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.author,
      parentId: comment.parentId,
      replies: comment.replies.map((reply: any) => ({
        id: reply.id,
        content: reply.content,
        likesCount: reply.likesCount,
        isLiked: userLikes.has(reply.id),
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        author: reply.author,
        parentId: reply.parentId,
      })),
    }));

    // 统计总评论数
    const total = await this.prisma.comment.count({
      where: {
        anchorType: 'REPOSITORY',
        anchorKey: repoId,
      },
    });

    return {
      comments: commentsDto,
      total,
      nextCursor,
      hasMore,
    };
  }

  /**
   * 切换评论点赞状态
   */
  async toggleCommentLike(
    commentId: string,
    userId: string
  ): Promise<{ isLiked: boolean; likesCount: number }> {
    // 检查评论是否存在
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    // 检查是否已点赞
    const existingLike = await this.prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    let isLiked: boolean;
    let likesCountChange: number;

    if (existingLike) {
      // 取消点赞
      await this.prisma.commentLike.delete({
        where: { id: existingLike.id },
      });
      isLiked = false;
      likesCountChange = -1;
    } else {
      // 添加点赞
      await this.prisma.commentLike.create({
        data: {
          commentId,
          userId,
        },
      });
      isLiked = true;
      likesCountChange = 1;
    }

    // 更新评论点赞数缓存
    const updatedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        likesCount: {
          increment: likesCountChange,
        },
      },
    });

    return {
      isLiked,
      likesCount: updatedComment.likesCount,
    };
  }
}
