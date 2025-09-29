import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RepoAccess } from '../auth/decorators/repo-access.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RepoAccessGuard } from '../auth/guards/repo-access.guard';
import {
  BatchReviewJoinRequestDto,
  BatchReviewJoinRequestResponseDto,
  CreateJoinRequestDto,
  CreateJoinRequestResponseDto,
  JoinRequestListResponseDto,
  QueryJoinRequestsDto,
  ReviewJoinRequestDto,
  ReviewJoinRequestResponseDto,
} from './dto';
import { JoinRequestsService } from './join-requests.service';

@ApiTags('join-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('repositories/:repoId/join-requests')
export class JoinRequestsController {
  constructor(private readonly joinRequestsService: JoinRequestsService) {}

  @Post()
  @ApiOperation({ summary: '提交加入申请' })
  @ApiOkResponse({ type: CreateJoinRequestResponseDto })
  async create(
    @Param('repoId') repoId: string,
    @Body() dto: CreateJoinRequestDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ) {
    return this.joinRequestsService.create(repoId, userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: '获取当前用户在该仓库的加入状态' })
  @ApiOkResponse({
    description: '返回 member/pending/rejected/approved/none 之一',
  })
  async me(@Param('repoId') repoId: string, @CurrentUser('id') userId: string) {
    return this.joinRequestsService.getMyStatus(repoId, userId);
  }

  @Get()
  @UseGuards(RepoAccessGuard)
  @RepoAccess('admin')
  @ApiOperation({ summary: '查看加入申请列表' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({
    name: 'search',
    required: false,
    description: '按申请人用户名/邮箱模糊匹配',
  })
  @ApiOkResponse({ type: JoinRequestListResponseDto })
  async list(
    @Param('repoId') repoId: string,
    @Query() query: QueryJoinRequestsDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ) {
    return this.joinRequestsService.list(repoId, query);
  }

  @Post(':id/approve')
  @UseGuards(RepoAccessGuard)
  @RepoAccess('admin')
  @ApiOperation({ summary: '审批通过加入申请' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: ReviewJoinRequestResponseDto })
  async approve(
    @Param('repoId') repoId: string,
    @Param('id') id: string,
    @Body() body: ReviewJoinRequestDto,
    @CurrentUser('id') reviewerId: string
  ) {
    return this.joinRequestsService.approve(
      repoId,
      id,
      reviewerId,
      body?.reason
    );
  }

  @Post(':id/reject')
  @UseGuards(RepoAccessGuard)
  @RepoAccess('admin')
  @ApiOperation({ summary: '审批驳回加入申请' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: ReviewJoinRequestResponseDto })
  async reject(
    @Param('repoId') repoId: string,
    @Param('id') id: string,
    @Body() body: ReviewJoinRequestDto,
    @CurrentUser('id') reviewerId: string
  ) {
    return this.joinRequestsService.reject(
      repoId,
      id,
      reviewerId,
      body?.reason
    );
  }

  @Post('batch-review')
  @UseGuards(RepoAccessGuard)
  @RepoAccess('admin')
  @ApiOperation({ summary: '批量审批加入申请' })
  @ApiOkResponse({ type: BatchReviewJoinRequestResponseDto })
  async batchReview(
    @Param('repoId') repoId: string,
    @Body() dto: BatchReviewJoinRequestDto,
    @CurrentUser('id') reviewerId: string
  ) {
    return this.joinRequestsService.batchReview(repoId, dto, reviewerId);
  }

  @Delete('me')
  @ApiOperation({ summary: '撤回当前用户的加入申请（若存在待处理申请）' })
  @ApiOkResponse({ description: '返回撤回后的状态，通常为 none 或 member' })
  async cancel(
    @Param('repoId') repoId: string,
    @CurrentUser('id') userId: string
  ) {
    return this.joinRequestsService.cancel(repoId, userId);
  }
}
