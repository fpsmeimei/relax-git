import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RepositoryInteractionService } from './repository-interaction.service';
import { CommunityService } from './community.service';
import {
  RepositoryLikeResponseDto,
  RepositoryCollectionResponseDto,
  CreateRepositoryCommentDto,
  RepositoryCommentDto,
  RepositoryCommentsResponseDto,
} from './dto/repository-interaction.dto';

/**
 * 仓库互动控制器
 * 处理仓库的点赞、收藏、评论等社区互动功能
 */
@ApiTags('仓库互动')
@Controller('api/repositories')
export class RepositoryInteractionController {
  private readonly logger = new Logger(RepositoryInteractionController.name);

  constructor(
    private readonly repositoryInteractionService: RepositoryInteractionService,
    private readonly communityService: CommunityService
  ) {}

  /**
   * 切换仓库点赞状态
   */
  @Post(':id/like')
  @ApiOperation({
    summary: '切换仓库点赞状态',
    description: '点赞或取消点赞仓库',
  })
  @ApiParam({ name: 'id', description: '仓库ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '操作成功',
    type: RepositoryLikeResponseDto,
  })
  async toggleLike(
    @CurrentUser('id') userId: string,
    @Param('id') repoId: string
  ): Promise<RepositoryLikeResponseDto> {
    return this.repositoryInteractionService.toggleRepositoryLike(
      repoId,
      userId
    );
  }

  /**
   * 切换仓库收藏状态
   */
  @Post(':id/collect')
  @ApiOperation({
    summary: '切换仓库收藏状态',
    description: '收藏或取消收藏仓库',
  })
  @ApiParam({ name: 'id', description: '仓库ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '操作成功',
    type: RepositoryCollectionResponseDto,
  })
  async toggleCollection(
    @CurrentUser('id') userId: string,
    @Param('id') repoId: string
  ): Promise<RepositoryCollectionResponseDto> {
    return this.repositoryInteractionService.toggleRepositoryCollection(
      repoId,
      userId
    );
  }

  /**
   * 创建仓库评论
   */
  @Post(':id/comments')
  @ApiOperation({
    summary: '创建仓库评论',
    description: '为仓库创建新评论或回复已有评论',
  })
  @ApiParam({ name: 'id', description: '仓库ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '评论创建成功',
    type: RepositoryCommentDto,
  })
  async createComment(
    @CurrentUser('id') userId: string,
    @Param('id') repoId: string,
    @Body() dto: CreateRepositoryCommentDto
  ): Promise<RepositoryCommentDto> {
    this.logger.warn(
      '[DEPRECATED] 使用了旧端点 /api/repositories/:id/comments，已转发至 /api/community/repositories/:id/comments'
    );
    // 转发到社区服务，保持响应结构
    const result = (await this.communityService.createRepositoryComment(
      repoId,
      userId,
      dto as any
    )) as any;
    return result as RepositoryCommentDto;
  }

  /**
   * 获取仓库评论列表
   */
  @Get(':id/comments')
  @ApiOperation({
    summary: '获取仓库评论列表',
    description: '获取仓库的评论列表，支持分页',
  })
  @ApiParam({ name: 'id', description: '仓库ID' })
  @ApiQuery({ name: 'cursor', description: '分页游标', required: false })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: RepositoryCommentsResponseDto,
  })
  async getComments(
    @CurrentUser('id') userId: string | undefined,
    @Param('id') repoId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string
  ): Promise<RepositoryCommentsResponseDto> {
    this.logger.warn(
      '[DEPRECATED] 使用了旧端点 GET /api/repositories/:id/comments，已转发至 /api/community/repositories/:id/comments'
    );
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const { comments, nextCursor, hasMore, total } =
      await this.communityService.getRepositoryComments(
        repoId,
        { cursor, limit: limitNum, sort: 'latest' },
        userId
      );
    return {
      comments: comments as any,
      nextCursor: nextCursor ?? null,
      hasMore,
      total,
    };
  }

  /**
   * 切换评论点赞状态
   */
  @Post('comments/:commentId/like')
  @ApiOperation({
    summary: '切换评论点赞状态',
    description: '点赞或取消点赞评论',
  })
  @ApiParam({ name: 'commentId', description: '评论ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '操作成功',
    schema: {
      type: 'object',
      properties: {
        isLiked: { type: 'boolean', description: '是否已点赞' },
        likesCount: { type: 'number', description: '点赞数' },
      },
    },
  })
  async toggleCommentLike(
    @CurrentUser('id') userId: string,
    @Param('commentId') commentId: string
  ): Promise<{ isLiked: boolean; likesCount: number }> {
    this.logger.warn(
      '[DEPRECATED] 使用了旧端点 POST /api/repositories/comments/:commentId/like，已转发至 /api/community/repositories/comments/:commentId/like'
    );
    return this.communityService.toggleCommentLike(commentId, userId);
  }
}
