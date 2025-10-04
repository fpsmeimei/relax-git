import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { WebSocketModule } from '../../websocket/websocket.module';
import { PrivateChatService } from './private-chat.service';
import { PrivateChatController } from './private-chat.controller';

@Module({
  imports: [DatabaseModule, WebSocketModule],
  controllers: [PrivateChatController],
  providers: [PrivateChatService],
  exports: [PrivateChatService],
})
export class PrivateChatModule {}
