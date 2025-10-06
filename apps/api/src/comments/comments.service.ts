import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type {
  BaseSnapshot,
  Comment,
  Prisma,
  Repository,
} from '@relax-git/shared/generated/prisma-client';
import {
  CommentAnchorType,
  CommentStatus,
  RepositoryVisibility,
  TimelineEventType,
  UserRole,
} from '@relax-git/shared/generated/prisma-client';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { CommentQueryDto, CreateCommentDto, UpdateCommentDto } from './dto';

type CommentWithRelations = Prisma.CommentGetPayload<{
  include: {
    author: {
      select: {
        id: true;
        username: true;
        avatar: true;
      };
    };
    snapshot: {
      select: {
        id: true;
        repoId: true;
      };
    };
    _count?: {
      select: {
        likes: true;
        replies: true;
      };
    };
  };
}>;

/**
 * 评论管理服务
 * 负责评论的CRUD操作、权限验证、线程管理和时间线事件集成
 */
@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly websocketGateway: WebSocketGateway
  ) {}

  /**
   * 创建评论
   */
  async create(
    userId: string,
    createCommentDto: CreateCommentDto,
    userRole: UserRole
  ): Promise<Comment> {
    const {
      snapshotId,
      content,
      anchorType,
      commitSha,
      filePath,
      lineStart,
      lineEnd,
      parentId,
      idempotencyKey,
    } = createCommentDto;

    // 验证快照访问权限，并将 session 快照ID 归一化为 baseSnapshotId
    const snapshot = await this.validateSnapshotAccess(
      snapshotId,
      userId,
      userRole
    );
    const baseSnapshotId = snapshot.id; // 归一化后的ID
    // 幂等防重复（可选）：同一用户+同一baseSnapshot下的相同幂等键，仅创建一次
    if (idempotencyKey) {
      const redisKey = `comment:idemp:${userId}:${baseSnapshotId}:${idempotencyKey}`;
      const client = this.redis.getClient();
      const nxResult = await (client as any).set(
        redisKey,
        'PENDING',
        'NX',
        'EX',
        600
      );
      if (nxResult === null) {
        const existing = await this.redis.get<string>(redisKey);
        if (existing && existing !== 'PENDING') {
          const existingComment = await this.prisma.comment.findUnique({
            where: { id: existing },
            include: {
              author: {
                select: { id: true, username: true, avatar: true },
              },
              snapshot: { select: { id: true, repoId: true } },
            },
          });
          if (existingComment) {
            return existingComment as any;
          }
        }
        throw new BadRequestException('重复提交，请稍后重试');
      }
    }

    // 验证锚点信息
    this.validateAnchorInfo(
      anchorType,
      commitSha,
      filePath,
      lineStart,
      lineEnd
    );

    // 验证父评论（如果是回复）
    if (parentId) {
      await this.validateParentComment(parentId, baseSnapshotId);
    }

    // 创建评论（强制写入归一化后的 baseSnapshotId）
    const comment = await this.prisma.comment.create({
      data: {
        snapshotId: baseSnapshotId,
        authorId: userId,
        content: content.trim(),
        anchorType,
        commitSha: commitSha || null,
        filePath: filePath || null,
        lineStart: lineStart || null,
        lineEnd: lineEnd || null,
        parentId: parentId || null,
        status: CommentStatus.PUBLISHED,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        snapshot: {
          select: {
            id: true,
            repoId: true,
          },
        },
      },
    });

    // 创建时间线事件
    await this.createTimelineEvent(
      TimelineEventType.COMMENT_CREATED,
      comment,
      snapshot.repoId
    );
    // 创建成功后将幂等键的值更新为真实评论ID，便于重复请求直接返回已有结果
    if (idempotencyKey) {
      const redisKey = `comment:idemp:${userId}:${baseSnapshotId}:${idempotencyKey}`;
      await this.redis.setex(redisKey, 600, comment.id);
    }

    // WebSocket实时推送（标准化负载：包含 snapshotId，时间使用 ISO 字符串）
    this.websocketGateway.emitNewComment(baseSnapshotId, {
      id: comment.id,
      snapshotId: comment.snapshotId,
      content: comment.content,
      status: comment.status,
      anchorType: comment.anchorType,
      author: comment.author,
      createdAt: comment.createdAt?.toISOString?.() ?? new Date().toISOString(),
      commitSha: comment.commitSha,
      filePath: comment.filePath,
      lineStart: comment.lineStart,
      lineEnd: comment.lineEnd,
    });

    this.logger.log(`Comment created: ${comment.id} by user ${userId}`);

    // 如果是回复，创建“回复通知”，并实时推送给父评论作者
    if (parentId) {
      try {
        const parent = await this.prisma.comment.findUnique({
          where: { id: parentId },
          select: { id: true, authorId: true },
        });
        if (parent && parent.authorId !== userId) {
          const contentSnippet = `${comment.author.username}: ${comment.content.substring(0, 80)}${comment.content.length > 80 ? '...' : ''}`;
          const notification = await this.prisma.notification.create({
            data: {
              userId: parent.authorId,
              actorId: userId,
              type: 'COMMENT_REPLY' as any,
              commentId: comment.id,
              parentId,
              snapshotId: baseSnapshotId,
              content: contentSnippet,
            },
            include: {
              user: { select: { id: true } },
            },
          });

          // WebSocket 推送到"被通知用户"的房间
          this.websocketGateway.emitUserNotification(parent.authorId, {
            id: notification.id,
            type: 'COMMENT_REPLY',
            commentId: comment.id,
            parentId,
            snapshotId: baseSnapshotId,
            commitSha: comment.commitSha,
            filePath: comment.filePath,
            lineStart: comment.lineStart,
            lineEnd: comment.lineEnd,
            content: contentSnippet,
            actor: {
              id: comment.author.id,
              username: comment.author.username,
              avatar: comment.author.avatar,
            },
            createdAt:
              notification.createdAt?.toISOString?.() ??
              new Date().toISOString(),
          });
        }
      } catch (err) {
        this.logger.warn('Failed to create or emit reply notification:', err);
      }
    }

    // 解析 @提及 并创建通知（权限过滤 + 去重 + 排除自己/父作者）
    try {
      const mentionUsernames = Array.from(
        new Set(
          (content.match(/@([a-zA-Z0-9_]+)/g) || [])
            .map(s => s.slice(1))
            .filter(Boolean)
        )
      );
      if (mentionUsernames.length > 0) {
        const users = await this.prisma.user.findMany({
          where: { username: { in: mentionUsernames } },
          select: { id: true, username: true },
        });
        const targetIds = new Set<string>(
          users.map((u: { id: string }) => u.id)
        );
        // 排除自己
        targetIds.delete(userId);
        // 如果为回复，父作者已通过"回复通知"收到，避免重复
        if (parentId) {
          const parentAuthor = await this.prisma.comment.findUnique({
            where: { id: parentId },
            select: { authorId: true },
          });
          if (parentAuthor?.authorId) targetIds.delete(parentAuthor.authorId);
        }
        // 权限过滤：PRIVATE 仅成员/仓库拥有者；PUBLIC/INTERNAL 全部允许
        if (snapshot.repository.visibility === RepositoryVisibility.PRIVATE) {
          const allowed = new Set<string>([snapshot.repository.ownerId]);
          if (targetIds.size > 0) {
            const memberList = await this.prisma.member.findMany({
              where: {
                repoId: snapshot.repoId,
                userId: { in: Array.from(targetIds) },
              },
              select: { userId: true },
            });
            for (const m of memberList) allowed.add(m.userId);
          }
          for (const id of Array.from(targetIds.values())) {
            if (!allowed.has(id)) targetIds.delete(id);
          }
        }
        // 创建通知并推送
        if (targetIds.size > 0) {
          const contentSnippet = `${comment.author.username}: ${comment.content.substring(0, 80)}${comment.content.length > 80 ? '...' : ''}`;
          for (const toUserId of Array.from(targetIds.values())) {
            const notification = await this.prisma.notification.create({
              data: {
                userId: toUserId,
                actorId: userId,
                type: 'MENTION' as any,
                commentId: comment.id,
                parentId,
                snapshotId: baseSnapshotId,
                content: contentSnippet,
              },
            });
            this.websocketGateway.emitUserNotification(toUserId, {
              id: notification.id,
              type: 'MENTION',
              commentId: comment.id,
              parentId,
              snapshotId: baseSnapshotId,
              commitSha: comment.commitSha,
              filePath: comment.filePath,
              lineStart: comment.lineStart,
              lineEnd: comment.lineEnd,
              content: contentSnippet,
              actor: {
                id: comment.author.id,
                username: comment.author.username,
                avatar: comment.author.avatar,
              },
              createdAt:
                (notification as any).createdAt?.toISOString?.() ??
                new Date().toISOString(),
            });
          }
        }
      }
    } catch (err) {
      this.logger.warn('Failed to create or emit mention notifications:', err);
    }

    return comment;
  }

  /**
   * 获取评论列表
   */
  async findAll(
    userId: string | undefined,
    userRole: UserRole,
    queryDto: CommentQueryDto
  ): Promise<{
    comments: Comment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      snapshotId,
      diffId: _diffId,
      status,
      anchorType,
      authorId,
      parentId,
      isResolved,
      filePath,
      since,
      repoId,
    } = queryDto as CommentQueryDto & { diffId?: string };

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    // 快照/对比过滤
    if (snapshotId) {
      // 验证快照访问权限并将ID归一化为 BaseSnapshot ID
      const base = await this.validateSnapshotAccess(
        snapshotId,
        userId,
        userRole
      );
      where.snapshotId = base.id;
    } else {
      // 如果没有指定快照，只显示用户有权限访问的评论
      where.snapshot = {
        OR: [
          { ownerId: userId },
          {
            repository: {
              OR: [
                { ownerId: userId },
                { visibility: RepositoryVisibility.PUBLIC },
                { visibility: RepositoryVisibility.INTERNAL },
              ],
            },
          },
        ],
      };

      // 管理员可以看到所有评论
      if (userRole === UserRole.ADMIN) {
        delete where.snapshot;
      }
      // 如果提供了 repoId，则在非指定快照的情况下按仓库过滤
      if (!snapshotId && repoId) {
        if (where.snapshot) {
          where.snapshot = { AND: [where.snapshot, { repoId }] };
        } else {
          where.snapshot = { repoId };
        }
      }
    }

    // 其他过滤条件
    if (status) where.status = status;
    if (anchorType) where.anchorType = anchorType;
    if (authorId) where.authorId = authorId;
    if (parentId !== undefined) where.parentId = parentId;
    if (isResolved !== undefined) where.isResolved = isResolved;
    // 增量拉取：仅返回 since 之后创建的记录
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        where.createdAt = { gt: sinceDate };
      }
    }

    if (filePath) where.filePath = filePath;

    // 执行查询
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          replies: {
            include: {
              author: {
                select: { id: true, username: true, avatar: true },
              },
              replyToUser: {
                select: { id: true, username: true, avatar: true },
              },
              parent: {
                select: {
                  id: true,
                  author: {
                    select: { id: true, username: true, avatar: true },
                  },
                },
              },
              _count: { select: { likes: true, replies: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
          snapshot: {
            select: {
              id: true,
              repository: {
                select: {
                  id: true,
                  ownerId: true, // 仓库所有者ID
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
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.comment.count({ where }),
    ]);

    // 计算当前用户是否点赞（包含回复）
    const ids = [
      ...comments.map((c: any) => c.id),
      ...comments.flatMap((c: any) => (c.replies || []).map((r: any) => r.id)),
    ];
    if (ids.length > 0 && userId) {
      // 只有在用户已登录时才查询点赞状态
      const liked = await this.prisma.commentLike.findMany({
        where: { commentId: { in: ids }, userId },
        select: { commentId: true },
      });
      const likedSet = new Set(liked.map((x: any) => x.commentId));
      for (const c of comments as any[]) {
        (c as any).liked = likedSet.has((c as any).id);
        if (Array.isArray((c as any).replies)) {
          for (const r of (c as any).replies as any[]) {
            (r as any).liked = likedSet.has((r as any).id);
          }
        }
      }
    } else {
      // 未登录用户，所有评论的点赞状态都是 false
      for (const c of comments as any[]) {
        (c as any).liked = false;
        if (Array.isArray((c as any).replies)) {
          for (const r of (c as any).replies as any[]) {
            (r as any).liked = false;
          }
        }
      }
    }

    return {
      comments,
      total,
      page,
      limit,
    };
  }

  /**
   * 获取评论详情
   */
  async findOne(
    id: string,
    userId: string | undefined,
    userRole: UserRole
  ): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        snapshot: {
          include: {
            repository: true,
          },
        },
        parent: {
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
        replies: {
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
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    // 检查访问权限
    await this.checkCommentAccess(comment, userId, userRole);

    // 标记 liked
    const targetIds = [comment.id, ...comment.replies.map((r: any) => r.id)];
    if (userId) {
      // 只有在用户已登录时才查询点赞状态
      const liked = await this.prisma.commentLike.findMany({
        where: { commentId: { in: targetIds }, userId },
        select: { commentId: true },
      });
      const likedSet = new Set(liked.map((x: any) => x.commentId));
      (comment as any).liked = likedSet.has((comment as any).id);
      for (const r of comment.replies as any[])
        (r as any).liked = likedSet.has((r as any).id);
    } else {
      // 未登录用户，所有评论的点赞状态都是 false
      (comment as any).liked = false;
      for (const r of comment.replies as any[]) (r as any).liked = false;
    }

    return comment;
  }

  /**
   * 更新评论
   */
  async update(
    id: string,
    userId: string,
    userRole: UserRole,
    updateCommentDto: UpdateCommentDto,
    ifMatch?: string
  ): Promise<Comment> {
    const comment = await this.findOne(id, userId, userRole);

    // 检查修改权限
    this.checkCommentOwnership(comment, userId, userRole);

    const { content, status, isResolved } = updateCommentDto;
    const updateData: any = {};

    if (content !== undefined) {
      updateData.content = content.trim();
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (isResolved !== undefined) {
      updateData.isResolved = isResolved;
      if (isResolved) {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = userId;
      } else {
        updateData.resolvedAt = null;
        updateData.resolvedBy = null;
      }
    }

    let updatedComment: CommentWithRelations;

    if (ifMatch) {
      // 提取 ETag 内容，兼容 W/"..." 或 "..." 或裸值
      const raw = ifMatch.replace(/^W\//, '').replace(/^"|"$/g, '');
      const expected = new Date(raw);
      if (isNaN(expected.getTime())) {
        throw new BadRequestException('If-Match 格式无效');
      }
      const res = await this.prisma.comment.updateMany({
        where: { id, updatedAt: expected },
        data: updateData,
      });
      if (res.count === 0) {
        throw new ConflictException('资源已被他人修改');
      }
      const commentWithRelations = await this.prisma.comment.findUnique({
        where: { id },
        include: {
          author: {
            select: { id: true, username: true, avatar: true },
          },
          snapshot: { select: { id: true, repoId: true } },
          _count: { select: { likes: true, replies: true } },
        },
      });
      if (!commentWithRelations) {
        throw new NotFoundException('评论不存在');
      }
      updatedComment = commentWithRelations;
    } else {
      updatedComment = await this.prisma.comment.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: { id: true, username: true, avatar: true },
          },
          snapshot: { select: { id: true, repoId: true } },
          _count: { select: { likes: true, replies: true } },
        },
      });
    }

    // 创建时间线事件
    const eventType = isResolved
      ? TimelineEventType.COMMENT_RESOLVED
      : TimelineEventType.COMMENT_UPDATED;

    await this.createTimelineEvent(
      eventType,
      updatedComment,
      updatedComment.snapshot.repoId
    );

    // WebSocket实时推送
    if (isResolved) {
      this.websocketGateway.emitCommentResolved(updatedComment.snapshotId, {
        id: updatedComment.id,
        snapshotId: updatedComment.snapshotId,
        isResolved: updatedComment.isResolved,
        resolvedAt:
          (updatedComment.resolvedAt as any)?.toISOString?.() ?? undefined,
        resolvedBy: updatedComment.resolvedBy,
        author: updatedComment.author,
      });
    } else {
      this.websocketGateway.emitCommentUpdated(updatedComment.snapshotId, {
        id: updatedComment.id,
        snapshotId: updatedComment.snapshotId,
        content: updatedComment.content,
        status: updatedComment.status,
        updatedAt:
          (updatedComment.updatedAt as any)?.toISOString?.() ??
          new Date().toISOString(),
        author: updatedComment.author,
      });
    }

    this.logger.log(`Comment updated: ${id} by user ${userId}`);
    return updatedComment;
  }

  /**
   * 删除评论（级联删除所有回复）
   */
  async remove(
    id: string,
    userId: string,
    userRole: UserRole,
    ifMatch?: string
  ): Promise<void> {
    const comment = await this.findOne(id, userId, userRole);

    // 检查删除权限
    this.checkCommentOwnership(comment, userId, userRole);

    // 递归获取所有需要删除的评论ID（包括子评论和孙评论）
    const getAllCommentIds = async (parentId: string): Promise<string[]> => {
      const replies = await this.prisma.comment.findMany({
        where: { parentId },
        select: { id: true },
      });

      const ids: string[] = [parentId];
      for (const reply of replies) {
        // 递归获取子评论的所有子评论
        const childIds = await getAllCommentIds(reply.id);
        ids.push(...childIds);
      }
      return ids;
    };

    // 获取所有要删除的评论ID（包括主评论和所有层级的回复）
    const commentIdsToDelete = await getAllCommentIds(id);

    if (ifMatch) {
      const raw = ifMatch.replace(/^W\//, '').replace(/^"|"$/g, '');
      const expected = new Date(raw);
      if (isNaN(expected.getTime())) {
        throw new BadRequestException('If-Match 格式无效');
      }
      // 使用事务批量删除
      const res = await this.prisma.comment.deleteMany({
        where: {
          id: { in: commentIdsToDelete },
          // 只验证主评论的 updatedAt
          ...(commentIdsToDelete[0] === id ? { updatedAt: expected } : {}),
        },
      });
      if (res.count === 0) {
        throw new ConflictException('资源已被他人修改');
      }
    } else {
      // 级联删除所有评论（包括回复）
      // 先删除相关的点赞记录
      await this.prisma.commentLike.deleteMany({
        where: { commentId: { in: commentIdsToDelete } },
      });

      // 批量删除所有评论
      await this.prisma.comment.deleteMany({
        where: { id: { in: commentIdsToDelete } },
      });
    }

    // WebSocket 实时推送：通知快照房间该评论及其回复已删除
    try {
      for (const commentId of commentIdsToDelete) {
        this.websocketGateway.emitCommentDeleted(comment.snapshotId, {
          id: commentId,
          snapshotId: comment.snapshotId,
        });
      }
    } catch (e) {
      this.logger.warn('Failed to emit comment deleted event:', e);
    }

    this.logger.log(
      `Comment deleted: ${id} (with ${commentIdsToDelete.length - 1} replies) by user ${userId}`
    );
  }

  /**
   * 解决评论
   */
  async resolveComment(
    id: string,
    userId: string,
    userRole: UserRole
  ): Promise<Comment> {
    return this.update(id, userId, userRole, { isResolved: true });
  }

  // ===== 点赞相关 =====
  async like(
    id: string,
    userId: string,
    userRole: UserRole
  ): Promise<{ likesCount: number; liked: boolean }> {
    // 访问校验（含仓库权限）
    await this.findOne(id, userId, userRole);
    await this.prisma.commentLike.upsert({
      where: { commentId_userId: { commentId: id, userId } },
      create: { commentId: id, userId },
      update: {},
    });
    const likesCount = await this.prisma.commentLike.count({
      where: { commentId: id },
    });
    return { likesCount, liked: true };
  }

  async unlike(
    id: string,
    userId: string,
    userRole: UserRole
  ): Promise<{ likesCount: number; liked: boolean }> {
    // 访问校验（含仓库权限）
    await this.findOne(id, userId, userRole);
    await this.prisma.commentLike.deleteMany({
      where: { commentId: id, userId },
    });
    const likesCount = await this.prisma.commentLike.count({
      where: { commentId: id },
    });
    return { likesCount, liked: false };
  }

  /**
   * 获取评论线程（包含所有回复）
   */
  async getCommentThread(
    id: string,
    userId: string,
    userRole: UserRole
  ): Promise<Comment> {
    const comment = await this.findOne(id, userId, userRole);

    // 如果是回复评论，获取根评论
    if (comment.parentId) {
      return this.getCommentThread(comment.parentId, userId, userRole);
    }

    return comment;
  }

  /**
   * 获取快照的评论列表
   */
  async getSnapshotComments(
    snapshotId: string,
    userId: string | undefined,
    userRole: UserRole,
    queryDto: Partial<CommentQueryDto> = {}
  ): Promise<{
    comments: Comment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Number(queryDto.page);
    const limit = Number(queryDto.limit);
    return this.findAll(userId, userRole, {
      ...queryDto,
      snapshotId,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: Number.isFinite(limit) && limit > 0 && limit <= 100 ? limit : 10,
    });
  }

  /**
   * 当前用户的评论列表（跨仓库聚合）
   */
  async getMyComments(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { authorId: userId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          snapshot: {
            select: {
              id: true,
              commitSha: true,
              repository: { select: { id: true, name: true } },
            },
          },
          _count: { select: { likes: true, replies: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where: { authorId: userId } }),
    ]);

    // 标记 liked（对自己是否点赞意义不大，但保持一致）
    const ids = items.map((c: any) => c.id);
    if (ids.length && userId) {
      // 只有在用户已登录时才查询点赞状态
      const liked = await this.prisma.commentLike.findMany({
        where: { commentId: { in: ids }, userId },
        select: { commentId: true },
      });
      const likedSet = new Set(liked.map((x: any) => x.commentId));
      for (const c of items as any[])
        (c as any).liked = likedSet.has((c as any).id);
    } else {
      // 未登录用户，所有评论的点赞状态都是 false
      for (const c of items as any[]) (c as any).liked = false;
    }

    return { items, total, page, limit };
  }

  // ===== 私有辅助方法 =====

  /**
   * 验证快照访问权限
   */
  // 将传入的 snapshotId 归一化为 BaseSnapshot ID（支持传入 SessionSnapshot ID）
  private async normalizeBaseSnapshotId(
    snapshotId: string
  ): Promise<string | null> {
    // 1) 直接按 BaseSnapshot 查找
    const base = await this.prisma.baseSnapshot.findUnique({
      where: { id: snapshotId },
      select: { id: true },
    });
    if (base?.id) return base.id;
    // 2) 尝试按 SessionSnapshot 查找并回溯到 Base
    const session = await this.prisma.sessionSnapshot.findUnique({
      where: { id: snapshotId },
      select: { baseSnapshotId: true },
    });
    return session?.baseSnapshotId ?? null;
  }

  private async validateSnapshotAccess(
    snapshotId: string,
    userId: string | undefined,
    userRole: UserRole
  ): Promise<BaseSnapshot & { repository: Repository }> {
    const baseSnapshotId = await this.normalizeBaseSnapshotId(snapshotId);

    if (!baseSnapshotId) {
      throw new NotFoundException('快照不存在');
    }

    const snapshot = await this.prisma.baseSnapshot.findUnique({
      where: { id: baseSnapshotId },
      include: {
        repository: true,
        branch: true,
      },
    });

    if (!snapshot) {
      throw new NotFoundException('快照不存在');
    }

    // 检查快照访问权限
    this.checkSnapshotAccess(snapshot, userId, userRole);

    return snapshot;
  }

  /**
   * 检查快照访问权限
   */
  private checkSnapshotAccess(
    snapshot: BaseSnapshot & { repository: Repository },
    userId: string | undefined,
    userRole: UserRole
  ): void {
    // 管理员可以访问所有快照
    if (userId && userRole === UserRole.ADMIN) {
      return;
    }

    // 仓库所有者可以访问
    if (userId && snapshot.repository.ownerId === userId) {
      return;
    }

    // 公开或只读公开仓库的快照可以访问
    if (
      snapshot.repository.visibility === RepositoryVisibility.PUBLIC ||
      snapshot.repository.visibility === RepositoryVisibility.INTERNAL
    ) {
      return;
    }

    throw new ForbiddenException('无权访问此快照');
  }

  /**
   * 检查评论访问权限
   */
  private async checkCommentAccess(
    comment: Comment & { snapshot: BaseSnapshot & { repository: Repository } },
    userId: string | undefined,
    userRole: UserRole
  ): Promise<void> {
    // 检查快照访问权限
    this.checkSnapshotAccess(comment.snapshot, userId, userRole);
  }

  /**
   * 检查评论所有权
   */
  private checkCommentOwnership(
    comment: Comment,
    userId: string,
    userRole: UserRole
  ): void {
    // 管理员可以修改所有评论
    if (userRole === UserRole.ADMIN) {
      return;
    }

    // 评论作者可以修改
    if (comment.authorId === userId) {
      return;
    }
    throw new ForbiddenException('无权修改此评论');
  }

  /**
   * 验证锚点信息
   */
  private validateAnchorInfo(
    anchorType: CommentAnchorType,
    commitSha?: string,
    filePath?: string,
    lineStart?: number,
    lineEnd?: number
  ): void {
    switch (anchorType) {
      case CommentAnchorType.SNAPSHOT:
        // 快照级评论不需要额外信息
        break;

      case CommentAnchorType.COMMIT:
        if (!commitSha) {
          throw new BadRequestException('提交级评论必须提供commitSha');
        }
        break;

      case CommentAnchorType.FILE:
        if (!commitSha || !filePath) {
          throw new BadRequestException(
            '文件级评论必须提供commitSha和filePath'
          );
        }
        break;

      case CommentAnchorType.LINE:
        if (!commitSha || !filePath || !lineStart) {
          throw new BadRequestException(
            '行级评论必须提供commitSha、filePath和lineStart'
          );
        }
        if (lineEnd && lineEnd < lineStart) {
          throw new BadRequestException('结束行号不能小于开始行号');
        }
        break;

      default:
        throw new BadRequestException('无效的锚点类型');
    }
  }

  /**
   * 验证父评论
   */
  private async validateParentComment(
    parentId: string,
    snapshotId: string
  ): Promise<void> {
    const parentComment = await this.prisma.comment.findUnique({
      where: { id: parentId },
    });

    if (!parentComment) {
      throw new NotFoundException('父评论不存在');
    }

    if (parentComment.snapshotId !== snapshotId) {
      throw new BadRequestException('父评论必须属于同一个快照');
    }

    // 不允许回复回复（限制嵌套深度为1）
    if (parentComment.parentId) {
      throw new BadRequestException('不允许回复回复评论');
    }
  }

  /**
   * 创建时间线事件
   */
  private async createTimelineEvent(
    type: TimelineEventType,
    comment: CommentWithRelations,
    repoId: string
  ): Promise<void> {
    try {
      const payload: any = {
        commentContent:
          comment.content.substring(0, 100) +
          (comment.content.length > 100 ? '...' : ''),
        anchorType: comment.anchorType,
      };

      // 添加锚点相关信息
      if (comment.commitSha) payload.commitSha = comment.commitSha;
      if (comment.filePath) payload.filePath = comment.filePath;
      if (comment.lineStart) payload.lineStart = comment.lineStart;
      if (comment.lineEnd) payload.lineEnd = comment.lineEnd;

      // 添加解决状态信息
      if (type === TimelineEventType.COMMENT_RESOLVED) {
        payload.isResolved = comment.isResolved;
        payload.resolvedAt = comment.resolvedAt;
      }

      const timelineEvent = await this.prisma.timelineEvent.create({
        data: {
          type,
          repoId,
          actorId: comment.authorId,
          commentId: comment.id,
          snapshotId: comment.snapshotId,
          payload,
        },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      // 实时推送时间线事件
      await this.websocketGateway.emitTimelineEvent(
        repoId,
        {
          id: timelineEvent.id,
          type: timelineEvent.type,
          actorId: timelineEvent.actorId,
          commentId: timelineEvent.commentId,
          snapshotId: timelineEvent.snapshotId,
          payload: timelineEvent.payload,
          createdAt: timelineEvent.createdAt.toISOString(),
          actor: timelineEvent.actor,
        },
        {
          immediate: type === TimelineEventType.COMMENT_RESOLVED, // 评论解决事件立即推送
        }
      );
    } catch (error) {
      this.logger.warn(
        `Failed to create timeline event for comment ${comment.id}:`,
        error
      );
      // 时间线事件创建失败不应该影响主流程
    }
  }
}
