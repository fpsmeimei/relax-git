import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { WebSocketModule } from '../../websocket/websocket.module';
import { ChatFriendsService } from './chat-friends.service';
import { ChatFriendsController } from './chat-friends.controller';
import { ChatsModule } from '../chats.module';

@Module({
  imports: [DatabaseModule, WebSocketModule, forwardRef(() => ChatsModule)],
  controllers: [ChatFriendsController],
  providers: [ChatFriendsService],
  exports: [ChatFriendsService],
})
export class ChatFriendsModule {}
