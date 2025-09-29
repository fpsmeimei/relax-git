#!/usr/bin/env node

/**
 * 验证快照迁移脚本的语法和逻辑
 * 在实际执行迁移前进行预检查
 */

const fs = require('fs-extra');
const path = require('path');

class MigrationValidator {
  constructor() {
    this.apiPath = path.join(__dirname, '..', '..', 'apps', 'api');
    this.errors = [];
    this.warnings = [];
  }

  log(message) {
    console.log(`🔍 [Validator] ${message}`);
  }

  error(message) {
    this.errors.push(message);
    console.error(`❌ [Validator] ${message}`);
  }

  warning(message) {
    this.warnings.push(message);
    console.warn(`⚠️ [Validator] ${message}`);
  }

  success(message) {
    console.log(`✅ [Validator] ${message}`);
  }

  async validateSchema() {
    this.log('Validating Prisma schema...');

    const schemaPath = path.join(this.apiPath, 'prisma', 'schema.prisma');

    if (!(await fs.pathExists(schemaPath))) {
      this.error('Prisma schema file not found');
      return false;
    }

    const schemaContent = await fs.readFile(schemaPath, 'utf8');

    // 检查BaseSnapshot模型是否包含新字段
    const requiredFields = [
      'ownerId',
      'title',
      'description',
      'expiresAt',
      'lastAccessedAt',
      'accessCount',
    ];

    const baseSnapshotMatch = schemaContent.match(
      /model BaseSnapshot \{[\s\S]*?\}/
    );
    if (!baseSnapshotMatch) {
      this.error('BaseSnapshot model not found in schema');
      return false;
    }

    const baseSnapshotModel = baseSnapshotMatch[0];

    for (const field of requiredFields) {
      if (!baseSnapshotModel.includes(field)) {
        this.error(`Required field '${field}' not found in BaseSnapshot model`);
      }
    }

    // 检查User模型是否包含BaseSnapshot关联
    if (
      !schemaContent.includes('baseSnapshots') ||
      !schemaContent.includes('BaseSnapshotOwner')
    ) {
      this.error('BaseSnapshot relation not found in User model');
    }

    this.success('Schema validation completed');
    return this.errors.length === 0;
  }

  async validateMigrationScript() {
    this.log('Validating migration script...');

    const migrationScriptPath = path.join(__dirname, 'snapshot-migration.js');

    if (!(await fs.pathExists(migrationScriptPath))) {
      this.error('Migration script not found');
      return false;
    }

    try {
      // 读取脚本内容进行基本检查
      const scriptContent = await fs.readFile(migrationScriptPath, 'utf8');

      // 检查必要的类和方法
      const requiredElements = [
        'class SnapshotMigration',
        'async backup()',
        'async migrate()',
        'async verify()',
        'async rollback()',
        'execCommand',
        'PrismaClient',
      ];

      for (const element of requiredElements) {
        if (!scriptContent.includes(element)) {
          this.error(
            `Required element not found in migration script: ${element}`
          );
        }
      }

      this.success('Migration script structure is valid');
    } catch (error) {
      this.error(`Migration script validation error: ${error.message}`);
      return false;
    }

    return this.errors.length === 0;
  }

  async validateSqlMigration() {
    this.log('Validating SQL migration file...');

    const sqlPath = path.join(
      this.apiPath,
      'prisma',
      'migrations',
      'unified_snapshots.sql'
    );

    if (!(await fs.pathExists(sqlPath))) {
      this.error('SQL migration file not found');
      return false;
    }

    const sqlContent = await fs.readFile(sqlPath, 'utf8');

    // 基本SQL语法检查
    const requiredStatements = [
      'ALTER TABLE base_snapshots',
      'ADD COLUMN owner_id',
      'ADD COLUMN title',
      'ADD COLUMN description',
      'ADD COLUMN expires_at',
      'ADD COLUMN last_accessed_at',
      'ADD COLUMN access_count',
      'CREATE INDEX',
      'BEGIN;',
      'COMMIT;',
    ];

    for (const statement of requiredStatements) {
      if (!sqlContent.includes(statement)) {
        this.error(`Required SQL statement not found: ${statement}`);
      }
    }

    this.success('SQL migration validation completed');
    return this.errors.length === 0;
  }

  async validateBackupDirectory() {
    this.log('Validating backup directory structure...');

    const backupsDir = path.join(__dirname, '..', '..', 'backups');

    try {
      await fs.ensureDir(backupsDir);

      // 测试写入权限
      const testFile = path.join(backupsDir, 'test-write.tmp');
      await fs.writeFile(testFile, 'test');
      await fs.remove(testFile);

      this.success('Backup directory is accessible and writable');
      return true;
    } catch (error) {
      this.error(`Backup directory validation failed: ${error.message}`);
      return false;
    }
  }

  async run() {
    this.log('Starting migration validation...');

    const validations = [
      await this.validateSchema(),
      await this.validateMigrationScript(),
      await this.validateSqlMigration(),
      await this.validateBackupDirectory(),
    ];

    const allValid = validations.every(v => v);

    console.log('\n📊 Validation Summary:');
    console.log(`Errors: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ Validation Errors:');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ Validation Warnings:');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    if (allValid) {
      this.success('All validations passed! Migration is ready to execute.');
      return true;
    } else {
      this.error(
        'Validation failed! Please fix the issues before running migration.'
      );
      return false;
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const validator = new MigrationValidator();
  validator
    .run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation script failed:', error);
      process.exit(1);
    });
}

module.exports = MigrationValidator;
