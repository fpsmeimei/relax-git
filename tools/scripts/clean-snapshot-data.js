#!/usr/bin/env node

/**
 * 快照数据清理脚本
 * 清空所有快照相关数据，让系统像全新安装一样
 *
 * 使用方法:
 * node tools/scripts/clean-snapshot-data.js
 *
 * 最后更新：2025-09-26
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

class SnapshotDataCleaner {
  constructor() {
    this.backupDir = path.join(
      __dirname,
      '..',
      '..',
      'backups',
      `clean-data-${this.getTimestamp()}`
    );
    this.logFile = path.join(this.backupDir, 'clean.log');
  }

  getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(`🧹 [Cleaner] ${message}`);

    // 写入日志文件
    if (fs.existsSync(this.backupDir)) {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    }
  }

  error(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message}`;
    console.error(`❌ [Cleaner] ${message}`);

    if (fs.existsSync(this.backupDir)) {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    }
  }

  success(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] SUCCESS: ${message}`;
    console.log(`✅ [Cleaner] ${message}`);

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
      const result = execSync(
        `cd apps/api && echo "${sql}" | pnpm prisma db execute --stdin`,
        {
          encoding: 'utf8',
          shell: true,
        }
      );
      this.success(`${description} completed`);
      return result;
    } catch (error) {
      this.error(`${description} failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 清理快照数据
   */
  async cleanSnapshotData() {
    this.log('Starting snapshot data cleanup...');

    try {
      // 创建备份目录
      await fs.ensureDir(this.backupDir);
      this.log(`Backup directory created: ${this.backupDir}`);

      // 清理SQL
      const cleanupSql = `
-- 开始清理事务
BEGIN;

-- 1. 清理关联数据（评论、时间线事件等）
DELETE FROM comments WHERE "snapshotId" IS NOT NULL;
DELETE FROM timeline_events WHERE "snapshotId" IS NOT NULL;
DELETE FROM search_history WHERE "snapshotId" IS NOT NULL;

-- 2. 清理快照数据
DELETE FROM session_snapshots;
DELETE FROM base_snapshots;
DELETE FROM snapshot_artifacts;

-- 3. 清理备份表（如果存在）
DROP TABLE IF EXISTS backup_snapshots;
DROP TABLE IF EXISTS backup_session_snapshots;
DROP TABLE IF EXISTS backup_base_snapshots;

-- 4. 清理迁移日志
DELETE FROM migration_log;

-- 5. 重置序列（如果需要）
-- 这将重置自增ID，让新数据从1开始
SELECT setval(pg_get_serial_sequence('base_snapshots', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('snapshots', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('session_snapshots', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('comments', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('timeline_events', 'id'), 1, false);

-- 提交事务
COMMIT;

-- 验证清理结果
DO $$
DECLARE
    base_snapshot_count INTEGER;
    snapshot_count INTEGER;
    session_snapshot_count INTEGER;
    comment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO base_snapshot_count FROM base_snapshots;
    SELECT COUNT(*) INTO snapshot_count FROM snapshots;
    SELECT COUNT(*) INTO session_snapshot_count FROM session_snapshots;
    SELECT COUNT(*) INTO comment_count FROM comments WHERE snapshot_id IS NOT NULL;

    RAISE NOTICE '=== Cleanup Verification Results ===';
    RAISE NOTICE 'Base snapshots: %', base_snapshot_count;
    RAISE NOTICE 'Traditional snapshots: %', snapshot_count;
    RAISE NOTICE 'Session snapshots: %', session_snapshot_count;
    RAISE NOTICE 'Snapshot comments: %', comment_count;

    IF base_snapshot_count = 0 AND snapshot_count = 0 AND session_snapshot_count = 0 THEN
        RAISE NOTICE '✅ All snapshot data cleaned successfully';
    ELSE
        RAISE WARNING '⚠️ Some snapshot data may still exist';
    END IF;
END $$;
      `;

      this.executeSql(cleanupSql, 'Snapshot data cleanup');
      this.success('Snapshot data cleanup completed successfully');
    } catch (error) {
      this.error(`Cleanup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 清理文件系统中的快照文件
   */
  async cleanSnapshotFiles() {
    this.log('Starting snapshot files cleanup...');

    try {
      // 清理可能的快照工作树目录
      const possibleDirs = [
        path.join(__dirname, '..', '..', 'snapshots'),
        path.join(__dirname, '..', '..', 'worktrees'),
        path.join(__dirname, '..', '..', 'temp', 'snapshots'),
        path.join(__dirname, '..', '..', 'apps', 'api', 'snapshots'),
        path.join(__dirname, '..', '..', 'apps', 'api', 'worktrees'),
      ];

      for (const dir of possibleDirs) {
        if (await fs.pathExists(dir)) {
          this.log(`Removing snapshot directory: ${dir}`);
          await fs.remove(dir);
          this.success(`Removed: ${dir}`);
        }
      }

      this.success('Snapshot files cleanup completed');
    } catch (error) {
      this.error(`File cleanup failed: ${error.message}`);
      // 文件清理失败不应该阻止整个过程
      this.log('Continuing despite file cleanup errors...');
    }
  }

  /**
   * 验证清理结果
   */
  async verifyCleanup() {
    this.log('Verifying cleanup results...');

    try {
      const verificationSql = `
-- 验证所有快照表都为空
DO $$
DECLARE
    total_snapshots INTEGER;
    total_comments INTEGER;
    total_timeline_events INTEGER;
BEGIN
    SELECT
        (SELECT COUNT(*) FROM base_snapshots) +
        (SELECT COUNT(*) FROM snapshots) +
        (SELECT COUNT(*) FROM session_snapshots)
    INTO total_snapshots;

    SELECT COUNT(*) INTO total_comments FROM comments WHERE snapshot_id IS NOT NULL;
    SELECT COUNT(*) INTO total_timeline_events FROM timeline_events WHERE snapshot_id IS NOT NULL;

    RAISE NOTICE '=== Final Verification ===';
    RAISE NOTICE 'Total snapshots: %', total_snapshots;
    RAISE NOTICE 'Snapshot-related comments: %', total_comments;
    RAISE NOTICE 'Snapshot-related timeline events: %', total_timeline_events;

    IF total_snapshots = 0 AND total_comments = 0 AND total_timeline_events = 0 THEN
        RAISE NOTICE '🎉 System is now clean and ready for fresh start!';
    ELSE
        RAISE WARNING '⚠️ Some data may still exist, manual cleanup may be needed';
    END IF;
END $$;
      `;

      this.executeSql(verificationSql, 'Cleanup verification');
      this.success('Cleanup verification completed');
    } catch (error) {
      this.error(`Verification failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 执行完整的清理流程
   */
  async clean() {
    this.log('🧹 Starting complete snapshot data cleanup...');
    this.log(
      'This will remove ALL snapshot data and make the system like a fresh install'
    );

    try {
      // 1. 清理数据库数据
      await this.cleanSnapshotData();

      // 2. 清理文件系统
      await this.cleanSnapshotFiles();

      // 3. 验证清理结果
      await this.verifyCleanup();

      this.success(
        '🎉 Complete cleanup finished! Relax-Git is now like a fresh installation.'
      );
      this.log(`Cleanup log saved to: ${this.logFile}`);
    } catch (error) {
      this.error(`Complete cleanup failed: ${error.message}`);
      throw error;
    }
  }
}

// 主函数
async function main() {
  console.log('🧹 Relax-Git Snapshot Data Cleaner');
  console.log(
    'This will remove ALL snapshot data and make the system like a fresh install.'
  );
  console.log('');

  const cleaner = new SnapshotDataCleaner();

  try {
    await cleaner.clean();
  } catch (error) {
    console.error('Cleanup script failed:', error.message);
    process.exit(1);
  }
}

main();
