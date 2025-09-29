#!/usr/bin/env node

/**
 * 模块依赖关系检查脚本
 * 检查其他模块对快照服务的依赖，确保配置更改不会破坏系统
 *
 * 使用方法:
 * node tools/scripts/check-module-dependencies.js
 *
 * 最后更新：2025-09-26
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

class ModuleDependencyChecker {
  constructor() {
    this.apiPath = path.join(__dirname, '..', '..', 'apps', 'api');
    this.dependencies = [];
    this.issues = [];
    this.warnings = [];
  }

  log(message) {
    console.log(`🔍 [Checker] ${message}`);
  }

  error(message) {
    console.error(`❌ [Checker] ${message}`);
    this.issues.push(message);
  }

  warning(message) {
    console.warn(`⚠️ [Checker] ${message}`);
    this.warnings.push(message);
  }

  success(message) {
    console.log(`✅ [Checker] ${message}`);
  }

  /**
   * 扫描所有TypeScript文件中的快照服务依赖
   */
  async scanDependencies() {
    this.log('Scanning for snapshot service dependencies...');

    const tsFiles = glob.sync('src/**/*.ts', { cwd: this.apiPath });
    const snapshotServices = [
      'SnapshotsService',
      'SessionSnapshotService',
      'BaseSnapshotService',
      'UnifiedSnapshotService',
      'UnifiedSnapshotAccessService',
    ];

    for (const file of tsFiles) {
      const filePath = path.join(this.apiPath, file);
      const content = await fs.readFile(filePath, 'utf8');

      for (const service of snapshotServices) {
        if (content.includes(service)) {
          this.dependencies.push({
            file: file,
            service: service,
            type: this.detectUsageType(content, service),
          });
        }
      }
    }

    this.log(`Found ${this.dependencies.length} dependencies`);
    return this.dependencies;
  }

  /**
   * 检测服务使用类型
   */
  detectUsageType(content, service) {
    if (content.includes(`import.*${service}`)) return 'import';
    if (content.includes(`constructor.*${service}`)) return 'injection';
    if (content.includes(`@Inject.*${service}`)) return 'manual_injection';
    if (content.includes(`${service}`)) return 'reference';
    return 'unknown';
  }

  /**
   * 分析依赖关系
   */
  analyzeDependencies() {
    this.log('Analyzing dependency relationships...');

    const analysis = {
      byService: {},
      byFile: {},
      byType: {},
      criticalDependencies: [],
      deprecatedUsage: [],
    };

    for (const dep of this.dependencies) {
      // 按服务分组
      if (!analysis.byService[dep.service]) {
        analysis.byService[dep.service] = [];
      }
      analysis.byService[dep.service].push(dep);

      // 按文件分组
      if (!analysis.byFile[dep.file]) {
        analysis.byFile[dep.file] = [];
      }
      analysis.byFile[dep.file].push(dep);

      // 按类型分组
      if (!analysis.byType[dep.type]) {
        analysis.byType[dep.type] = [];
      }
      analysis.byType[dep.type].push(dep);

      // 检查关键依赖
      if (dep.type === 'injection' || dep.type === 'manual_injection') {
        analysis.criticalDependencies.push(dep);
      }

      // 检查废弃服务使用
      if (
        ['SnapshotsService', 'SessionSnapshotService'].includes(dep.service)
      ) {
        analysis.deprecatedUsage.push(dep);
      }
    }

    return analysis;
  }

  /**
   * 检查模块导入关系
   */
  async checkModuleImports() {
    this.log('Checking module import relationships...');

    const moduleFiles = glob.sync('src/**/*.module.ts', { cwd: this.apiPath });
    const snapshotImports = [];

    for (const file of moduleFiles) {
      const filePath = path.join(this.apiPath, file);
      const content = await fs.readFile(filePath, 'utf8');

      if (content.includes('SnapshotsModule')) {
        snapshotImports.push({
          file: file,
          content: content,
        });
      }
    }

    this.log(
      `Found ${snapshotImports.length} modules importing SnapshotsModule`
    );
    return snapshotImports;
  }

  /**
   * 验证配置兼容性
   */
  validateCompatibility(analysis, moduleImports) {
    this.log('Validating configuration compatibility...');

    // 检查废弃服务使用
    if (analysis.deprecatedUsage.length > 0) {
      this.warning(
        `Found ${analysis.deprecatedUsage.length} usages of deprecated services:`
      );
      analysis.deprecatedUsage.forEach(dep => {
        this.warning(`  - ${dep.file}: ${dep.service} (${dep.type})`);
      });
    }

    // 检查关键依赖
    if (analysis.criticalDependencies.length > 0) {
      this.log(
        `Found ${analysis.criticalDependencies.length} critical dependencies:`
      );
      analysis.criticalDependencies.forEach(dep => {
        this.log(`  - ${dep.file}: ${dep.service} (${dep.type})`);
      });
    }

    // 检查模块导入
    moduleImports.forEach(imp => {
      this.log(`Module importing SnapshotsModule: ${imp.file}`);
    });

    // 验证统一服务覆盖
    const hasUnifiedService = analysis.byService['UnifiedSnapshotService'];
    const hasUnifiedAccess = analysis.byService['UnifiedSnapshotAccessService'];

    if (!hasUnifiedService) {
      this.warning(
        'No usage of UnifiedSnapshotService found - may need to update consumers'
      );
    }

    if (!hasUnifiedAccess) {
      this.warning(
        'No usage of UnifiedSnapshotAccessService found - may need to update consumers'
      );
    }
  }

  /**
   * 生成迁移建议
   */
  generateMigrationSuggestions(analysis) {
    this.log('Generating migration suggestions...');

    const suggestions = {
      immediateActions: [],
      futureActions: [],
      riskAssessment: 'low',
    };

    // 废弃服务迁移建议
    if (analysis.deprecatedUsage.length > 0) {
      suggestions.immediateActions.push({
        action: 'Update deprecated service usage',
        description:
          'Replace SnapshotsService and SessionSnapshotService with UnifiedSnapshotService',
        files: analysis.deprecatedUsage.map(dep => dep.file),
        priority: 'medium',
      });
    }

    // 统一服务采用建议
    if (!analysis.byService['UnifiedSnapshotService']) {
      suggestions.futureActions.push({
        action: 'Adopt unified services',
        description: 'Update consumers to use new unified snapshot services',
        priority: 'low',
      });
    }

    // 风险评估
    if (analysis.criticalDependencies.length > 5) {
      suggestions.riskAssessment = 'medium';
    }
    if (analysis.deprecatedUsage.length > 10) {
      suggestions.riskAssessment = 'high';
    }

    return suggestions;
  }

  /**
   * 执行完整的依赖检查
   */
  async check() {
    this.log('🔍 Starting module dependency check...');

    try {
      // 1. 扫描依赖关系
      await this.scanDependencies();

      // 2. 分析依赖关系
      const analysis = this.analyzeDependencies();

      // 3. 检查模块导入
      const moduleImports = await this.checkModuleImports();

      // 4. 验证兼容性
      this.validateCompatibility(analysis, moduleImports);

      // 5. 生成迁移建议
      const suggestions = this.generateMigrationSuggestions(analysis);

      // 6. 生成报告
      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          totalDependencies: this.dependencies.length,
          deprecatedUsage: analysis.deprecatedUsage.length,
          criticalDependencies: analysis.criticalDependencies.length,
          moduleImports: moduleImports.length,
          issues: this.issues.length,
          warnings: this.warnings.length,
        },
        analysis: analysis,
        moduleImports: moduleImports,
        suggestions: suggestions,
        issues: this.issues,
        warnings: this.warnings,
      };

      // 7. 保存报告
      const reportPath = path.join(
        __dirname,
        '..',
        '..',
        'backups',
        `dependency-check-report-${Date.now()}.json`
      );
      await fs.ensureDir(path.dirname(reportPath));
      await fs.writeJSON(reportPath, report, { spaces: 2 });
      this.success(`Dependency check report saved to: ${reportPath}`);

      // 8. 显示摘要
      this.displaySummary(report);

      if (this.issues.length === 0) {
        this.success('🎉 Dependency check completed successfully!');
        return true;
      } else {
        this.error(`Found ${this.issues.length} issues that need attention`);
        return false;
      }
    } catch (error) {
      this.error(`Dependency check failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 显示检查摘要
   */
  displaySummary(report) {
    console.log('\n📊 Dependency Check Summary:');
    console.log(`Total dependencies: ${report.summary.totalDependencies}`);
    console.log(`Deprecated usage: ${report.summary.deprecatedUsage}`);
    console.log(
      `Critical dependencies: ${report.summary.criticalDependencies}`
    );
    console.log(`Module imports: ${report.summary.moduleImports}`);
    console.log(`Issues: ${report.summary.issues}`);
    console.log(`Warnings: ${report.summary.warnings}`);

    console.log(
      `\n🎯 Risk Assessment: ${report.suggestions.riskAssessment.toUpperCase()}`
    );

    if (report.suggestions.immediateActions.length > 0) {
      console.log('\n⚡ Immediate Actions Needed:');
      report.suggestions.immediateActions.forEach((action, index) => {
        console.log(`${index + 1}. ${action.action} (${action.priority})`);
        console.log(`   ${action.description}`);
      });
    }

    if (report.suggestions.futureActions.length > 0) {
      console.log('\n🔮 Future Actions:');
      report.suggestions.futureActions.forEach((action, index) => {
        console.log(`${index + 1}. ${action.action} (${action.priority})`);
        console.log(`   ${action.description}`);
      });
    }
  }
}

// 主函数
async function main() {
  console.log('🔍 Relax-Git Module Dependency Checker');
  console.log(
    'This will check dependencies and compatibility for module configuration changes.'
  );
  console.log('');

  const checker = new ModuleDependencyChecker();

  try {
    const success = await checker.check();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Dependency check script failed:', error.message);
    process.exit(1);
  }
}

main();
