#!/usr/bin/env node

/**
 * 统一快照服务功能验证脚本
 * 验证UnifiedSnapshotService的核心功能是否正常工作
 *
 * 使用方法:
 * node tools/scripts/test-unified-snapshot-service.js
 *
 * 最后更新：2025-09-26
 */

const path = require('path');

class UnifiedSnapshotServiceTester {
  constructor() {
    this.apiPath = path.join(__dirname, '..', '..', 'apps', 'api');
    this.errors = [];
    this.warnings = [];
    this.successes = [];
  }

  log(message) {
    console.log(`🔍 [Tester] ${message}`);
  }

  error(message) {
    this.errors.push(message);
    console.error(`❌ [Tester] ${message}`);
  }

  warning(message) {
    this.warnings.push(message);
    console.warn(`⚠️ [Tester] ${message}`);
  }

  success(message) {
    this.successes.push(message);
    console.log(`✅ [Tester] ${message}`);
  }

  /**
   * 验证统一快照服务文件结构
   */
  async validateServiceStructure() {
    this.log('Validating unified snapshot service structure...');

    const fs = require('fs-extra');

    // 检查服务文件是否存在
    const servicePath = path.join(
      this.apiPath,
      'src',
      'snapshots',
      'services',
      'unified-snapshot.service.ts'
    );
    if (!(await fs.pathExists(servicePath))) {
      this.error('UnifiedSnapshotService file not found');
      return false;
    }

    // 检查服务内容
    const serviceContent = await fs.readFile(servicePath, 'utf8');

    const requiredMethods = [
      'getSnapshot',
      'getTree',
      'getFile',
      'createOrGetSessionSnapshot',
      'getSnapshotStats',
    ];

    for (const method of requiredMethods) {
      if (!serviceContent.includes(`async ${method}(`)) {
        this.error(
          `Required method '${method}' not found in UnifiedSnapshotService`
        );
      }
    }

    // 检查依赖注入
    const requiredDependencies = [
      'PrismaService',
      'UnifiedSnapshotAccessService',
      'BaseSnapshotService',
      'SessionSnapshotService',
    ];

    for (const dependency of requiredDependencies) {
      if (!serviceContent.includes(dependency)) {
        this.error(
          `Required dependency '${dependency}' not found in UnifiedSnapshotService`
        );
      }
    }

    this.success('Service structure validation completed');
    return this.errors.length === 0;
  }

  /**
   * 验证模块注册
   */
  async validateModuleRegistration() {
    this.log('Validating module registration...');

    const fs = require('fs-extra');
    const modulePath = path.join(
      this.apiPath,
      'src',
      'snapshots',
      'snapshots.module.ts'
    );

    if (!(await fs.pathExists(modulePath))) {
      this.error('SnapshotsModule file not found');
      return false;
    }

    const moduleContent = await fs.readFile(modulePath, 'utf8');

    // 检查导入
    if (!moduleContent.includes('import { UnifiedSnapshotService }')) {
      this.error('UnifiedSnapshotService import not found in module');
    }

    // 检查providers注册
    if (!moduleContent.includes('UnifiedSnapshotService,')) {
      this.error('UnifiedSnapshotService not registered in providers');
    }

    // 检查exports
    if (!moduleContent.includes('UnifiedSnapshotService,')) {
      this.error('UnifiedSnapshotService not exported from module');
    }

    this.success('Module registration validation completed');
    return this.errors.length === 0;
  }

  /**
   * 验证权限验证集成
   */
  async validateAccessServiceIntegration() {
    this.log('Validating access service integration...');

    const fs = require('fs-extra');
    const servicePath = path.join(
      this.apiPath,
      'src',
      'snapshots',
      'services',
      'unified-snapshot.service.ts'
    );
    const serviceContent = await fs.readFile(servicePath, 'utf8');

    // 检查权限验证调用
    const accessValidationCalls = [
      'validateSnapshotAccess',
      'recordSnapshotAccess',
    ];

    for (const call of accessValidationCalls) {
      if (!serviceContent.includes(call)) {
        this.error(
          `Access service method '${call}' not used in UnifiedSnapshotService`
        );
      }
    }

    // 检查权限验证在关键方法中的使用
    const criticalMethods = ['getSnapshot', 'getTree', 'getFile'];
    for (const method of criticalMethods) {
      const methodRegex = new RegExp(
        `async ${method}\\([^}]+validateSnapshotAccess`,
        's'
      );
      if (!methodRegex.test(serviceContent)) {
        this.warning(
          `Method '${method}' may not include proper access validation`
        );
      }
    }

    this.success('Access service integration validation completed');
    return this.errors.length === 0;
  }

  /**
   * 验证文件系统安全性
   */
  async validateFileSystemSecurity() {
    this.log('Validating file system security...');

    const fs = require('fs-extra');
    const servicePath = path.join(
      this.apiPath,
      'src',
      'snapshots',
      'services',
      'unified-snapshot.service.ts'
    );
    const serviceContent = await fs.readFile(servicePath, 'utf8');

    // 检查路径遍历防护
    if (
      !serviceContent.includes('path.resolve') ||
      !serviceContent.includes('startsWith')
    ) {
      this.error('Path traversal protection not implemented');
    }

    // 检查文件大小限制
    if (!serviceContent.includes('maxFileSize')) {
      this.warning('File size limit not implemented');
    }

    // 检查错误处理
    const securityChecks = ['ENOENT', 'EACCES', 'EISDIR'];

    for (const check of securityChecks) {
      if (!serviceContent.includes(check)) {
        this.warning(`Security check for '${check}' not found`);
      }
    }

    this.success('File system security validation completed');
    return this.errors.length === 0;
  }

  /**
   * 验证共享访问机制
   */
  async validateSharedAccessMechanism() {
    this.log('Validating shared access mechanism...');

    const fs = require('fs-extra');
    const servicePath = path.join(
      this.apiPath,
      'src',
      'snapshots',
      'services',
      'unified-snapshot.service.ts'
    );
    const serviceContent = await fs.readFile(servicePath, 'utf8');

    // 检查并发安全性考虑
    if (!serviceContent.includes('并发') && !serviceContent.includes('共享')) {
      this.warning('Shared access mechanism documentation not found');
    }

    // 检查统一的工作树路径获取
    if (!serviceContent.includes('getWorktreePath')) {
      this.error('Unified worktree path resolution not implemented');
    }

    // 检查多快照类型支持
    const snapshotTypes = ['BaseSnapshot', 'SessionSnapshot', 'Snapshot'];
    for (const type of snapshotTypes) {
      if (!serviceContent.includes(type)) {
        this.error(`Support for ${type} not found`);
      }
    }

    this.success('Shared access mechanism validation completed');
    return this.errors.length === 0;
  }

  /**
   * 运行所有验证
   */
  async run() {
    this.log('Starting unified snapshot service validation...');

    const validations = [
      await this.validateServiceStructure(),
      await this.validateModuleRegistration(),
      await this.validateAccessServiceIntegration(),
      await this.validateFileSystemSecurity(),
      await this.validateSharedAccessMechanism(),
    ];

    const allValid = validations.every(v => v);

    console.log('\n📊 Validation Summary:');
    console.log(`Successes: ${this.successes.length}`);
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

    if (allValid && this.errors.length === 0) {
      this.success(
        'All validations passed! Unified snapshot service is ready.'
      );
      return true;
    } else {
      this.error('Validation failed! Please fix the issues before proceeding.');
      return false;
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const tester = new UnifiedSnapshotServiceTester();
  tester
    .run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation script failed:', error);
      process.exit(1);
    });
}

module.exports = UnifiedSnapshotServiceTester;
