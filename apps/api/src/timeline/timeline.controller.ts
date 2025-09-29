import {
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  TimelineEventType,
  UserRole,
} from '@relax-git/shared/generated/prisma-client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RepoAccess } from '../auth/decorators/repo-access.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RepoAccessGuard } from '../auth/guards/repo-access.guard';
import {
  AggregationPeriod,
  ForbiddenErrorResponseDto,
  InternalServerErrorResponseDto,
  RepositoryTimelineStatsDto,
  TimelineAggregationQueryDto,
  TimelineAggregationResponseDto,
  TimelineEventsListResponseDto,
  TimelineHeatmapDto,
  TimelineQueryDto,
  TimelineStatsDto,
  ValidationErrorResponseDto,
} from './dto';
import { TimelineValidationPipe } from './pipes/timeline-validation.pipe';
import { TimelineService } from './timeline.service';

/**
 * 时间线事件管理控制器
 */
@ApiTags('timeline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UsePipes(new TimelineValidationPipe())
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get('events')
  @ApiOperation({ summary: '获取时间线事件列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每页数量',
    example: 10,
  })
  @ApiQuery({
    name: 'repoId',
    required: false,
    description: '仓库ID过滤',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: '事件类型过滤',
    enum: TimelineEventType,
  })
  @ApiQuery({
    name: 'actorId',
    required: false,
    description: '操作者ID过滤',
  })
  @ApiQuery({
    name: 'snapshotId',
    required: false,
    description: '快照ID过滤',
  })
  @ApiQuery({
    name: 'commentId',
    required: false,
    description: '评论ID过滤',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: '开始时间过滤（ISO 8601格式）',
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: '结束时间过滤（ISO 8601格式）',
    example: '2024-12-31T23:59:59.999Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取时间线事件列表成功',
    type: TimelineEventsListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '参数验证失败',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '权限不足',
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '查询时间线事件失败',
    type: InternalServerErrorResponseDto,
  })
  async getEvents(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query() queryDto: TimelineQueryDto
  ): Promise<TimelineEventsListResponseDto> {
    return await this.timelineService.findAll(userId, userRole, queryDto);
  }

  @Get('events/repository/:repoId')
  @ApiOperation({ summary: '获取特定仓库的时间线事件' })
  @ApiParam({ name: 'repoId', description: '仓库ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每页数量',
    example: 10,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: '事件类型过滤',
    enum: TimelineEventType,
  })
  @ApiQuery({
    name: 'actorId',
    required: false,
    description: '操作者ID过滤',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: '开始时间过滤（ISO 8601格式）',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: '结束时间过滤（ISO 8601格式）',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取仓库时间线事件成功',
    type: TimelineEventsListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '仓库不存在或无访问权限',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '查询仓库时间线事件失败',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async getRepositoryEvents(
    @Param('repoId') repoId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query() queryDto: Omit<TimelineQueryDto, 'repoId'>
  ): Promise<TimelineEventsListResponseDto> {
    return await this.timelineService.findByRepository(
      repoId,
      userId,
      userRole,
      queryDto
    );
  }

  @Get('events/stats')
  @ApiOperation({ summary: '获取时间线事件统计' })
  @ApiQuery({
    name: 'repoId',
    required: false,
    description: '仓库ID（可选，不提供则获取全局统计）',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取时间线事件统计成功',
    type: TimelineStatsDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '获取时间线事件统计失败',
  })
  async getStats(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query('repoId') repoId?: string
  ): Promise<TimelineStatsDto> {
    return await this.timelineService.getStats(userId, userRole, repoId);
  }

  @Get('events/repository/:repoId/stats')
  @ApiOperation({ summary: '获取特定仓库的时间线事件统计' })
  @ApiParam({ name: 'repoId', description: '仓库ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取仓库时间线事件统计成功',
    type: RepositoryTimelineStatsDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '仓库不存在或无访问权限',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '获取仓库时间线事件统计失败',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async getRepositoryStats(
    @Param('repoId') repoId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ): Promise<RepositoryTimelineStatsDto> {
    return await this.timelineService.getRepositoryStats(
      repoId,
      userId,
      userRole
    );
  }

  @Get('events/aggregated')
  @ApiOperation({ summary: '获取聚合时间线数据' })
  @ApiQuery({
    name: 'period',
    required: true,
    description: '聚合周期',
    enum: AggregationPeriod,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: '事件类型过滤',
    enum: TimelineEventType,
  })
  @ApiQuery({
    name: 'repoId',
    required: false,
    description: '仓库ID过滤',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取聚合时间线数据成功',
    type: TimelineAggregationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '参数验证失败',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '获取聚合时间线数据失败',
  })
  async getAggregatedData(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query() queryDto: TimelineAggregationQueryDto,
    @Query('repoId') repoId?: string
  ): Promise<TimelineAggregationResponseDto> {
    return await this.timelineService.getAggregatedData(
      userId,
      userRole,
      queryDto,
      repoId
    );
  }

  @Get('events/repository/:repoId/aggregated')
  @ApiOperation({ summary: '获取特定仓库的聚合时间线数据' })
  @ApiParam({ name: 'repoId', description: '仓库ID' })
  @ApiQuery({
    name: 'period',
    required: true,
    description: '聚合周期',
    enum: AggregationPeriod,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: '事件类型过滤',
    enum: TimelineEventType,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取仓库聚合时间线数据成功',
    type: TimelineAggregationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '仓库不存在或无访问权限',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '获取仓库聚合时间线数据失败',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async getRepositoryAggregatedData(
    @Param('repoId') repoId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query() queryDto: Omit<TimelineAggregationQueryDto, 'repoId'>
  ): Promise<TimelineAggregationResponseDto> {
    return await this.timelineService.getAggregatedData(
      userId,
      userRole,
      queryDto,
      repoId
    );
  }

  @Get('events/heatmap')
  @ApiOperation({ summary: '获取时间线热力图数据' })
  @ApiQuery({
    name: 'repoId',
    required: false,
    description: '仓库ID过滤',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: '天数范围（默认365天）',
    example: 365,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取热力图数据成功',
    type: [TimelineHeatmapDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '获取热力图数据失败',
  })
  async getHeatmapData(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query('repoId') repoId?: string,
    @Query('days') days?: number
  ): Promise<TimelineHeatmapDto[]> {
    return await this.timelineService.getHeatmapData(
      userId,
      userRole,
      repoId,
      days
    );
  }

  @Get('events/type-stats')
  @ApiOperation({ summary: '获取事件类型统计' })
  @ApiQuery({
    name: 'repoId',
    required: false,
    description: '仓库ID过滤',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: '开始时间（ISO 8601格式）',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: '结束时间（ISO 8601格式）',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取事件类型统计成功',
    schema: {
      type: 'object',
      additionalProperties: { type: 'number' },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '获取事件类型统计失败',
  })
  async getEventTypeStats(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query('repoId') repoId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<Record<TimelineEventType, number>> {
    const timeRange = startDate && endDate ? { startDate, endDate } : undefined;
    return await this.timelineService.getEventTypeStats(
      userId,
      userRole,
      repoId,
      timeRange
    );
  }

  @Get('events/user/:userId')
  @ApiOperation({ summary: '获取用户活动时间线' })
  @ApiParam({ name: 'userId', description: '目标用户ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每页数量',
    example: 10,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: '事件类型过滤',
    enum: TimelineEventType,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: '开始时间过滤（ISO 8601格式）',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: '结束时间过滤（ISO 8601格式）',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取用户时间线成功',
    type: TimelineEventsListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '用户不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '权限不足',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '获取用户时间线失败',
  })
  async getUserTimeline(
    @Param('userId') targetUserId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query() queryDto: Omit<TimelineQueryDto, 'actorId'>
  ): Promise<TimelineEventsListResponseDto> {
    return await this.timelineService.getUserTimeline(
      userId,
      targetUserId,
      userRole,
      queryDto
    );
  }

  /**
   * 获取性能指标
   */
  @Get('performance/metrics')
  @ApiOperation({ summary: '获取时间线服务性能指标' })
  @ApiResponse({
    status: 200,
    description: '性能指标获取成功',
    schema: {
      type: 'object',
      properties: {
        totalQueries: { type: 'number', description: '总查询数' },
        cacheHits: { type: 'number', description: '缓存命中数' },
        cacheMisses: { type: 'number', description: '缓存未命中数' },
        cacheHitRate: { type: 'number', description: '缓存命中率(%)' },
        slowQueries: { type: 'number', description: '慢查询数' },
        slowQueryRate: { type: 'number', description: '慢查询率(%)' },
        avgQueryTime: { type: 'number', description: '平均查询时间(ms)' },
      },
    },
  })
  async getPerformanceMetrics(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ) {
    // 只有管理员可以查看性能指标
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以查看性能指标');
    }

    return this.timelineService.getPerformanceMetrics();
  }

  /**
   * 重置性能指标
   */
  @Post('performance/reset')
  @ApiOperation({ summary: '重置时间线服务性能指标' })
  @ApiResponse({
    status: 200,
    description: '性能指标重置成功',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '性能指标已重置' },
        resetAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async resetPerformanceMetrics(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ) {
    // 只有管理员可以重置性能指标
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以重置性能指标');
    }

    this.timelineService.resetPerformanceMetrics();

    return {
      message: '性能指标已重置',
      resetAt: new Date().toISOString(),
    };
  }
}
