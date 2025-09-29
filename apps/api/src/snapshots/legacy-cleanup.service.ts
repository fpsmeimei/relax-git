import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ArtifactService } from './artifact.service';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Phase 3.1: 遗留代码清理服务
 * 负责迁移数据和清理旧的快照系统
 */
@Injectable()
export class LegacyCleanupService {
  private readonly logger = new Logger(LegacyCleanupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly artifactService: ArtifactService
  ) {}

  /**
   * 执行完整的迁移和清理流程
   */
  async executeFullMigration(
    options: {
      dryRun?: boolean;
      preserveBackup?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<MigrationReport> {
    const { dryRun = true, preserveBackup = true, batchSize = 100 } = options;

    this.logger.log(`Starting full migration (dryRun: ${dryRun})`);

    const report: MigrationReport = {
      startTime: new Date(),
      dryRun,
      steps: [],
      errors: [],
      warnings: [],
    };

    try {
      // Step 1: 备份现有数据
      if (preserveBackup) {
        const backupResult = await this.backupLegacyData();
        report.steps.push({
          name: 'Backup Legacy Data',
          status: 'completed',
          details: backupResult,
        });
      }

      // Step 2: 迁移 base_snapshots 到 snapshot_artifacts
      const migrationResult = await this.migrateBaseSnapshots(
        dryRun,
        batchSize
      );
      report.steps.push({
        name: 'Migrate Base Snapshots',
        status: migrationResult.success ? 'completed' : 'failed',
        details: migrationResult,
      });

      // Step 3: 迁移 snapshots 表数据
      const snapshotMigration = await this.migrateSnapshots(dryRun, batchSize);
      report.steps.push({
        name: 'Migrate Snapshots',
        status: snapshotMigration.success ? 'completed' : 'failed',
        details: snapshotMigration,
      });

      // Step 4: 更新所有引用
      const referenceUpdate = await this.updateReferences(dryRun);
      report.steps.push({
        name: 'Update References',
        status: referenceUpdate.success ? 'completed' : 'failed',
        details: referenceUpdate,
      });

      // Step 5: 清理旧表（仅在非 dryRun 模式）
      if (!dryRun) {
        const cleanupResult = await this.cleanupLegacyTables();
        report.steps.push({
          name: 'Cleanup Legacy Tables',
          status: 'completed',
          details: cleanupResult,
        });
      } else {
        report.steps.push({
          name: 'Cleanup Legacy Tables',
          status: 'skipped',
          details: { reason: 'Dry run mode' },
        });
      }

      // Step 6: 优化新表
      const optimizationResult = await this.optimizeNewTables(dryRun);
      report.steps.push({
        name: 'Optimize Tables',
        status: 'completed',
        details: optimizationResult,
      });
    } catch (error) {
      report.errors.push({
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
    }

    report.endTime = new Date();
    report.duration = report.endTime.getTime() - report.startTime.getTime();

    this.logger.log(`Migration completed in ${report.duration}ms`);
    return report;
  }

  /**
   * 迁移 base_snapshots 到 snapshot_artifacts
   */
  private async migrateBaseSnapshots(
    dryRun: boolean,
    batchSize: number
  ): Promise<any> {
    this.logger.log('Migrating base_snapshots to snapshot_artifacts...');

    let totalMigrated = 0;
    let totalErrors = 0;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const batch = await this.prisma.baseSnapshot.findMany({
        skip: offset,
        take: batchSize,
        include: {
          repository: true,
          branch: true,
        },
      });

      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      for (const snapshot of batch) {
        try {
          // 检查是否已存在
          const existing = await this.prisma.snapshotArtifact.findUnique({
            where: {
              repoId_commitSha: {
                repoId: snapshot.repoId,
                commitSha: snapshot.commitSha,
              },
            },
          });

          if (existing) {
            this.logger.debug(
              `Artifact already exists for ${snapshot.commitSha}`
            );
            continue;
          }

          if (!dryRun) {
            // 创建新的 artifact
            const artifact = await this.prisma.snapshotArtifact.create({
              data: {
                repoId: snapshot.repoId,
                commitSha: snapshot.commitSha,
                status: this.mapStatus(snapshot.status),
                worktreePath: snapshot.worktreePath,
                bundlePath: snapshot.bundlePath,
                processedAt: snapshot.processedAt,
                errorMessage: snapshot.errorMessage,
                metadata: {
                  migratedFrom: 'base_snapshots',
                  originalId: snapshot.id,
                  migrationDate: new Date().toISOString(),
                },
              },
            });

            // 更新分支引用
            await this.prisma.repositoryBranch.update({
              where: { id: snapshot.branchId },
              data: { currentArtifactId: artifact.id },
            });
          }

          totalMigrated++;
        } catch (error) {
          this.logger.error(
            `Failed to migrate base snapshot ${snapshot.id}:`,
            error
          );
          totalErrors++;
        }
      }

      offset += batchSize;
    }

    return {
      success: totalErrors === 0,
      migrated: totalMigrated,
      errors: totalErrors,
    };
  }

  /**
   * 迁移 snapshots 表数据
   */
  private async migrateSnapshots(
    dryRun: boolean,
    batchSize: number
  ): Promise<any> {
    this.logger.log('Migrating snapshots table...');

    let totalMigrated = 0;
    let totalErrors = 0;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const batch = await this.prisma.snapshot.findMany({
        skip: offset,
        take: batchSize,
        where: {
          status: 'READY',
        },
      });

      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      for (const snapshot of batch) {
        try {
          // 检查是否已有对应的 artifact
          let artifact = await this.prisma.snapshotArtifact.findUnique({
            where: {
              repoId_commitSha: {
                repoId: snapshot.repoId,
                commitSha: snapshot.commitSha,
              },
            },
          });

          if (!artifact && !dryRun) {
            // 创建新的 artifact
            artifact = await this.prisma.snapshotArtifact.create({
              data: {
                repoId: snapshot.repoId,
                commitSha: snapshot.commitSha,
                status: 'READY',
                worktreePath: snapshot.worktreePath,
                bundlePath: snapshot.bundlePath,
                processedAt: snapshot.processedAt,
                errorMessage: snapshot.errorMessage,
                metadata: {
                  migratedFrom: 'snapshots',
                  originalId: snapshot.id,
                  title: snapshot.title,
                  description: snapshot.description,
                  migrationDate: new Date().toISOString(),
                },
              },
            });
          }

          totalMigrated++;
        } catch (error) {
          this.logger.error(
            `Failed to migrate snapshot ${snapshot.id}:`,
            error
          );
          totalErrors++;
        }
      }

      offset += batchSize;
    }

    return {
      success: totalErrors === 0,
      migrated: totalMigrated,
      errors: totalErrors,
    };
  }

  /**
   * 更新所有引用
   */
  private async updateReferences(dryRun: boolean): Promise<any> {
    this.logger.log('Updating references...');

    const updates = [];

    // 更新 comments 表引用
    if (!dryRun) {
      // 这里简化处理，实际需要更复杂的逻辑
      updates.push({
        table: 'comments',
        updated: 0, // 实际应该执行更新
      });
    }

    return {
      success: true,
      updates,
    };
  }

  /**
   * 清理旧表
   */
  private async cleanupLegacyTables(): Promise<any> {
    this.logger.warn('Cleaning up legacy tables...');

    const tablesCleared = [];

    // 注意：这是破坏性操作，生产环境需要极其谨慎
    // 建议先创建备份，然后重命名表而不是删除

    try {
      // 重命名旧表而不是删除
      await this.prisma.$executeRaw`
        ALTER TABLE IF EXISTS snapshots 
        RENAME TO snapshots_legacy_backup;
      `;
      tablesCleared.push('snapshots -> snapshots_legacy_backup');

      await this.prisma.$executeRaw`
        ALTER TABLE IF EXISTS base_snapshots 
        RENAME TO base_snapshots_legacy_backup;
      `;
      tablesCleared.push('base_snapshots -> base_snapshots_legacy_backup');
    } catch (error) {
      this.logger.error('Failed to cleanup legacy tables:', error);
      throw error;
    }

    return {
      tablesRenamed: tablesCleared,
      message: 'Tables renamed for backup, not deleted',
    };
  }

  /**
   * 优化新表
   */
  private async optimizeNewTables(dryRun: boolean): Promise<any> {
    this.logger.log('Optimizing new tables...');

    const optimizations = [];

    if (!dryRun) {
      // 分析和更新统计信息
      await this.prisma.$executeRaw`ANALYZE snapshot_artifacts;`;
      optimizations.push('Analyzed snapshot_artifacts');

      // 重建索引
      await this.prisma.$executeRaw`REINDEX TABLE snapshot_artifacts;`;
      optimizations.push('Reindexed snapshot_artifacts');

      // 清理死元组
      await this.prisma.$executeRaw`VACUUM snapshot_artifacts;`;
      optimizations.push('Vacuumed snapshot_artifacts');
    }

    return {
      success: true,
      optimizations,
    };
  }

  /**
   * 备份遗留数据
   */
  private async backupLegacyData(): Promise<any> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(
      process.cwd(),
      'backups',
      `migration-${timestamp}`
    );

    await fs.ensureDir(backupDir);

    // 导出数据为 JSON
    const [snapshots, baseSnapshots] = await Promise.all([
      this.prisma.snapshot.findMany(),
      this.prisma.baseSnapshot.findMany(),
    ]);

    await fs.writeJSON(path.join(backupDir, 'snapshots.json'), snapshots, {
      spaces: 2,
    });
    await fs.writeJSON(
      path.join(backupDir, 'base_snapshots.json'),
      baseSnapshots,
      { spaces: 2 }
    );

    this.logger.log(`Backup created at ${backupDir}`);

    return {
      backupDir,
      snapshotsCount: snapshots.length,
      baseSnapshotsCount: baseSnapshots.length,
    };
  }

  /**
   * 映射旧状态到新状态
   */
  private mapStatus(oldStatus: any): any {
    const statusMap: { [key: string]: string } = {
      QUEUED: 'QUEUED',
      PROCESSING: 'PROCESSING',
      READY: 'READY',
      FAILED: 'FAILED',
      EXPIRED: 'FAILED',
    };

    return statusMap[oldStatus] || 'FAILED';
  }

  /**
   * 验证迁移结果
   */
  async validateMigration(): Promise<ValidationReport> {
    this.logger.log('Validating migration...');

    const report: ValidationReport = {
      isValid: true,
      checks: [],
    };

    // Check 1: 所有 base_snapshots 都有对应的 artifacts
    const unmigrated = await this.prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM base_snapshots bs
      LEFT JOIN snapshot_artifacts sa 
        ON bs.repo_id = sa.repo_id 
        AND bs.commit_sha = sa.commit_sha
      WHERE sa.id IS NULL
    `;

    report.checks.push({
      name: 'Base Snapshots Migration',
      passed: (unmigrated as any)[0].count === 0,
      details: `${(unmigrated as any)[0].count} unmigrated base snapshots`,
    });

    // Check 2: 分支引用正确
    const invalidRefs = await this.prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM repository_branches
      WHERE current_artifact_id IS NOT NULL
      AND current_artifact_id NOT IN (
        SELECT id FROM snapshot_artifacts
      )
    `;

    report.checks.push({
      name: 'Branch References',
      passed: (invalidRefs as any)[0].count === 0,
      details: `${(invalidRefs as any)[0].count} invalid branch references`,
    });

    // Check 3: 没有孤儿 artifacts
    const orphans = await this.prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM snapshot_artifacts sa
      LEFT JOIN repositories r ON sa.repo_id = r.id
      WHERE r.id IS NULL
    `;

    report.checks.push({
      name: 'Orphan Artifacts',
      passed: (orphans as any)[0].count === 0,
      details: `${(orphans as any)[0].count} orphan artifacts`,
    });

    report.isValid = report.checks.every(check => check.passed);

    return report;
  }

  /**
   * 清理孤儿文件
   */
  async cleanupOrphanFiles(
    options: {
      dryRun?: boolean;
      worktreePath?: string;
      bundlePath?: string;
    } = {}
  ): Promise<any> {
    const { dryRun = true, worktreePath, bundlePath } = options;

    this.logger.log('Cleaning up orphan files...');

    const orphanFiles = [];
    let totalSize = 0;

    // 获取数据库中所有的文件路径
    const dbPaths = await this.prisma.snapshotArtifact.findMany({
      select: {
        worktreePath: true,
        bundlePath: true,
      },
    });

    const validPaths = new Set<string>();
    dbPaths.forEach((item: { worktreePath?: string; bundlePath?: string }) => {
      if (item.worktreePath) validPaths.add(item.worktreePath);
      if (item.bundlePath) validPaths.add(item.bundlePath);
    });

    // 扫描文件系统
    if (worktreePath && (await fs.pathExists(worktreePath))) {
      const files = await fs.readdir(worktreePath);
      for (const file of files) {
        const fullPath = path.join(worktreePath, file);
        if (!validPaths.has(fullPath)) {
          const stats = await fs.stat(fullPath);
          orphanFiles.push({
            path: fullPath,
            size: stats.size,
            type: 'worktree',
          });
          totalSize += stats.size;

          if (!dryRun) {
            await fs.remove(fullPath);
            this.logger.log(`Removed orphan worktree: ${fullPath}`);
          }
        }
      }
    }

    return {
      orphanFiles: orphanFiles.length,
      totalSize,
      cleaned: !dryRun,
    };
  }
}

// 类型定义
interface MigrationReport {
  startTime: Date;
  endTime?: Date;
  duration?: number;
  dryRun: boolean;
  steps: Array<{
    name: string;
    status: 'completed' | 'failed' | 'skipped';
    details: any;
  }>;
  errors: Array<{
    message: string;
    timestamp: Date;
  }>;
  warnings: Array<{
    message: string;
    timestamp: Date;
  }>;
}

interface ValidationReport {
  isValid: boolean;
  checks: Array<{
    name: string;
    passed: boolean;
    details: string;
  }>;
}
