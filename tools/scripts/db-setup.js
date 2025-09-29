#!/usr/bin/env node

/**
 * 数据库设置脚本
 * 自动化数据库初始化和迁移
 * 最后更新：2025-09-26
 */

const { execSync } = require('child_process');
const path = require('path');

class DatabaseSetup {
  constructor() {
    this.apiPath = path.join(__dirname, '..', '..', 'apps', 'api');
  }

  log(message) {
    console.log(`🔧 [DB-Setup] ${message}`);
  }

  error(message) {
    console.error(`❌ [DB-Setup] ${message}`);
  }

  success(message) {
    console.log(`✅ [DB-Setup] ${message}`);
  }

  execCommand(command, description) {
    try {
      this.log(`${description}...`);
      execSync(command, {
        cwd: this.apiPath,
        stdio: 'inherit',
        env: { ...process.env, FORCE_COLOR: '1' },
      });
      this.success(`${description} completed`);
      return true;
    } catch (error) {
      this.error(`${description} failed: ${error.message}`);
      return false;
    }
  }

  async setup() {
    this.log('Starting database setup...');

    // 1. 生成 Prisma 客户端
    if (!this.execCommand('pnpm db:generate', 'Generating Prisma client')) {
      process.exit(1);
    }

    // 2. 推送数据库 schema（开发环境）
    if (process.env['NODE_ENV'] !== 'production') {
      if (!this.execCommand('pnpm db:push', 'Pushing database schema')) {
        process.exit(1);
      }
    } else {
      // 生产环境使用迁移
      if (
        !this.execCommand(
          'pnpm db:migrate:deploy',
          'Deploying database migrations'
        )
      ) {
        process.exit(1);
      }
    }

    // 3. 种子数据已禁用
    this.log('Seed data is disabled - database will remain empty');
    this.log('Users need to register through the registration page');

    this.success('Database setup completed successfully!');
    this.log('You can now start the API server with: pnpm dev');
  }

  async reset() {
    this.log('Resetting database...');

    if (!this.execCommand('pnpm db:reset', 'Resetting database')) {
      process.exit(1);
    }

    this.success('Database reset completed!');
  }

  async studio() {
    this.log('Opening Prisma Studio...');
    this.execCommand('pnpm db:studio', 'Opening Prisma Studio');
  }
}

// 命令行参数处理
const command = process.argv[2];
const setup = new DatabaseSetup();

switch (command) {
  case 'reset':
    setup.reset();
    break;
  case 'studio':
    setup.studio();
    break;
  case 'setup':
  default:
    setup.setup();
    break;
}
