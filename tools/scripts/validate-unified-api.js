#!/usr/bin/env node

/**
 * 统一API控制器验证脚本
 * 验证UnifiedSnapshotsController的API设计和实现
 *
 * 使用方法:
 * node tools/scripts/validate-unified-api.js
 *
 * 最后更新：2025-09-26
 */

const path = require('path');
const fs = require('fs-extra');

class UnifiedApiValidator {
  constructor() {
    this.apiPath = path.join(__dirname, '..', '..', 'apps', 'api');
    this.errors = [];
    this.warnings = [];
    this.successes = [];
  }

  log(message) {
    console.log(`🔍 [API Validator] ${message}`);
  }

  error(message) {
    this.errors.push(message);
    console.error(`❌ [API Validator] ${message}`);
  }

  warning(message) {
    this.warnings.push(message);
    console.warn(`⚠️ [API Validator] ${message}`);
  }

  success(message) {
    this.successes.push(message);
    console.log(`✅ [API Validator] ${message}`);
  }

  /**
   * 验证控制器文件结构
   */
  async validateControllerStructure() {
    this.log('Validating unified API controller structure...');

    const controllerPath = path.join(
      this.apiPath,
      'src',
      'snapshots',
      'controllers',
      'unified-snapshots.controller.ts'
    );

    if (!(await fs.pathExists(controllerPath))) {
      this.error('Unified snapshots controller file not found');
      return false;
    }

    const controllerContent = await fs.readFile(controllerPath, 'utf8');

    // 检查必需的API端点
    const requiredEndpoints = [
      'getSnapshot',
      'getTree',
      'getFile',
      'createSessionSnapshot',
      'getSnapshotStats',
    ];

    for (const endpoint of requiredEndpoints) {
      if (!controllerContent.includes(`async ${endpoint}(`)) {
        this.error(`Required API endpoint '${endpoint}' not found`);
      }
    }

    // 检查控制器装饰器
    const requiredDecorators = [
      "@Controller('snapshots')",
      '@ApiTags',
      '@UseGuards(JwtAuthGuard)',
      '@ApiBearerAuth()',
    ];

    for (const decorator of requiredDecorators) {
      if (!controllerContent.includes(decorator)) {
        this.error(`Required decorator '${decorator}' not found`);
      }
    }

    this.success('Controller structure validation completed');
    return this.errors.length === 0;
  }

  /**
   * 验证向后兼容性支持
   */
  async validateBackwardCompatibility() {
    this.log('Validating backward compatibility...');

    const controllerPath = path.join(
      this.apiPath,
      'src',
      'snapshots',
      'controllers',
      'unified-snapshots.controller.ts'
    );

    const controllerContent = await fs.readFile(controllerPath, 'utf8');

    // 检查废弃控制器
    if (!controllerContent.includes('DeprecatedSessionSnapshotsController')) {
      this.error('Deprecated session snapshots controller not found');
    }

    // 检查废弃端点
    const deprecatedEndpoints = [
      'getSessionSnapshot',
      'getSessionSnapshotTree',
      'getSessionSnapshotFile',
    ];

    for (const endpoint of deprecatedEndpoints) {
      if (!controllerContent.includes(`async ${endpoint}(`)) {
        this.error(
          `Deprecated endpoint '${endpoint}' not found for backward compatibility`
        );
      }
    }

    // 检查废弃标记
    if (
      !controllerContent.includes('@deprecated') &&
      !controllerContent.includes('deprecated: true')
    ) {
      this.warning('Deprecated endpoints may not be properly marked');
    }

    this.success('Backward compatibility validation completed');
    return this.errors.length === 0;
  }

  /**
   * 验证OpenAPI文档
   */
  async validateOpenApiDocumentation() {
    this.log('Validating OpenAPI documentation...');

    const controllerPath = path.join(
      this.apiPath,
      'src',
      'snapshots',
      'controllers',
      'unified-snapshots.controller.ts'
    );

    const controllerContent = await fs.readFile(controllerPath, 'utf8');

    // 检查API文档装饰器
    const requiredApiDecorators = [
      '@ApiOperation',
      '@ApiParam',
      '@ApiQuery',
      '@ApiResponse',
    ];

    for (const decorator of requiredApiDecorators) {
      if (!controllerContent.includes(decorator)) {
        this.error(
          `Required API documentation decorator '${decorator}' not found`
        );
      }
    }

    // 检查响应状态码文档
    const requiredStatusCodes = [
      'HttpStatus.OK',
      'HttpStatus.CREATED',
      'HttpStatus.NOT_FOUND',
      'HttpStatus.FORBIDDEN',
      'HttpStatus.BAD_REQUEST',
    ];

    for (const statusCode of requiredStatusCodes) {
      if (!controllerContent.includes(statusCode)) {
        this.warning(
          `Status code '${statusCode}' documentation may be missing`
        );
      }
    }

    // 检查响应schema定义
    if (!controllerContent.includes('schema:')) {
      this.warning('Response schema definitions may be incomplete');
    }

    this.success('OpenAPI documentation validation completed');
    return this.errors.length === 0;
  }

  /**
   * 验证权限守卫集成
   */
  async validateGuardIntegration() {
    this.log('Validating guard integration...');

    const controllerPath = path.join(
      this.apiPath,
      'src',
      'snapshots',
      'controllers',
      'unified-snapshots.controller.ts'
    );

    const controllerContent = await fs.readFile(controllerPath, 'utf8');

    // 检查权限守卫使用
    const requiredGuards = ['JwtAuthGuard', 'RepoAccessGuard'];

    for (const guard of requiredGuards) {
      if (!controllerContent.includes(guard)) {
        this.error(`Required guard '${guard}' not found`);
      }
    }

    // 检查权限装饰器
    if (!controllerContent.includes("@RepoAccess('read')")) {
      this.error('Read permission decorator not found');
    }

    // 检查用户注入
    if (!controllerContent.includes('@CurrentUser')) {
      this.error('Current user injection not found');
    }

    this.success('Guard integration validation completed');
    return this.errors.length === 0;
  }

  /**
   * 验证模块注册
   */
  async validateModuleRegistration() {
    this.log('Validating module registration...');

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

    // 检查控制器导入
    if (!moduleContent.includes('UnifiedSnapshotsController')) {
      this.error('UnifiedSnapshotsController import not found in module');
    }

    if (!moduleContent.includes('DeprecatedSessionSnapshotsController')) {
      this.error(
        'DeprecatedSessionSnapshotsController import not found in module'
      );
    }

    // 检查控制器注册
    const controllerRegistrations = [
      'UnifiedSnapshotsController,',
      'DeprecatedSessionSnapshotsController,',
    ];

    for (const registration of controllerRegistrations) {
      if (!moduleContent.includes(registration)) {
        this.error(`Controller registration '${registration}' not found`);
      }
    }

    this.success('Module registration validation completed');
    return this.errors.length === 0;
  }

  /**
   * 运行所有验证
   */
  async run() {
    this.log('Starting unified API controller validation...');

    const validations = [
      await this.validateControllerStructure(),
      await this.validateBackwardCompatibility(),
      await this.validateOpenApiDocumentation(),
      await this.validateGuardIntegration(),
      await this.validateModuleRegistration(),
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
      this.success('All validations passed! Unified API controller is ready.');
      return true;
    } else {
      this.error('Validation failed! Please fix the issues before proceeding.');
      return false;
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const validator = new UnifiedApiValidator();
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

module.exports = UnifiedApiValidator;
