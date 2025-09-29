#!/usr/bin/env node

/**
 * 简化的快照数据迁移脚本
 * 直接使用SQL命令执行数据迁移和验证
 *
 * 使用方法:
 * node tools/scripts/simple-migration.js backup
 * node tools/scripts/simple-migration.js migrate
 * node tools/scripts/simple-migration.js verify
 *
 * 最后更新：2025-09-26
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

class SimpleMigration {
  constructor() {
    this.backupDir = path.join(
      __dirname,
      '..',
      '..',
      'backups',
      `simple-migration-${this.getTimestamp()}`
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

  /**
   * 执行SQL命令
   */
  executeSql(sql, description) {
    try {
      this.log(`Executing: ${description}`);
      const result = execSync(`cd apps/api && pnpm prisma db execute --stdin`, {
        input: sql,
        encoding: 'utf8',
      });
      this.success(`${description} completed`);
      return result;
    } catch (error) {
      this.error(`${description} failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 数据备份
   */
  async backup() {
    this.log('Starting simple data backup...');

    try {
      // 创建备份目录
      await fs.ensureDir(this.backupDir);
      this.log(`Backup directory created: ${this.backupDir}`);

      // 备份数据库schema
      const schemaPath = path.join(
        __dirname,
        '..',
        '..',
        'apps',
        'api',
        'prisma',
        'schema.prisma'
      );
      const backupSchemaPath = path.join(
        this.backupDir,
        'schema.prisma.backup'
      );
      await fs.copy(schemaPath, backupSchemaPath);
      this.log('Schema backed up');

      // 使用pg_dump备份数据（如果可用）
      try {
        const backupSql = `
-- 备份现有快照数据
CREATE TABLE IF NOT EXISTS backup_snapshots AS SELECT * FROM snapshots;
CREATE TABLE IF NOT EXISTS backup_session_snapshots AS SELECT * FROM session_snapshots;
CREATE TABLE IF NOT EXISTS backup_base_snapshots AS SELECT * FROM base_snapshots;

-- 记录备份信息
INSERT INTO migration_log (operation, table_name, record_count, status)
VALUES
  ('backup', 'snapshots', (SELECT COUNT(*) FROM snapshots), 'completed'),
  ('backup', 'session_snapshots', (SELECT COUNT(*) FROM session_snapshots), 'completed'),
  ('backup', 'base_snapshots', (SELECT COUNT(*) FROM base_snapshots), 'completed');
        `;

        this.executeSql(backupSql, 'Database backup');
        this.success('Data backup completed successfully');
      } catch (error) {
        this.log('SQL backup failed, continuing with file backup...');
        // 创建一个简单的备份记录
        const backupInfo = {
          timestamp: new Date().toISOString(),
          operation: 'backup',
          status: 'completed_with_warnings',
          message: 'SQL backup failed, but schema backup succeeded',
        };
        await fs.writeJSON(
          path.join(this.backupDir, 'backup-info.json'),
          backupInfo,
          { spaces: 2 }
        );
      }
    } catch (error) {
      this.error(`Backup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 执行数据迁移
   */
  async migrate() {
    this.log('Starting data migration...');

    try {
      // 执行统一快照迁移SQL
      const migrationSql = `
-- 开始迁移事务
BEGIN;

-- 1. 确保base_snapshots表已经扩展（应该已经通过Prisma schema完成）
-- 检查并添加缺失的字段和索引
DO $$
BEGIN
    -- 检查并添加owner_id字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'base_snapshots' AND column_name = 'owner_id') THEN
        ALTER TABLE base_snapshots ADD COLUMN owner_id TEXT;
    END IF;

    -- 检查并添加title字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'base_snapshots' AND column_name = 'title') THEN
        ALTER TABLE base_snapshots ADD COLUMN title TEXT;
    END IF;

    -- 检查并添加description字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'base_snapshots' AND column_name = 'description') THEN
        ALTER TABLE base_snapshots ADD COLUMN description TEXT;
    END IF;

    -- 检查并添加expires_at字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'base_snapshots' AND column_name = 'expires_at') THEN
        ALTER TABLE base_snapshots ADD COLUMN expires_at TIMESTAMP;
    END IF;

    -- 检查并添加last_accessed_at字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'base_snapshots' AND column_name = 'last_accessed_at') THEN
        ALTER TABLE base_snapshots ADD COLUMN last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- 检查并添加access_count字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'base_snapshots' AND column_name = 'access_count') THEN
        ALTER TABLE base_snapshots ADD COLUMN access_count INTEGER DEFAULT 0;
    END IF;

    -- 添加索引（如果不存在）
    CREATE INDEX IF NOT EXISTS idx_base_snapshots_owner_id ON base_snapshots(owner_id);
    CREATE INDEX IF NOT EXISTS idx_base_snapshots_expires_at ON base_snapshots(expires_at);
    CREATE INDEX IF NOT EXISTS idx_base_snapshots_last_accessed_at ON base_snapshots(last_accessed_at);

    -- 添加外键约束（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'fk_base_snapshots_owner_id') THEN
        ALTER TABLE base_snapshots
        ADD CONSTRAINT fk_base_snapshots_owner_id
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. 更新现有base_snapshots记录
UPDATE base_snapshots
SET last_accessed_at = COALESCE(updated_at, created_at)
WHERE last_accessed_at IS NULL;

-- 3. 记录迁移开始
INSERT INTO migration_log (operation, table_name, record_count, status)
VALUES ('migration_start', 'base_snapshots',
        (SELECT COUNT(*) FROM base_snapshots), 'completed');

-- 提交事务
COMMIT;

-- 验证迁移结果
DO $$
DECLARE
    base_snapshot_count INTEGER;
    snapshot_count INTEGER;
    session_snapshot_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO base_snapshot_count FROM base_snapshots;
    SELECT COUNT(*) INTO snapshot_count FROM snapshots;
    SELECT COUNT(*) INTO session_snapshot_count FROM session_snapshots;

    RAISE NOTICE 'Migration verification:';
    RAISE NOTICE '- Base snapshots: %', base_snapshot_count;
    RAISE NOTICE '- Traditional snapshots: %', snapshot_count;
    RAISE NOTICE '- Session snapshots: %', session_snapshot_count;

    -- 记录验证结果
    INSERT INTO migration_log (operation, table_name, record_count, status)
    VALUES ('migration_verify', 'all_snapshots',
            base_snapshot_count + snapshot_count + session_snapshot_count, 'completed');
END $$;
      `;

      this.executeSql(migrationSql, 'Data migration');
      this.success('Data migration completed successfully');
    } catch (error) {
      this.error(`Migration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 验证迁移结果
   */
  async verify() {
    this.log('Starting migration verification...');

    try {
      const verificationSql = `
-- 验证数据完整性
DO $$
DECLARE
    base_snapshot_count INTEGER;
    snapshot_count INTEGER;
    session_snapshot_count INTEGER;
    extended_base_snapshots INTEGER;
BEGIN
    -- 统计各类快照数量
    SELECT COUNT(*) INTO base_snapshot_count FROM base_snapshots;
    SELECT COUNT(*) INTO snapshot_count FROM snapshots;
    SELECT COUNT(*) INTO session_snapshot_count FROM session_snapshots;

    -- 统计扩展字段的base_snapshots
    SELECT COUNT(*) INTO extended_base_snapshots
    FROM base_snapshots
    WHERE last_accessed_at IS NOT NULL;

    RAISE NOTICE '=== Migration Verification Results ===';
    RAISE NOTICE 'Base snapshots: %', base_snapshot_count;
    RAISE NOTICE 'Traditional snapshots: %', snapshot_count;
    RAISE NOTICE 'Session snapshots: %', session_snapshot_count;
    RAISE NOTICE 'Extended base snapshots: %', extended_base_snapshots;
    RAISE NOTICE 'Total snapshots: %', base_snapshot_count + snapshot_count + session_snapshot_count;

    -- 验证扩展字段
    IF extended_base_snapshots = base_snapshot_count THEN
        RAISE NOTICE '✅ All base snapshots have extended fields';
    ELSE
        RAISE WARNING '⚠️ Some base snapshots missing extended fields';
    END IF;

    -- 记录验证结果
    INSERT INTO migration_log (operation, table_name, record_count, status)
    VALUES
      ('verification', 'base_snapshots', base_snapshot_count, 'completed'),
      ('verification', 'snapshots', snapshot_count, 'completed'),
      ('verification', 'session_snapshots', session_snapshot_count, 'completed'),
      ('verification_summary', 'all_snapshots',
       base_snapshot_count + snapshot_count + session_snapshot_count, 'completed');
END $$;

-- 检查索引是否存在
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'base_snapshots'
  AND indexname LIKE 'idx_base_snapshots_%'
ORDER BY indexname;
      `;

      this.executeSql(verificationSql, 'Migration verification');
      this.success('Migration verification completed successfully');
    } catch (error) {
      this.error(`Verification failed: ${error.message}`);
      throw error;
    }
  }
}

// 主函数
async function main() {
  const operation = process.argv[2];

  if (!operation || !['backup', 'migrate', 'verify'].includes(operation)) {
    console.log('Usage: node simple-migration.js [backup|migrate|verify]');
    process.exit(1);
  }

  const migration = new SimpleMigration();

  try {
    switch (operation) {
      case 'backup':
        await migration.backup();
        break;
      case 'migrate':
        await migration.migrate();
        break;
      case 'verify':
        await migration.verify();
        break;
    }
  } catch (error) {
    console.error('Migration script failed:', error.message);
    process.exit(1);
  }
}

main();
