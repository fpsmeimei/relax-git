#!/usr/bin/env node

/**
 * 模块配置优化脚本
 * 清理和优化SnapshotsModule配置，标记废弃服务
 *
 * 使用方法:
 * node tools/scripts/optimize-module-config.js
 *
 * 最后更新：2025-09-26
 */

const fs = require('fs-extra');
const path = require('path');

class ModuleConfigOptimizer {
  constructor() {
    this.apiPath = path.join(__dirname, '..', '..', 'apps', 'api');
    this.changes = [];
  }

  log(message) {
    console.log(`🔧 [Optimizer] ${message}`);
  }

  error(message) {
    console.error(`❌ [Optimizer] ${message}`);
  }

  success(message) {
    console.log(`✅ [Optimizer] ${message}`);
  }

  recordChange(file, change) {
    this.changes.push({ file, change });
  }

  /**
   * 分析当前模块配置
   */
  async analyzeCurrentConfig() {
    this.log('Analyzing current module configuration...');

    const modulePath = path.join(
      this.apiPath,
      'src',
      'snapshots',
      'snapshots.module.ts'
    );
    const moduleContent = await fs.readFile(modulePath, 'utf8');

    // 分析控制器
    const controllers = this.extractArrayContent(moduleContent, 'controllers');
    this.log(`Current controllers: ${controllers.length}`);
    controllers.forEach(controller => this.log(`  - ${controller}`));

    // 分析服务提供者
    const providers = this.extractArrayContent(moduleContent, 'providers');
    this.log(`Current providers: ${providers.length}`);
    providers.forEach(provider => this.log(`  - ${provider}`));

    // 分析导出
    const exports = this.extractArrayContent(moduleContent, 'exports');
    this.log(`Current exports: ${exports.length}`);
    exports.forEach(exp => this.log(`  - ${exp}`));

    return { controllers, providers, exports };
  }

  /**
   * 提取数组内容的辅助方法
   */
  extractArrayContent(content, arrayName) {
    const regex = new RegExp(`${arrayName}:\\s*\\[([\\s\\S]*?)\\]`, 'i');
    const match = content.match(regex);
    if (!match) return [];

    const arrayContent = match[1];
    const items = arrayContent
      .split(',')
      .map(item => item.trim())
      .filter(item => item && !item.startsWith('//'))
      .map(item => item.replace(/\/\/.*$/, '').trim());

    return items;
  }

  /**
   * 生成优化建议
   */
  generateOptimizationSuggestions(config) {
    this.log('Generating optimization suggestions...');

    const suggestions = {
      controllersToKeep: [
        'UnifiedSnapshotsController', // 主要统一控制器
        'DeprecatedSessionSnapshotsController', // 向后兼容
        'ArtifactsController', // Phase 2 功能
        'MetricsController', // 监控功能
        'PerformanceOptimizerController', // 性能优化
      ],
      controllersToDeprecate: [
        'SnapshotsController', // 传统快照控制器
        'SessionSnapshotController', // 会话快照控制器
      ],
      providersToKeep: [
        'UnifiedSnapshotService', // 核心统一服务
        'UnifiedSnapshotAccessService', // 统一权限服务
        'BaseSnapshotService', // 基础快照服务（内部使用）
        'SnapshotCleanupService', // 清理服务
        'GitValidationService', // Git验证服务
        'ArtifactService', // Phase 2 服务
        'SessionLifecycleService', // 会话生命周期
        'SnapshotMetricsService', // 监控服务
        'PerformanceOptimizerService', // 性能优化服务
      ],
      providersToDeprecate: [
        'SnapshotsService', // 传统快照服务
        'SessionSnapshotService', // 会话快照服务
      ],
      exportsToKeep: [
        'UnifiedSnapshotService',
        'UnifiedSnapshotAccessService',
        'BaseSnapshotService',
        'SnapshotCleanupService',
        'ArtifactService',
        'SessionLifecycleService',
        'SnapshotMetricsService',
        'PerformanceOptimizerService',
      ],
      exportsToDeprecate: ['SnapshotsService', 'SessionSnapshotService'],
    };

    return suggestions;
  }

