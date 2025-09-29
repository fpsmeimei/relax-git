import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import s3Config from './config/s3.config';
import performanceConfig from './config/performance.config';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CommentsModule } from './comments/comments.module';
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';

import { ChatsModule } from './chats/chats.module';
import { CommunityModule } from './community/community.module';
import { HealthModule } from './health/health.module';
import { JoinRequestsModule } from './join-requests/join-requests.module';
import { MembersModule } from './members/members.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RedisModule } from './redis/redis.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { SearchModule } from './search/search.module';
import { SnapshotsModule } from './snapshots/snapshots.module';
import { TimelineModule } from './timeline/timeline.module';
import { UsersModule } from './users/users.module';
import { WebSocketModule } from './websocket/websocket.module';

/**
 * 应用主模块
 * 集成所有功能模块
 */
@Module({
  imports: [
    // 环境变量配置
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      expandVariables: true,
      load: [s3Config, performanceConfig], // 加载性能和S3配置
    }),

    // 定时任务模块
    ScheduleModule.forRoot(),

    // 核心模块
    DatabaseModule,
    RedisModule,
    HealthModule,
    WebSocketModule,

    // 业务模块
    AuthModule,
    UsersModule,
    RepositoriesModule,
    SnapshotsModule,
    CommunityModule,
    SearchModule,

    CommentsModule,
    MembersModule,
    JoinRequestsModule,
    TimelineModule,
    NotificationsModule,
    AppConfigModule,
    ChatsModule,
  ],
  controllers: [],
  providers: [
    // 全局 JWT 认证守卫
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 应用安全头中间件到所有路由
    consumer.apply(SecurityHeadersMiddleware).forRoutes('*');
  }
}
