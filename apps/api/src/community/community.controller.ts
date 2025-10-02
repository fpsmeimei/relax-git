import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import {
  CommunityFeedItem,
  CommunityFeedQuery,
  CommunityService,
} from './community.service';
import {
  CreateRepositoryCommentDto,
  RepositoryCommentQueryDto,
} from './dto/create-repository-comment.dto';

/**
 * 社区控制器
 * 处理社区功能相关的API请求
 */
@ApiTags('Community')
@Controller('api/community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  /**
   * 获取社区feed流
   */
  @Get('feed')
  @Public() // 支持匿名访问
  @ApiOperation({
    summary: '获取社区feed流',
    description: '获取社区中公开的仓库列表，支持分页、排序和过滤',
  })
  @ApiQuery({ name: 'cursor', required: false, description: '分页游标' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每页数量，默认20，最大100',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['latest', 'trending', 'popular'],
    description: '排序方式：latest(最新)、trending(趋势)、popular(热门)',
  })
  @ApiQuery({ name: 'language', required: false, description: '编程语言过滤' })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: '标签过滤，多个标签用逗号分隔',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: '搜索关键词（name/description：不区分大小写；tags：等值匹配）',
  })
  @ApiOkResponse({
    description: '社区feed流数据',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              coverImage: { type: 'string', nullable: true },
              tags: { type: 'array', items: { type: 'string' } },
              language: { type: 'string', nullable: true },
              stars: { type: 'number' },
              viewCount: { type: 'number' },
              commentsCount: { type: 'number' },
              publishedAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              owner: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  avatar: { type: 'string', nullable: true },
                },
              },
              isLiked: { type: 'boolean' },
              isCollected: { type: 'boolean' },
            },
          },
        },
        nextCursor: { type: 'string', nullable: true },
        hasMore: { type: 'boolean' },
      },
    },
  })
  async getCommunityFeed(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: 'latest' | 'trending' | 'popular',
    @Query('language') language?: string,
    @Query('tags') tags?: string,
    @Query('search') search?: string,
    @CurrentUser('id') userId?: string
  ): Promise<{
    items: CommunityFeedItem[];
    nextCursor: string | null;
    hasMore: boolean;
  }> {
    const query: CommunityFeedQuery = {
      cursor,
      limit: limit ? Math.min(parseInt(limit, 10), 100) : 20,
      sort: sort || 'latest',
      language,
      tags: tags
        ? tags
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean)
        : [],
      search,
    };

    return this.communityService.getCommunityFeed(query, userId);
  }

  /**
   * 获取仓库详情
   */
  @Get('repositories/:id')
  @Public()
  @ApiOperation({
    summary: '获取仓库详情',
    description: '获取仓库详细信息，包含用户互动状态',
  })
  @ApiParam({ name: 'id', description: '仓库ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
  })
  async getRepositoryDetail(
    @CurrentUser('id') userId: string | undefined,
    @Param('id') repoId: string
  ): Promise<any> {
    return this.communityService.getRepositoryDetail(repoId, userId);
  }

  /**
   * 记录仓库浏览
   */
  @Post('repositories/:id/view')
  @Public() // 支持匿名访问
  @ApiOperation({
    summary: '记录仓库浏览',
    description: '记录用户浏览仓库的行为，用于统计浏览量',
  })
  @ApiParam({ name: 'id', description: '仓库ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '浏览记录成功',
  })
  async recordRepositoryView(
    @Param('id') repoId: string,
    @CurrentUser('id') userId?: string,
    @Req() req?: any
  ): Promise<{ success: boolean }> {
    const fwd = (req?.headers?.['x-forwarded-for'] as string | undefined) || '';
    const ipFromFwd = fwd
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)[0];
    const ipAddress =
      ipFromFwd || (req as any)?.ip || (req as any)?.connection?.remoteAddress;
    const userAgent =
      (req?.headers?.['user-agent'] as string | undefined) || undefined;

    await this.communityService.recordRepositoryView(
      repoId,
      userId,
      ipAddress,
      userAgent
    );

    return { success: true };
  }

  /**
   * 获取热门标签
   */
  @Get('tags/popular')
  @ApiOperation({
    summary: '获取热门标签',
    description: '获取社区中最热门的标签列表',
  })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量，默认20' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '热门标签列表',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tag: { type: 'string' },
          count: { type: 'number' },
        },
      },
    },
  })
  async getPopularTags(
    @Query('limit') limit?: string
  ): Promise<Array<{ tag: string; count: number }>> {
    const limitNum = limit ? Math.min(parseInt(limit, 10), 50) : 20;
    return this.communityService.getPopularTags(limitNum);
  }

  /**
   * 获取热门编程语言
   */
  @Get('languages/popular')
  @ApiOperation({
    summary: '获取热门编程语言',
    description: '获取社区中最热门的编程语言列表',
  })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量，默认10' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '热门编程语言列表',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          language: { type: 'string' },
          count: { type: 'number' },
        },
      },
    },
  })
  async getPopularLanguages(
    @Query('limit') limit?: string
  ): Promise<Array<{ language: string; count: number }>> {
    const limitNum = limit ? Math.min(parseInt(limit, 10), 20) : 10;
    return this.communityService.getPopularLanguages(limitNum);
  }

  /**
   * 获取仓库评论列表
   */
  @Get('repositories/:id/comments')
  @Public() // 支持匿名访问
  @ApiOperation({
    summary: '获取仓库评论列表',
    description: '获取指定仓库的项目级评论列表',
  })
  @ApiParam({ name: 'id', description: '仓库ID' })
  @ApiQuery({ name: 'cursor', required: false, description: '分页游标' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每页数量，默认20，最大100',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['latest', 'oldest', 'popular'],
    description: '排序方式：latest(最新)、oldest(最旧)、popular(热门)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '仓库评论列表',
  })
  async getRepositoryComments(
    @Param('id') repoId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: 'latest' | 'oldest' | 'popular',
    @CurrentUser('id') userId?: string
  ) {
    const query: RepositoryCommentQueryDto = {
      cursor,
      limit: limit ? Math.min(parseInt(limit, 10), 100) : 20,
      sort: sort || 'latest',
    };

    return this.communityService.getRepositoryComments(repoId, query, userId);
  }

  /**
   * 切换评论点赞状态（社区端点）
   */
  @Post('repositories/comments/:commentId/like')
  @ApiOperation({
    summary: '切换评论点赞状态',
    description: '点赞或取消点赞评论（社区端点）',
  })
  @ApiParam({ name: 'commentId', description: '评论ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '操作成功',
    schema: {
      type: 'object',
      properties: {
        isLiked: { type: 'boolean' },
        likesCount: { type: 'number' },
      },
    },
  })
  async toggleCommentLike(
    @CurrentUser('id') userId: string,
    @Param('commentId') commentId: string
  ): Promise<{ isLiked: boolean; likesCount: number }> {
    return this.communityService.toggleCommentLike(commentId, userId);
  }

  /**
   * 创建仓库评论
   */
  @Post('repositories/:id/comments')
  @ApiOperation({
    summary: '创建仓库评论',
    description: '为指定仓库创建项目级评论',
  })
  @ApiParam({ name: 'id', description: '仓库ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '评论创建成功',
  })
  async createRepositoryComment(
    @Param('id') repoId: string,
    @Body() dto: CreateRepositoryCommentDto,
    @CurrentUser('id') userId: string
  ) {
    return this.communityService.createRepositoryComment(repoId, userId, dto);
  }

  /**
   * 删除仓库评论
   */
  @Delete('repositories/:id/comments/:commentId')
  @ApiOperation({
    summary: '删除仓库评论',
    description: '删除指定的仓库评论（仅评论作者、仓库所有者或管理员可删除）',
  })
  @ApiParam({ name: 'id', description: '仓库ID' })
  @ApiParam({ name: 'commentId', description: '评论ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '评论删除成功',
  })
  async deleteRepositoryComment(
    @Param('id') repoId: string,
    @Param('commentId') commentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string
  ) {
    await this.communityService.deleteRepositoryComment(
      commentId,
      userId,
      userRole as any
    );
    return { success: true };
  }
}
