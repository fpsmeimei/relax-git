import { Controller, Post, Get, Body, Param, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RepositoryInteractionService } from './repository-interaction.service';
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
@Controller('repositories')
export class RepositoryInteractionController {
  constructor(
    private readonly repositoryInteractionService: RepositoryInteractionService
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
    return this.repositoryInteractionService.createRepositoryComment(
      repoId,
      userId,
      dto
    );
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
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.repositoryInteractionService.getRepositoryComments(
      repoId,
      userId,
      cursor,
      limitNum
    );
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
    return this.repositoryInteractionService.toggleCommentLike(
      commentId,
      userId
    );
  }
}
