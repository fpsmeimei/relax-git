import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OnlineStatusService } from './online-status.service';

@Controller('api/users/online-status')
export class OnlineStatusController {
  constructor(private readonly onlineStatusService: OnlineStatusService) {}

  @Get('friends')
  async getFriendsStatus(@CurrentUser('id') userId: string) {
    return this.onlineStatusService.getFriendsOnlineStatus(userId);
  }

  @Get(':userId')
  async getUserStatus(@Param('userId') userId: string) {
    return this.onlineStatusService.getUserOnlineStatus(userId);
  }

  @Post('batch')
  async batchGetStatus(@Body() body: { userIds: string[] }) {
    return this.onlineStatusService.batchGetOnlineStatus(body.userIds || []);
  }

  @Post('heartbeat')
  async heartbeat(@CurrentUser('id') userId: string) {
    await this.onlineStatusService.updateLastSeen(userId);
    return { ok: true };
  }
}
