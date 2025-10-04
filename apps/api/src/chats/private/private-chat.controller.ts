import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MessageType } from '@relax-git/shared/generated/prisma-client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PrivateChatService } from './private-chat.service';

@Controller('api/private-chat')
export class PrivateChatController {
  constructor(private readonly privateChatService: PrivateChatService) {}

  @Get(':friendId/messages')
  async getMessages(
    @CurrentUser('id') userId: string,
    @Param('friendId') friendId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string
  ) {
    return this.privateChatService.getPrivateMessages(
      userId,
      friendId,
      cursor,
      limit ? parseInt(limit) : undefined
    );
  }

  @Post(':friendId/messages')
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Param('friendId') friendId: string,
    @Body() body: { content: string; type?: MessageType }
  ) {
    return this.privateChatService.sendPrivateMessage(
      userId,
      friendId,
      body.content,
      body.type ?? MessageType.TEXT
    );
  }

  @Post(':friendId/read')
  async markRead(
    @CurrentUser('id') userId: string,
    @Param('friendId') friendId: string,
    @Body() body: { messageIds?: string[] }
  ) {
    return this.privateChatService.markPrivateMessagesRead(
      userId,
      friendId,
      body.messageIds
    );
  }

  @Get('unread-counts')
  async getUnreadCounts(@CurrentUser('id') userId: string) {
    return this.privateChatService.getPrivateUnreadCounts(userId);
  }

  @Get('total-unread')
  async getTotalUnread(@CurrentUser('id') userId: string) {
    const count = await this.privateChatService.getTotalUnreadCount(userId);
    return { count };
  }
}
