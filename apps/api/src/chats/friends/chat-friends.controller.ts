import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { FriendRequestStatus } from '@relax-git/shared/generated/prisma-client';
import { ChatFriendsService } from './chat-friends.service';
import {
  FriendRequestIdParamDto,
  FriendRequestsQueryDto,
  RemoveFriendParamDto,
  SearchFriendsQueryDto,
  SendFriendRequestDto,
} from './dto/chat-friends.dto';

const REQUEST_STATUS_ALLOW = new Set([
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'ALL',
]);

@Controller('api/chat/friends')
export class ChatFriendsController {
  constructor(private readonly friendsService: ChatFriendsService) {}

  @Get('search')
  async search(
    @CurrentUser('id') userId: string,
    @Query() query: SearchFriendsQueryDto
  ) {
    return this.friendsService.searchUsers(userId, query.keyword ?? '');
  }

  @Get()
  async listFriends(@CurrentUser('id') userId: string) {
    return this.friendsService.listFriends(userId);
  }

  @Get('requests')
  async listRequests(
    @CurrentUser('id') userId: string,
    @Query() query: FriendRequestsQueryDto
  ) {
    const normalized = query.status?.toUpperCase();
    const finalStatus = REQUEST_STATUS_ALLOW.has(normalized ?? '')
      ? (normalized as FriendRequestStatus | 'ALL')
      : FriendRequestStatus.PENDING;
    return this.friendsService.listFriendRequests(userId, finalStatus);
  }

  @Post('requests')
  async sendFriendRequest(
    @CurrentUser('id') userId: string,
    @Body() body: SendFriendRequestDto
  ) {
    return this.friendsService.sendFriendRequest(
      userId,
      body?.toUserId ?? '',
      body?.message ?? undefined
    );
  }

  @Post('requests/:id/accept')
  async acceptFriendRequest(
    @CurrentUser('id') userId: string,
    @Param() params: FriendRequestIdParamDto
  ) {
    return this.friendsService.acceptFriendRequest(userId, params.id);
  }

  @Post('requests/:id/reject')
  async rejectFriendRequest(
    @CurrentUser('id') userId: string,
    @Param() params: FriendRequestIdParamDto
  ) {
    return this.friendsService.rejectFriendRequest(userId, params.id);
  }

  @Delete(':friendId')
  async removeFriend(
    @CurrentUser('id') userId: string,
    @Param() params: RemoveFriendParamDto
  ) {
    return this.friendsService.removeFriend(userId, params.friendId);
  }
}
