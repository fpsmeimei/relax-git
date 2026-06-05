import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CommentAnchorType,
  CommentStatus,
  UserRole,
} from '@relax-git/shared/generated/prisma-client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RepoAccess } from '../auth/decorators/repo-access.decorator';
import { RepoAccessGuard } from '../auth/guards/repo-access.guard';
import { CommentsService } from './comments.service';
import {
  CommentQueryDto,
  CommentResponseDto,
  CreateCommentDto,
  UpdateCommentDto,
} from './dto';

/**
 * 评论管理控制器
 */
@ApiTags('comments')
@Controller('api/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * 转换评论对象为响应DTO
   */
  private toCommentResponseDto(comment: any): CommentResponseDto {
    return {
      id: comment.id,
      snapshotId: comment.snapshotId,
      authorId: comment.authorId,
      content: comment.content,
      anchorType: comment.anchorType,
      commitSha: comment.commitSha,
      filePath: comment.filePath,
      lineStart: comment.lineStart,
      lineEnd: comment.lineEnd,
      status: comment.status,
      parentId: comment.parentId,
      isResolved: comment.isResolved,
      resolvedAt: comment.resolvedAt?.toISOString(),
      resolvedBy: comment.resolvedBy,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      ...(comment.author && {
        author: {
          id: comment.author.id,
          username: comment.author.username,
          avatar: comment.author.avatar,
        },
      }),
      ...(comment.replyToUser && {
        replyToUser: {
          id: comment.replyToUser.id,
          username: comment.replyToUser.username,
          avatar: comment.replyToUser.avatar,
        },
      }),
      ...(comment.parent && {
        parent: {
          id: comment.parent.id,
          ...(comment.parent.author && {
            author: {
              id: comment.parent.author.id,
              username: comment.parent.author.username,
              avatar: comment.parent.author.avatar,
            },
          }),
        },
      }),
      ...(comment._count?.replies !== undefined && {
        repliesCount: comment._count.replies,
      }),
      ...(comment._count?.likes !== undefined && {
        likesCount: comment._count.likes,
      }),
      ...(comment.liked !== undefined && { liked: !!comment.liked }),
      ...(comment.replies && {
        replies: comment.replies.map((reply: any) =>
          this.toCommentResponseDto(reply)
        ),
      }),
    };
  }

  // 快照评论端点 - 放在动态 :id 之前以避免被匹配到 findOne
  @Get('by-snapshot/:snapshotId')
  @ApiOperation({ summary: '获取快照评论列表' })
  @ApiParam({ name: 'snapshotId', description: '快照ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每页数量',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: '状态过滤',
    enum: CommentStatus,
  })
  @ApiQuery({
    name: 'anchorType',
    required: false,
    description: '锚点类型过滤',
    enum: CommentAnchorType,
  })
  @ApiQuery({
    name: 'isResolved',
    required: false,
    description: '是否已解决',
    type: Boolean,
  })
  @ApiQuery({
    name: 'filePath',
    required: false,
    description: '文件路径过滤',
  })
  @ApiQuery({
    name: 'since',
    required: false,
    description: '仅返回该时间点之后创建的评论（ISO 8601）',
    example: '2025-01-01T00:00:00.000Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取快照评论列表成功',
    schema: {
      type: 'object',
      properties: {
        comments: {
          type: 'array',
          items: { $ref: '#/components/schemas/CommentResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '快照不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权访问此快照',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async getSnapshotComments(
    @CurrentUser('id') userId: string | undefined,
    @CurrentUser('role') userRole: UserRole | undefined,
    @Param('snapshotId') snapshotId: string,
    @Query() queryDto: Partial<CommentQueryDto>
  ): Promise<{
    comments: CommentResponseDto[];
    total: number;
    page: number;
    limit: number;
    repoOwnerId?: string; // 仓库所有者ID
  }> {
    const result = await this.commentsService.getSnapshotComments(
      snapshotId,
      userId,
      userRole || UserRole.USER,
      queryDto
    );

    // 获取仓库所有者ID（从第一个评论中提取）
    const repoOwnerId = (result.comments[0] as any)?.snapshot?.repository
      ?.ownerId;

    return {
      comments: result.comments.map(comment =>
        this.toCommentResponseDto(comment)
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
      repoOwnerId,
    };
  }

  @Get('me/comments')
  @ApiOperation({ summary: '获取当前用户发表的评论列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每页数量',
    example: 20,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/CommentResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getMyComments(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    const result = await this.commentsService.getMyComments(
      userId,
      Number(page) || 1,
      Number(limit) || 20
    );
    // 保持原始 anchorType，让前端根据类型和文件路径判断
    const items = result.items.map((c: any) => ({
      ...c,
      lineNumber: c.lineStart ?? undefined,
    }));
    return {
      items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get('me/replies')
  @ApiOperation({ summary: '获取当前用户发表的回复列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每页数量',
    example: 20,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/CommentResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getMyReplies(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    const result = await this.commentsService.getMyReplies(
      userId,
      Number(page) || 1,
      Number(limit) || 20
    );
    const items = result.items.map((reply: any) => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt,
      filePath: reply.filePath ?? undefined,
      lineNumber: reply.lineStart ?? undefined,
      parentComment: {
        id: reply.parent.id,
        content: reply.parent.content,
        author: reply.parent.author,
      },
      snapshot: reply.snapshot,
    }));
    return {
      items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Post()
  @ApiOperation({ summary: '创建评论' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '评论创建成功',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '参数错误或锚点信息验证失败',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '快照不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权访问此快照',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('comment')
  async create(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() createCommentDto: CreateCommentDto
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.create(
      userId,
      createCommentDto,
      userRole
    );

    return this.toCommentResponseDto(comment);
  }

  // ===== 点赞相关 =====
  @Post(':id/like')
  @ApiOperation({ summary: '点赞评论' })
  @ApiParam({ name: 'id', description: '评论ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '已点赞',
    schema: {
      type: 'object',
      properties: {
        likesCount: { type: 'number' },
        liked: { type: 'boolean' },
      },
    },
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async like(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Param('id') id: string
  ): Promise<{ likesCount: number; liked: boolean }> {
    const res = await this.commentsService.like(id, userId, userRole);
    return res;
  }

  @Delete(':id/like')
  @ApiOperation({ summary: '取消点赞评论' })
  @ApiParam({ name: 'id', description: '评论ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '已取消点赞',
    schema: {
      type: 'object',
      properties: {
        likesCount: { type: 'number' },
        liked: { type: 'boolean' },
      },
    },
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async unlike(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Param('id') id: string
  ): Promise<{ likesCount: number; liked: boolean }> {
    const res = await this.commentsService.unlike(id, userId, userRole);
    return res;
  }

  @Get()
  @ApiOperation({ summary: '获取评论列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每页数量',
    example: 10,
  })
  @ApiQuery({
    name: 'snapshotId',
    required: false,
    description: '快照ID过滤',
  })
  @ApiQuery({
    name: 'diffId',
    required: false,
    description: '对比ID过滤（聚合两个快照的评论）',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: '状态过滤',
    enum: CommentStatus,
  })
  @ApiQuery({
    name: 'anchorType',
    required: false,
    description: '锚点类型过滤',
    enum: CommentAnchorType,
  })
  @ApiQuery({
    name: 'authorId',
    required: false,
    description: '作者ID过滤',
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: '父评论ID过滤',
  })
  @ApiQuery({
    name: 'isResolved',
    required: false,
    description: '是否已解决',
    type: Boolean,
  })
  @ApiQuery({
    name: 'filePath',
    required: false,
    description: '文件路径过滤',
  })
  @ApiQuery({
    name: 'since',
    required: false,
    description: '仅返回该时间点之后创建的评论（ISO 8601）',
    example: '2025-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'repoId',
    required: false,
    description: '仓库ID过滤（用于项目级评论视图）',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取评论列表成功',
    schema: {
      type: 'object',
      properties: {
        comments: {
          type: 'array',
          items: { $ref: '#/components/schemas/CommentResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async findAll(
    @CurrentUser('id') userId: string | undefined,
    @CurrentUser('role') userRole: UserRole | undefined,
    @Query() queryDto: CommentQueryDto
  ): Promise<{
    comments: CommentResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.commentsService.findAll(
      userId,
      userRole || UserRole.USER,
      queryDto
    );

    return {
      comments: result.comments.map(comment =>
        this.toCommentResponseDto(comment)
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取评论详情' })
  @ApiParam({ name: 'id', description: '评论ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取评论详情成功',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '评论不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权访问此评论',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async findOne(
    @CurrentUser('id') userId: string | undefined,
    @CurrentUser('role') userRole: UserRole | undefined,
    @Param('id') id: string
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.findOne(
      id,
      userId,
      userRole || UserRole.USER
    );
    return this.toCommentResponseDto(comment);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新评论' })
  @ApiParam({ name: 'id', description: '评论ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '评论更新成功',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '评论不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权修改此评论',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('comment')
  async update(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Headers('if-match') ifMatch?: string
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.update(
      id,
      userId,
      userRole,
      updateCommentDto,
      ifMatch
    );
    return this.toCommentResponseDto(comment);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除评论（级联删除所有回复）' })
  @ApiParam({ name: 'id', description: '评论ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '评论删除成功（包括所有回复）',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '评论不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权删除此评论',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('comment')
  async remove(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Param('id') id: string,
    @Headers('if-match') ifMatch?: string
  ): Promise<void> {
    await this.commentsService.remove(id, userId, userRole, ifMatch);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: '解决评论' })
  @ApiParam({ name: 'id', description: '评论ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '评论解决成功',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '评论不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权解决此评论',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('comment')
  async resolveComment(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Param('id') id: string
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.resolveComment(
      id,
      userId,
      userRole
    );
    return this.toCommentResponseDto(comment);
  }
}
