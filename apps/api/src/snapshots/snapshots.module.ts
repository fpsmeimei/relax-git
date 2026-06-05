import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '../config/config.module';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { GitValidationService } from '../repositories/services/git-validation.service';
import { WebSocketModule } from '../websocket/websocket.module';
import { ArtifactService } from './artifact.service';
import { ArtifactsController } from './artifacts.controller';
import { BaseSnapshotService } from './base-snapshot.service';
import { BranchArtifactsController } from './branch-artifacts.controller';
import { UnifiedSnapshotsController } from './controllers/unified-snapshots.controller';
import { MetricsController } from './metrics.controller';
import { PerformanceOptimizerController } from './performance-optimizer.controller';
import { PerformanceOptimizerService } from './performance-optimizer.service';
import { UnifiedSnapshotAccessService } from './services/unified-access.service';
import { UnifiedSnapshotService } from './services/unified-snapshot.service';
import { SessionLifecycleService } from './session-lifecycle.service';
import { SnapshotCleanupService } from './snapshot-cleanup.service';
import { SnapshotMetricsService } from './snapshot-metrics.service';

/**
 * 快照管理模块
 * 包含传统快照服务和新的社区化快照架构
 */
@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    WebSocketModule,
    ConfigModule,
    ScheduleModule.forRoot(), // Phase 2: 支持定时任务
    EventEmitterModule.forRoot(),
  ],
  controllers: [
    // 统一快照控制器
    UnifiedSnapshotsController,
    ArtifactsController,
    BranchArtifactsController,
    MetricsController, // Phase 1.4: 监控API
    PerformanceOptimizerController, // Phase 3.2: 性能优化API
  ],
  providers: [
    BaseSnapshotService,
    SnapshotCleanupService,
    GitValidationService,
    // 统一权限验证服务
    UnifiedSnapshotAccessService,
    // 统一快照服务
    UnifiedSnapshotService,
    // Phase 2 新增服务
    ArtifactService,
    SessionLifecycleService,
    // Phase 1.4 监控服务
    SnapshotMetricsService,
    // Phase 3.2 性能优化服务
    PerformanceOptimizerService,
  ],
  exports: [
    BaseSnapshotService,
    SnapshotCleanupService,
    // 统一服务导出
    UnifiedSnapshotAccessService,
    UnifiedSnapshotService,
    // Phase 2 导出
    ArtifactService,
    SessionLifecycleService,
    SnapshotMetricsService,
    // Phase 3.2 导出
    PerformanceOptimizerService,
  ],
})
export class SnapshotsModule {}
