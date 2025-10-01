import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChatsService } from './chats.service';

@Controller('api/chats')
export class ChatsController {
  constructor(private readonly chats: ChatsService) {}

  @Get()
  async listMyChats(@CurrentUser('id') userId: string) {
    return this.chats.getMyChats(userId);
  }

  @Post('direct')
  async createDirect(
    @CurrentUser('id') userId: string,
    @Body() body: { userId: string }
  ) {
    return this.chats.createDirectChat(userId, body?.userId);
  }

  @Post('group')
  async createGroup(
    @CurrentUser('id') userId: string,
    @Body() body: { name: string; memberIds?: string[] }
  ) {
    return this.chats.createGroupChat(
      userId,
      body?.name,
      body?.memberIds ?? []
    );
  }

  @Get(':chatId/messages')
  async listMessages(
    @CurrentUser('id') userId: string,
    @Param('chatId') chatId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string
  ) {
    const result = await this.chats.listMessages(
      userId,
      chatId,
      cursor,
      limit ? parseInt(limit) : undefined
    );
    return result;
  }

  @Post(':chatId/messages')
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Param('chatId') chatId: string,
    @Body() body: { content: string }
  ) {
    return this.chats.sendMessage(userId, chatId, body?.content ?? '');
  }

  @Post(':chatId/read')
  async markRead(
    @CurrentUser('id') userId: string,
    @Param('chatId') chatId: string
  ) {
    return this.chats.markRead(userId, chatId);
  }

  @Post(':chatId/members')
  async addMembers(
    @CurrentUser('id') userId: string,
    @Param('chatId') chatId: string,
    @Body() body: { memberIds: string[] }
  ) {
    return this.chats.addMembers(userId, chatId, body?.memberIds ?? []);
  }
}
