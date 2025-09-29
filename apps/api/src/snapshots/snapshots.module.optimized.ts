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
import {
  DeprecatedSessionSnapshotsController,
  UnifiedSnapshotsController,
} from './controllers/unified-snapshots.controller';
import { MetricsController } from './metrics.controller';
import { PerformanceOptimizerController } from './performance-optimizer.controller';
import { PerformanceOptimizerService } from './performance-optimizer.service';
import { UnifiedSnapshotAccessService } from './services/unified-access.service';
import { UnifiedSnapshotService } from './services/unified-snapshot.service';
import { SessionLifecycleService } from './session-lifecycle.service';
import { SnapshotCleanupService } from './snapshot-cleanup.service';
import { SnapshotMetricsService } from './snapshot-metrics.service';

/**
 * 快照管理模块 - 统一架构版本
 *
 * 架构说明：
 * - 主要使用统一快照服务和控制器
 * - 保留传统服务用于向后兼容（标记为废弃）
 * - 支持Phase 2和Phase 3功能扩展
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
    // === 统一架构控制器 ===
    UnifiedSnapshotsController, // 主要统一控制器
    DeprecatedSessionSnapshotsController, // 向后兼容端点

    // === 传统控制器（废弃但保留） ===

    // === 扩展功能控制器 ===
    ArtifactsController, // Phase 2: 快照工件
    MetricsController, // Phase 1.4: 监控API
    PerformanceOptimizerController, // Phase 3.2: 性能优化API
  ],
  providers: [
    // === 统一架构服务 ===
    UnifiedSnapshotService, // 核心统一服务
    UnifiedSnapshotAccessService, // 统一权限验证服务

    // === 基础服务（内部使用） ===
    BaseSnapshotService, // 基础快照服务
    SnapshotCleanupService, // 清理服务
    GitValidationService, // Git验证服务

    // === 传统服务（已移除） ===

    // === 扩展功能服务 ===
    ArtifactService, // Phase 2: 快照工件服务
    SessionLifecycleService, // Phase 2: 会话生命周期管理
    SnapshotMetricsService, // Phase 1.4: 监控服务
    PerformanceOptimizerService, // Phase 3.2: 性能优化服务
  ],
  exports: [
    // === 统一架构导出 ===
    UnifiedSnapshotService,
    UnifiedSnapshotAccessService,

    // === 基础服务导出 ===
    BaseSnapshotService,
    SnapshotCleanupService,

    // === 传统服务导出（已移除） ===

    // === 扩展功能导出 ===
    ArtifactService,
    SessionLifecycleService,
    SnapshotMetricsService,
    PerformanceOptimizerService,
  ],
})
export class SnapshotsModule {}
