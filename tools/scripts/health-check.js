#!/usr/bin/env node

/**
 * Relax-Git 项目健康检查脚本
 * 检查项目配置、依赖和基础设施的健康状态
 * 最后更新：2025-08-11 23:30:19 CST
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class HealthChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  log(type, message) {
    const timestamp = new Date().toISOString();
    const prefix =
      {
        error: '❌',
        warning: '⚠️',
        success: '✅',
        info: 'ℹ️',
      }[type] || 'ℹ️';

    console.log(`${prefix} [${timestamp}] ${message}`);

    if (type === 'error') this.errors.push(message);
    if (type === 'warning') this.warnings.push(message);
    if (type === 'success') this.success.push(message);
  }

  checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
      this.log('success', `${description}: ${filePath}`);
      return true;
    } else {
      this.log('error', `Missing ${description}: ${filePath}`);
      return false;
    }
  }

  checkOptionalFile(filePath, description) {
    if (fs.existsSync(filePath)) {
      this.log('success', `${description}: ${filePath}`);
      return true;
    }

    this.log('warning', `Optional ${description} not found: ${filePath}`);
    return false;
  }

  checkDirectory(dirPath, description) {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      this.log('success', `${description}: ${dirPath}`);
      return true;
    } else {
      this.log('error', `Missing ${description}: ${dirPath}`);
      return false;
    }
  }

  checkCommand(command, description) {
    try {
      execSync(command, { stdio: 'pipe' });
      this.log('success', `${description} is available`);
      return true;
    } catch (error) {
      this.log('error', `${description} is not available: ${command}`);
      return false;
    }
  }

  checkDependenciesInstalled() {
    try {
      // 检查 node_modules 是否存在
      if (!fs.existsSync('node_modules')) {
        this.log('error', 'node_modules directory not found - run npm install');
        return false;
      }

      // 检查关键依赖是否安装
      const criticalDeps = ['prettier', 'eslint', 'typescript', 'turbo'];
      for (const dep of criticalDeps) {
        const depPath = path.join('node_modules', dep);
        if (!fs.existsSync(depPath)) {
          this.log('error', `Critical dependency missing: ${dep}`);
          return false;
        } else {
          this.log('success', `Dependency installed: ${dep}`);
        }
      }

      return true;
    } catch (error) {
      this.log('error', `Dependency check failed: ${error.message}`);
      return false;
    }
  }

  async runScriptTests() {
    const scriptsToTest = [
      { script: 'npx tsc --noEmit', description: 'TypeScript compilation' },
      {
        script: 'npx eslint "libs/**/*.ts" --quiet',
        description: 'ESLint check',
      },
      { script: 'npm run format:check', description: 'Prettier format check' },
    ];

    for (const { script, description } of scriptsToTest) {
      try {
        this.log('info', `Testing: ${description}...`);
        execSync(script, { stdio: 'pipe', timeout: 30000 });
        this.log('success', `${description} passed`);
      } catch (error) {
        this.log('error', `${description} failed: ${script}`);
        this.log('error', `Error details: ${error.message}`);
      }
    }
  }

  checkPackageJson(packagePath) {
    if (!this.checkFile(packagePath, 'package.json')) return false;

    try {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      // 检查必要字段
      const requiredFields = ['name', 'version', 'scripts'];
      for (const field of requiredFields) {
        if (!pkg[field]) {
          this.log('error', `Missing ${field} in ${packagePath}`);
          return false;
        }
      }

      this.log('success', `Valid package.json: ${pkg.name}@${pkg.version}`);
      return true;
    } catch (error) {
      this.log('error', `Invalid JSON in ${packagePath}: ${error.message}`);
      return false;
    }
  }

  async runChecks() {
    this.log('info', 'Starting Relax-Git COMPREHENSIVE health check...');

    // 检查根目录文件
    this.log('info', 'Checking root configuration files...');
    this.checkFile('package.json', 'Root package.json');
    this.checkFile('pnpm-workspace.yaml', 'PNPM workspace config');
    this.checkFile('tsconfig.json', 'TypeScript config');
    this.checkFile('turbo.json', 'Turbo config');
    this.checkFile('.eslintrc.js', 'ESLint config');
    this.checkFile('.prettierrc', 'Prettier config');
    this.checkFile('.gitignore', 'Git ignore');
    this.checkFile('.env.example', 'Environment example');

    // 检查依赖安装状态
    this.log('info', 'Checking dependency installation...');
    this.checkDependenciesInstalled();

    // 检查 Docker 配置
    this.log('info', 'Checking Docker configuration...');
    this.checkFile('docker-compose.dev.yml', 'Docker Compose dev config');
    this.checkFile('.dockerignore', 'Docker ignore');

    // 检查项目结构
    this.log('info', 'Checking project structure...');
    this.checkDirectory('apps', 'Apps directory');
    this.checkDirectory('apps/api', 'API app directory');
    this.checkDirectory('apps/web', 'Web app directory');
    this.checkDirectory('apps/worker', 'Worker app directory');
    this.checkDirectory('libs', 'Libs directory');
    this.checkDirectory('libs/shared', 'Shared lib directory');

    // 检查应用配置
    this.log('info', 'Checking application configurations...');
    this.checkPackageJson('apps/api/package.json');
    this.checkPackageJson('apps/web/package.json');
    this.checkPackageJson('libs/shared/package.json');

    // 检查 API 应用文件
    this.log('info', 'Checking API application files...');
    this.checkFile('apps/api/src/main.ts', 'API main file');
    this.checkFile('apps/api/src/app.module.ts', 'API app module');
    this.checkFile('apps/api/src/database/prisma.service.ts', 'Prisma service');
    this.checkFile(
      'apps/api/src/database/database.module.ts',
      'Database module'
    );
    this.checkFile('apps/api/src/redis/redis.service.ts', 'Redis service');
    this.checkFile('apps/api/src/redis/redis.module.ts', 'Redis module');
    this.checkFile(
      'apps/api/src/health/health.controller.ts',
      'Health controller'
    );
    this.checkFile('apps/api/src/health/health.service.ts', 'Health service');
    this.checkFile('apps/api/src/health/health.module.ts', 'Health module');
    this.checkFile('apps/api/prisma/schema.prisma', 'Prisma schema');

    // 检查 Web 应用文件
    this.log('info', 'Checking Web application files...');
    this.checkFile('apps/web/src/app/layout.tsx', 'Web app layout');
    this.checkFile('apps/web/src/app/page.tsx', 'Web app home page');
    this.checkFile('apps/web/src/app/globals.css', 'Global styles');
    this.checkFile('apps/web/src/lib/utils.ts', 'Utility functions');
    this.checkFile('apps/web/src/components/providers.tsx', 'React providers');
    this.checkFile(
      'apps/web/src/components/socket-provider.tsx',
      'Socket provider'
    );
    this.checkFile(
      'apps/web/src/components/connection-status.tsx',
      'Connection status'
    );
    this.checkFile('apps/web/src/components/ui/button.tsx', 'Button component');
    this.checkFile('apps/web/src/components/ui/toast.tsx', 'Toast component');
    this.checkFile(
      'apps/web/src/components/ui/toaster.tsx',
      'Toaster component'
    );
    this.checkFile('apps/web/src/stores/auth-store.ts', 'Auth store');
    this.checkFile('apps/web/src/stores/app-store.ts', 'App store');
    this.checkFile('apps/web/src/hooks/use-toast.ts', 'Toast hook');
    this.checkFile('apps/web/next.config.js', 'Next.js config');
    this.checkFile('apps/web/tailwind.config.js', 'Tailwind config');
    this.checkFile('apps/web/postcss.config.js', 'PostCSS config');
    this.checkFile('apps/web/next-env.d.ts', 'Next.js types');

    // 检查 Go 配置
    this.checkFile('apps/worker/go.mod', 'Go module');
    this.checkFile('apps/worker/go.sum', 'Go dependencies');
    this.checkFile('apps/worker/main.go', 'Go main file');
    this.checkFile('apps/worker/Makefile', 'Go Makefile');
    this.checkFile('apps/worker/Dockerfile', 'Go Dockerfile');

    // 检查共享库
    this.log('info', 'Checking shared library...');
    this.checkFile('libs/shared/src/index.ts', 'Shared lib entry');
    this.checkFile('libs/shared/src/types/common.ts', 'Common types');
    this.checkFile('libs/shared/src/types/database.ts', 'Database types');
    this.checkFile('libs/shared/src/types/api.ts', 'API types');
    this.checkFile(
      'libs/shared/src/config/database.config.ts',
      'Database config'
    );
    this.checkFile('libs/shared/src/config/redis.config.ts', 'Redis config');
    this.checkFile('libs/shared/src/utils/validation.ts', 'Validation utils');
    this.checkFile('libs/shared/src/utils/constants.ts', 'Constants');

    // 检查 Prisma 客户端生成状态
    const prismaClientPath = 'libs/shared/src/generated/prisma-client/index.js';
    if (fs.existsSync(prismaClientPath)) {
      this.log('success', 'Prisma client generated');
    } else {
      this.log(
        'warning',
        'Prisma client not generated - run "pnpm db:generate"'
      );
    }

    // 检查开发工具
    this.log('info', 'Checking development tools...');
    this.checkCommand('node --version', 'Node.js');
    this.checkCommand('pnpm --version', 'PNPM');
    this.checkCommand('docker --version', 'Docker');
    this.checkCommand('docker compose version', 'Docker Compose');
    this.checkCommand('go version', 'Go');

    // 动态验证 - 运行关键脚本
    this.log('info', 'Running dynamic validation tests...');
    await this.runScriptTests();

    // 检查 VS Code 配置
    this.log('info', 'Checking VS Code configuration...');
    this.checkOptionalFile('.vscode/settings.json', 'VS Code settings');
    this.checkOptionalFile('.vscode/extensions.json', 'VS Code extensions');

    // 生成报告
    this.generateReport();
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('HEALTH CHECK REPORT');
    console.log('='.repeat(60));

    console.log(`✅ Successful checks: ${this.success.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    const healthScore = Math.round(
      (this.success.length /
        (this.success.length + this.errors.length + this.warnings.length)) *
        100
    );

    console.log(`\n🏥 Overall Health Score: ${healthScore}%`);

    if (this.errors.length === 0) {
      console.log('🎉 Project is healthy and ready for development!');
      process.exit(0);
    } else {
      console.log('🚨 Project has issues that need to be addressed.');
      process.exit(1);
    }
  }
}

// 运行健康检查
const checker = new HealthChecker();
checker.runChecks().catch(error => {
  console.error('Health check failed:', error);
  process.exit(1);
});
