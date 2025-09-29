import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: '获取通知列表' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async list(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isRead') isRead?: string
  ) {
    return await this.notifications.list({
      userId,
      page: Math.max(1, parseInt(String(page ?? '1'), 10) || 1),
      limit: Math.max(
        1,
        Math.min(100, parseInt(String(limit ?? '20'), 10) || 20)
      ),
      isRead:
        isRead === undefined
          ? undefined
          : String(isRead).toLowerCase() === 'true',
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读数量' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async unreadCount(@CurrentUser('id') userId: string) {
    return await this.notifications.unreadCount(userId);
  }

  @Post('read')
  @ApiOperation({ summary: '批量或全部标记为已读' })
  @ApiResponse({ status: HttpStatus.OK, description: '操作成功' })
  async markReadBatch(
    @CurrentUser('id') userId: string,
    @Body() body: { ids?: string[]; all?: boolean }
  ) {
    const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
    const all = body?.all === true;
    if (ids.length > 0) {
      return await this.notifications.markManyRead(userId, ids);
    }
    if (all) {
      return await this.notifications.markAllRead(userId);
    }
    throw new BadRequestException('必须提供 ids 或 all=true');
  }

  @Patch(':id/read')
  @ApiOperation({ summary: '标记单条为已读' })
  @ApiParam({ name: 'id', description: '通知ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '操作成功' })
  async markRead(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return await this.notifications.markRead(userId, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: '全部标记为已读' })
  @ApiResponse({ status: HttpStatus.OK, description: '操作成功' })
  async markAllRead(@CurrentUser('id') userId: string) {
    return await this.notifications.markAllRead(userId);
  }
}
