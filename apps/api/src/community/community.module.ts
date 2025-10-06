import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { RepositoryInteractionController } from './repository-interaction.controller';
import { RepositoryInteractionService } from './repository-interaction.service';
import { ViewsAggregationService } from './views-aggregation.service';

/**
 * 社区模块
 * 提供社区功能相关的服务和控制器
 */
@Module({
  imports: [DatabaseModule, ConfigModule, WebSocketModule],
  controllers: [CommunityController, RepositoryInteractionController],
  providers: [
    CommunityService,
    ViewsAggregationService,
    RepositoryInteractionService,
  ],
  exports: [
    CommunityService,
    ViewsAggregationService,
    RepositoryInteractionService,
  ],
})
export class CommunityModule {}
