#!/usr/bin/env node

/**
 * Relax-Git 快照架构统一迁移脚本
 * 安全地将传统Snapshot和SessionSnapshot数据迁移到统一的BaseSnapshot模型
 *
 * 使用方法:
 * node tools/scripts/snapshot-migration.js backup    # 备份现有数据
 * node tools/scripts/snapshot-migration.js migrate   # 执行数据迁移
 * node tools/scripts/snapshot-migration.js verify    # 验证迁移结果
 * node tools/scripts/snapshot-migration.js rollback  # 回滚迁移
 *
 * 最后更新：2025-09-26
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

class SnapshotMigration {
  constructor() {
    this.apiPath = path.join(__dirname, '..', '..', 'apps', 'api');
    this.backupDir = path.join(
      __dirname,
      '..',
      '..',
      'backups',
      `snapshot-migration-${this.getTimestamp()}`
    );
    this.logFile = path.join(this.backupDir, 'migration.log');
  }

  getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(`🔧 [Migration] ${message}`);

    // 写入日志文件
    if (fs.existsSync(this.backupDir)) {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    }
  }

  error(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message}`;
    console.error(`❌ [Migration] ${message}`);

    if (fs.existsSync(this.backupDir)) {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    }
  }

  success(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] SUCCESS: ${message}`;
    console.log(`✅ [Migration] ${message}`);

    if (fs.existsSync(this.backupDir)) {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    }
  }

  execCommand(command, description) {
    try {
      this.log(`${description}...`);
      const result = execSync(command, {
        cwd: this.apiPath,
        stdio: 'pipe',
        encoding: 'utf8',
        env: { ...process.env, FORCE_COLOR: '0' },
      });
      this.success(`${description} completed`);
      return result;
    } catch (error) {
      this.error(`${description} failed: ${error.message}`);
      throw error;
    }
  }

  async backup() {
    this.log('Starting data backup...');

    try {
      // 创建备份目录
      await fs.ensureDir(this.backupDir);
      this.log(`Backup directory created: ${this.backupDir}`);

      // 备份数据库schema
      const schemaPath = path.join(this.apiPath, 'prisma', 'schema.prisma');
      const backupSchemaPath = path.join(
        this.backupDir,
        'schema.prisma.backup'
      );
      await fs.copy(schemaPath, backupSchemaPath);
      this.log('Schema backed up');

      // 导出现有数据
      this.log('Exporting existing data...');

      // 使用Prisma导出数据（需要在实际环境中实现）
      const exportScript = `
        const { PrismaClient } = require('@relax-git/shared/generated/prisma-client');
        const fs = require('fs-extra');

        async function exportData() {
          const prisma = new PrismaClient();

          try {
            const snapshots = await prisma.snapshot.findMany({
              include: {
                comments: true,
                timelineEvents: true,
                searchHistory: true,
              },
            });

            const sessionSnapshots = await prisma.sessionSnapshot.findMany();
            const baseSnapshots = await prisma.baseSnapshot.findMany();

            const exportData = {
              snapshots,
              sessionSnapshots,
              baseSnapshots,
              exportedAt: new Date().toISOString(),
            };

            await fs.writeJSON('${this.backupDir.replace(/\\/g, '/')}/data-export.json', exportData, { spaces: 2 });
            console.log('Data exported successfully');
          } catch (error) {
            console.error('Export failed:', error);
            process.exit(1);
          } finally {
            await prisma.$disconnect();
          }
        }

        exportData();
      `;

      const exportScriptPath = path.join(this.backupDir, 'export-data.js');
      await fs.writeFile(exportScriptPath, exportScript);

      // 执行数据导出
      this.execCommand(`node "${exportScriptPath}"`, 'Exporting data');

      this.success(`Backup completed successfully at ${this.backupDir}`);
      return this.backupDir;
    } catch (error) {
      this.error(`Backup failed: ${error.message}`);
      throw error;
    }
  }

  async migrate() {
    this.log('Starting data migration...');

    try {
      // 1. 生成新的Prisma客户端
      this.execCommand('pnpm db:generate', 'Generating Prisma client');

      // 2. 推送数据库schema变更
      this.execCommand('pnpm db:push', 'Pushing database schema changes');

      // 3. 执行数据迁移逻辑
      this.log('Executing data migration logic...');

      const migrationScript = `
        const { PrismaClient } = require('@prisma/client');

        async function migrateData() {
          const prisma = new PrismaClient();

          try {
            console.log('Starting data migration...');

            // 迁移传统Snapshot数据到BaseSnapshot
            const snapshots = await prisma.snapshot.findMany();
            console.log(\`Found \${snapshots.length} traditional snapshots to migrate\`);

            for (const snapshot of snapshots) {
              // 查找或创建对应的分支
              let branch = await prisma.repositoryBranch.findFirst({
                where: {
                  repoId: snapshot.repoId,
                  name: snapshot.branchName,
                },
              });

              if (!branch) {
                // 创建分支记录
                branch = await prisma.repositoryBranch.create({
                  data: {
                    repoId: snapshot.repoId,
                    name: snapshot.branchName,
                    commitSha: snapshot.commitSha,
                  },
                });
              }

              // 检查是否已存在BaseSnapshot
              const existingBaseSnapshot = await prisma.baseSnapshot.findUnique({
                where: {
                  repoId_branchId: {
                    repoId: snapshot.repoId,
                    branchId: branch.id,
                  },
                },
              });

              if (!existingBaseSnapshot) {
                // 创建新的BaseSnapshot
                await prisma.baseSnapshot.create({
                  data: {
                    repoId: snapshot.repoId,
                    branchId: branch.id,
                    commitSha: snapshot.commitSha,
                    worktreePath: snapshot.worktreePath,
                    bundlePath: snapshot.bundlePath,
                    status: snapshot.status === 'READY' ? 'READY' : 'QUEUED',
                    errorMessage: snapshot.errorMessage,
                    ownerId: snapshot.ownerId,
                    title: snapshot.title,
                    description: snapshot.description,
                    expiresAt: snapshot.expiresAt,
                    processedAt: snapshot.processedAt,
                    createdAt: snapshot.createdAt,
                    updatedAt: snapshot.updatedAt,
                  },
                });
                console.log(\`Migrated snapshot \${snapshot.id} to BaseSnapshot\`);
              }
            }

            console.log('Data migration completed successfully');
          } catch (error) {
            console.error('Migration failed:', error);
            process.exit(1);
          } finally {
            await prisma.$disconnect();
          }
        }

        migrateData();
      `;

      const migrationScriptPath = path.join(this.backupDir, 'migrate-data.js');
      await fs.writeFile(migrationScriptPath, migrationScript);

      // 执行数据迁移
      this.execCommand(`node "${migrationScriptPath}"`, 'Migrating data');

      this.success('Data migration completed successfully');
    } catch (error) {
      this.error(`Migration failed: ${error.message}`);
      throw error;
    }
  }

  async verify() {
    this.log('Starting migration verification...');

    try {
      const verificationScript = `
        const { PrismaClient } = require('@prisma/client');

        async function verifyMigration() {
          const prisma = new PrismaClient();

          try {
            const snapshotCount = await prisma.snapshot.count();
            const baseSnapshotCount = await prisma.baseSnapshot.count();
            const sessionSnapshotCount = await prisma.sessionSnapshot.count();

            console.log(\`Verification Results:\`);
            console.log(\`- Traditional Snapshots: \${snapshotCount}\`);
            console.log(\`- Base Snapshots: \${baseSnapshotCount}\`);
            console.log(\`- Session Snapshots: \${sessionSnapshotCount}\`);

            // 验证数据完整性
            const baseSnapshotsWithOwner = await prisma.baseSnapshot.count({
              where: { ownerId: { not: null } }
            });

            console.log(\`- Base Snapshots with owner: \${baseSnapshotsWithOwner}\`);

            if (baseSnapshotCount > 0) {
              console.log('✅ Migration verification passed');
            } else {
              console.log('❌ Migration verification failed: No base snapshots found');
              process.exit(1);
            }
          } catch (error) {
            console.error('Verification failed:', error);
            process.exit(1);
          } finally {
            await prisma.$disconnect();
          }
        }

        verifyMigration();
      `;

      const verificationScriptPath = path.join(
        this.backupDir,
        'verify-migration.js'
      );
      await fs.writeFile(verificationScriptPath, verificationScript);

      // 执行验证
      this.execCommand(
        `node "${verificationScriptPath}"`,
        'Verifying migration'
      );

      this.success('Migration verification completed successfully');
    } catch (error) {
      this.error(`Verification failed: ${error.message}`);
      throw error;
    }
  }

  async rollback() {
    this.log('Starting migration rollback...');

    try {
      // 恢复schema备份
      const schemaPath = path.join(this.apiPath, 'prisma', 'schema.prisma');
      const backupSchemaPath = path.join(
        this.backupDir,
        'schema.prisma.backup'
      );

      if (await fs.pathExists(backupSchemaPath)) {
        await fs.copy(backupSchemaPath, schemaPath);
        this.log('Schema restored from backup');
      }

      // 重新生成Prisma客户端
      this.execCommand('pnpm db:generate', 'Regenerating Prisma client');

      // 推送原始schema
      this.execCommand('pnpm db:push', 'Restoring database schema');

      this.success('Migration rollback completed successfully');
    } catch (error) {
      this.error(`Rollback failed: ${error.message}`);
      throw error;
    }
  }
}

// 命令行参数处理
const command = process.argv[2];
const migration = new SnapshotMigration();

async function main() {
  try {
    switch (command) {
      case 'backup':
        await migration.backup();
        break;
      case 'migrate':
        await migration.migrate();
        break;
      case 'verify':
        await migration.verify();
        break;
      case 'rollback':
        await migration.rollback();
        break;
      default:
        console.log(
          'Usage: node snapshot-migration.js [backup|migrate|verify|rollback]'
        );
        process.exit(1);
    }
  } catch (error) {
    console.error('Migration script failed:', error.message);
    process.exit(1);
  }
}

main();
