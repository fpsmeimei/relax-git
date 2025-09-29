import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

/**
 * 评论管理模块
 */
@Module({
  imports: [DatabaseModule, RedisModule, WebSocketModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
