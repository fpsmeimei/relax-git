import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from '../config/jwt.config';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { WebSocketHealthController } from './websocket-health.controller';
import { WebSocketGateway } from './websocket.gateway';

/**
 * WebSocket模块
 */
@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    JwtModule.registerAsync({
      useFactory: getJwtConfig,
    }),
  ],
  providers: [WebSocketGateway],
  controllers: [WebSocketHealthController],
  exports: [WebSocketGateway],
})
export class WebSocketModule {}
