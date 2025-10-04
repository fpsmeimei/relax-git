import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from '../config/jwt.config';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { UsersModule } from '../users/users.module';
import { WebSocketHealthController } from './websocket-health.controller';
import { WebSocketGateway } from './websocket.gateway';

/**
 * WebSocket模块
 */
@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      useFactory: getJwtConfig,
    }),
  ],
  providers: [
    WebSocketGateway,
    { provide: 'WebSocketGateway', useExisting: WebSocketGateway },
  ],
  controllers: [WebSocketHealthController],
  exports: [WebSocketGateway],
})
export class WebSocketModule {}