  /**
   * 创建优化后的模块配置
   */
  generateOptimizedConfig(suggestions) {
    this.log('Generating optimized module configuration...');

    const optimizedConfig = `import { Module } from '@nestjs/common';
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
import { MetricsController } from './metrics.controller';
import { PerformanceOptimizerController } from './performance-optimizer.controller';
import { PerformanceOptimizerService } from './performance-optimizer.service';
import { UnifiedSnapshotAccessService } from './services/unified-access.service';
import { UnifiedSnapshotService } from './services/unified-snapshot.service';
import {
  DeprecatedSessionSnapshotsController,
  UnifiedSnapshotsController,
} from './controllers/unified-snapshots.controller';
import { SessionLifecycleService } from './session-lifecycle.service';
import { SessionSnapshotController } from './session-snapshot.controller';
import { SessionSnapshotService } from './session-snapshot.service';
import { SnapshotCleanupService } from './snapshot-cleanup.service';
import { SnapshotMetricsService } from './snapshot-metrics.service';
import { SnapshotsController } from './snapshots.controller';
import { SnapshotsService } from './snapshots.service';

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
    /** @deprecated 请使用 UnifiedSnapshotsController 替代 */
    SnapshotsController,
    /** @deprecated 请使用 UnifiedSnapshotsController 替代 */
    SessionSnapshotController,
    
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
    
    // === 传统服务（废弃但保留） ===
    /** @deprecated 请使用 UnifiedSnapshotService 替代 */
    SnapshotsService,
    /** @deprecated 请使用 UnifiedSnapshotService 替代 */
    SessionSnapshotService,
    
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
    
    // === 传统服务导出（废弃但保留） ===
    /** @deprecated 请使用 UnifiedSnapshotService 替代 */
    SnapshotsService,
    /** @deprecated 请使用 UnifiedSnapshotService 替代 */
    SessionSnapshotService,
    
    // === 扩展功能导出 ===
    ArtifactService,
    SessionLifecycleService,
    SnapshotMetricsService,
    PerformanceOptimizerService,
  ],
})
export class SnapshotsModule {}`;

    return optimizedConfig;
  }

  /**
   * 生成配置分析报告
   */
  generateAnalysisReport(currentConfig, suggestions) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalControllers: currentConfig.controllers.length,
        activeControllers: suggestions.controllersToKeep.length,
        deprecatedControllers: suggestions.controllersToDeprecate.length,
        totalProviders: currentConfig.providers.length,
        activeProviders: suggestions.providersToKeep.length,
        deprecatedProviders: suggestions.providersToDeprecate.length,
        totalExports: currentConfig.exports.length,
        activeExports: suggestions.exportsToKeep.length,
        deprecatedExports: suggestions.exportsToDeprecate.length,
      },
      recommendations: {
        controllersToKeep: suggestions.controllersToKeep,
        controllersToDeprecate: suggestions.controllersToDeprecate,
        providersToKeep: suggestions.providersToKeep,
        providersToDeprecate: suggestions.providersToDeprecate,
        exportsToKeep: suggestions.exportsToKeep,
        exportsToDeprecate: suggestions.exportsToDeprecate,
      },
      changes: this.changes,
    };

    return report;
  }

  /**
   * 执行模块配置优化
   */
  async optimize() {
    this.log('🔧 Starting module configuration optimization...');

    try {
      // 1. 分析当前配置
      const currentConfig = await this.analyzeCurrentConfig();

      // 2. 生成优化建议
      const suggestions = this.generateOptimizationSuggestions(currentConfig);

      // 3. 生成优化后的配置
      const optimizedConfig = this.generateOptimizedConfig(suggestions);

      // 4. 生成分析报告
      const report = this.generateAnalysisReport(currentConfig, suggestions);

      // 5. 保存优化后的配置（预览版本）
      const previewPath = path.join(
        this.apiPath,
        'src',
        'snapshots',
        'snapshots.module.optimized.ts'
      );
      await fs.writeFile(previewPath, optimizedConfig, 'utf8');
      this.success(`Optimized configuration saved to: ${previewPath}`);

      // 6. 保存分析报告
      const reportPath = path.join(
        __dirname,
        '..',
        '..',
        'backups',
        `module-optimization-report-${Date.now()}.json`
      );
      await fs.ensureDir(path.dirname(reportPath));
      await fs.writeJSON(reportPath, report, { spaces: 2 });
      this.success(`Analysis report saved to: ${reportPath}`);

      // 7. 显示优化摘要
      this.displayOptimizationSummary(report);

      this.success('🎉 Module configuration optimization completed!');
      this.log(
        'Review the optimized configuration and apply manually when ready.'
      );
    } catch (error) {
      this.error(`Optimization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 显示优化摘要
   */
  displayOptimizationSummary(report) {
    console.log('\n📊 Optimization Summary:');
    console.log(
      `Controllers: ${report.summary.activeControllers} active, ${report.summary.deprecatedControllers} deprecated`
    );
    console.log(
      `Providers: ${report.summary.activeProviders} active, ${report.summary.deprecatedProviders} deprecated`
    );
    console.log(
      `Exports: ${report.summary.activeExports} active, ${report.summary.deprecatedExports} deprecated`
    );

    console.log('\n🎯 Key Changes:');
    console.log('- Unified controllers and services are now primary');
    console.log('- Traditional services marked as deprecated but preserved');
    console.log('- Clear separation between active and deprecated components');
    console.log('- Comprehensive documentation and comments added');
  }
}

// 主函数
async function main() {
  console.log('🔧 Relax-Git Module Configuration Optimizer');
  console.log(
    'This will analyze and optimize the SnapshotsModule configuration.'
  );
  console.log('');

  const optimizer = new ModuleConfigOptimizer();

  try {
    await optimizer.optimize();
  } catch (error) {
    console.error('Optimization script failed:', error.message);
    process.exit(1);
  }
}

main();
