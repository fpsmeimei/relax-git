import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { MessageType } from '@relax-git/shared/generated/prisma-client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChatsService } from './chats.service';
import { MarkReadDto, SendMessageDto } from './dto/chat-message.dto';
import {
  AddMembersDto,
  CreateDirectChatDto,
  CreateGroupChatDto,
} from './dto/chat-room.dto';

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
    @Body() body: CreateDirectChatDto
  ) {
    return this.chats.createDirectChat(userId, body.userId);
  }

  @Get('unread-counts')
  async getUnreadCounts(@CurrentUser('id') userId: string) {
    return this.chats.getUnreadCounts(userId);
  }

  @Post('group')
  async createGroup(
    @CurrentUser('id') userId: string,
    @Body() body: CreateGroupChatDto
  ) {
    return this.chats.createGroupChat(userId, body.name, body.memberIds ?? []);
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
    @Body() body: SendMessageDto
  ) {
    return this.chats.sendMessage(
      userId,
      chatId,
      body.content,
      body.type ?? MessageType.TEXT
    );
  }

  @Post(':chatId/read')
  async markRead(
    @CurrentUser('id') userId: string,
    @Param('chatId') chatId: string,
    @Body() body: MarkReadDto
  ) {
    return this.chats.markRead(userId, chatId, body?.messageIds);
  }

  @Post(':chatId/members')
  async addMembers(
    @CurrentUser('id') userId: string,
    @Param('chatId') chatId: string,
    @Body() body: AddMembersDto
  ) {
    return this.chats.addMembers(userId, chatId, body.memberIds);
  }

  @Delete(':chatId/messages')
  async clearMessages(
    @CurrentUser('id') userId: string,
    @Param('chatId') chatId: string
  ) {
    return this.chats.clearMessages(userId, chatId);
  }
}
