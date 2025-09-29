#!/usr/bin/env node

/**
 * 前端快照类型检测逻辑简化验证脚本
 * 验证前端代码是否已正确简化为统一的API端点
 *
 * 使用方法:
 * node tools/scripts/validate-frontend-simplification.js
 *
 * 最后更新：2025-09-26
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

class FrontendSimplificationValidator {
  constructor() {
    this.webPath = path.join(__dirname, '..', '..', 'apps', 'web');
    this.issues = [];
    this.warnings = [];
    this.successes = [];
  }

  log(message) {
    console.log(`🔍 [Validator] ${message}`);
  }

  error(message) {
    console.error(`❌ [Validator] ${message}`);
    this.issues.push(message);
  }

  warning(message) {
    console.warn(`⚠️ [Validator] ${message}`);
    this.warnings.push(message);
  }

  success(message) {
    console.log(`✅ [Validator] ${message}`);
    this.successes.push(message);
  }

  /**
   * 扫描前端文件中的API端点使用
   */
  async scanApiEndpoints() {
    this.log('Scanning frontend API endpoint usage...');

    const tsFiles = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
      cwd: this.webPath,
    });
    const apiUsage = {
      unifiedEndpoints: [],
      deprecatedEndpoints: [],
      complexLogic: [],
    };

    for (const file of tsFiles) {
      const filePath = path.join(this.webPath, file);
      const content = await fs.readFile(filePath, 'utf8');

      // 检查统一端点使用
      if (content.includes('/snapshots/')) {
        const matches = content.match(/\/snapshots\/[^\/\s"'`]+/g) || [];
        matches.forEach(match => {
          apiUsage.unifiedEndpoints.push({
            file: file,
            endpoint: match,
            line: this.getLineNumber(content, match),
          });
        });
      }

      // 检查废弃端点使用
      if (content.includes('/session-snapshots/')) {
        const matches =
          content.match(/\/session-snapshots\/[^\/\s"'`]+/g) || [];
        matches.forEach(match => {
          apiUsage.deprecatedEndpoints.push({
            file: file,
            endpoint: match,
            line: this.getLineNumber(content, match),
          });
        });
      }

      // 检查复杂的快照类型检测逻辑
      if (
        content.includes('snapshotId.startsWith') ||
        content.includes('isSessionSnapshot') ||
        content.includes('window.location.pathname.includes')
      ) {
        apiUsage.complexLogic.push({
          file: file,
          type: 'complex_detection_logic',
        });
      }
    }

    return apiUsage;
  }

  /**
   * 获取匹配文本在文件中的行号
   */
  getLineNumber(content, searchText) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchText)) {
        return i + 1;
      }
    }
    return -1;
  }

  /**
   * 验证关键组件的简化情况
   */
  async validateKeyComponents() {
    this.log('Validating key component simplifications...');

    const keyFiles = [
      'src/components/snapshot/snapshot-code-viewer.tsx',
      'src/app/repositories/[id]/page.tsx',
    ];

    const validationResults = [];

    for (const file of keyFiles) {
      const filePath = path.join(this.webPath, file);

      if (!(await fs.pathExists(filePath))) {
        this.warning(`Key file not found: ${file}`);
        continue;
      }

      const content = await fs.readFile(filePath, 'utf8');
      const result = {
        file: file,
        hasUnifiedEndpoints: content.includes('/snapshots/'),
        hasDeprecatedEndpoints: content.includes('/session-snapshots/'),
        hasComplexLogic:
          content.includes('snapshotId.startsWith') ||
          content.includes('isSessionSnapshot'),
        hasSimplifiedGetApiPath: content.includes(
          '统一架构：所有快照都使用 /snapshots/* 端点'
        ),
      };

      validationResults.push(result);

      // 验证结果
      if (
        result.hasUnifiedEndpoints &&
        !result.hasDeprecatedEndpoints &&
        !result.hasComplexLogic
      ) {
        this.success(`${file}: Properly simplified`);
      } else {
        if (result.hasDeprecatedEndpoints) {
          this.error(
            `${file}: Still uses deprecated /session-snapshots/ endpoints`
          );
        }
        if (result.hasComplexLogic) {
          this.error(
            `${file}: Still contains complex snapshot type detection logic`
          );
        }
        if (!result.hasUnifiedEndpoints) {
          this.warning(`${file}: No unified /snapshots/ endpoints found`);
        }
      }
    }

    return validationResults;
  }

  /**
   * 检查错误处理简化
   */
  async validateErrorHandling() {
    this.log('Validating error handling simplification...');

    const apiClientPath = path.join(this.webPath, 'src/services/apiClient.ts');

    if (!(await fs.pathExists(apiClientPath))) {
      this.warning('API client file not found');
      return false;
    }

    const content = await fs.readFile(apiClientPath, 'utf8');

    // 检查是否有特定快照类型的错误处理
    const hasSpecificErrorHandling =
      content.includes('session-snapshots') ||
      content.includes('SessionSnapshot') ||
      content.includes('isSessionSnapshot');

    if (hasSpecificErrorHandling) {
      this.warning(
        'API client still contains snapshot-type-specific error handling'
      );
      return false;
    } else {
      this.success('API client error handling is properly unified');
      return true;
    }
  }

  /**
   * 生成简化报告
   */
  generateSimplificationReport(
    apiUsage,
    componentValidation,
    errorHandlingValid
  ) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        unifiedEndpoints: apiUsage.unifiedEndpoints.length,
        deprecatedEndpoints: apiUsage.deprecatedEndpoints.length,
        complexLogicInstances: apiUsage.complexLogic.length,
        keyComponentsSimplified: componentValidation.filter(
          c =>
            c.hasUnifiedEndpoints &&
            !c.hasDeprecatedEndpoints &&
            !c.hasComplexLogic
        ).length,
        totalKeyComponents: componentValidation.length,
        errorHandlingSimplified: errorHandlingValid,
        issues: this.issues.length,
        warnings: this.warnings.length,
        successes: this.successes.length,
      },
      details: {
        apiUsage: apiUsage,
        componentValidation: componentValidation,
        issues: this.issues,
        warnings: this.warnings,
        successes: this.successes,
      },
      recommendations: this.generateRecommendations(
        apiUsage,
        componentValidation
      ),
    };

    return report;
  }

  /**
   * 生成改进建议
   */
  generateRecommendations(apiUsage, componentValidation) {
    const recommendations = [];

    if (apiUsage.deprecatedEndpoints.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Update deprecated API endpoints',
        description: `Found ${apiUsage.deprecatedEndpoints.length} usages of deprecated /session-snapshots/ endpoints`,
        files: apiUsage.deprecatedEndpoints.map(e => e.file),
      });
    }

    if (apiUsage.complexLogic.length > 0) {
      recommendations.push({
        priority: 'medium',
        action: 'Remove complex snapshot type detection logic',
        description: `Found ${apiUsage.complexLogic.length} instances of complex snapshot type detection`,
        files: apiUsage.complexLogic.map(e => e.file),
      });
    }

    const unSimplifiedComponents = componentValidation.filter(
      c => c.hasDeprecatedEndpoints || c.hasComplexLogic
    );

    if (unSimplifiedComponents.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Simplify key components',
        description:
          'Some key components still contain complex logic or deprecated endpoints',
        files: unSimplifiedComponents.map(c => c.file),
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'low',
        action: 'Maintain current state',
        description:
          'Frontend simplification is complete and working correctly',
      });
    }

    return recommendations;
  }

  /**
   * 执行完整的验证
   */
  async validate() {
    this.log('🔍 Starting frontend simplification validation...');

    try {
      // 1. 扫描API端点使用
      const apiUsage = await this.scanApiEndpoints();

      // 2. 验证关键组件
      const componentValidation = await this.validateKeyComponents();

      // 3. 验证错误处理
      const errorHandlingValid = await this.validateErrorHandling();

      // 4. 生成报告
      const report = this.generateSimplificationReport(
        apiUsage,
        componentValidation,
        errorHandlingValid
      );

      // 5. 保存报告
      const reportPath = path.join(
        __dirname,
        '..',
        '..',
        'backups',
        `frontend-simplification-report-${Date.now()}.json`
      );
      await fs.ensureDir(path.dirname(reportPath));
      await fs.writeJSON(reportPath, report, { spaces: 2 });
      this.success(`Validation report saved to: ${reportPath}`);

      // 6. 显示摘要
      this.displayValidationSummary(report);

      if (this.issues.length === 0) {
        this.success(
          '🎉 Frontend simplification validation completed successfully!'
        );
        return true;
      } else {
        this.error(`Found ${this.issues.length} issues that need attention`);
        return false;
      }
    } catch (error) {
      this.error(`Validation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 显示验证摘要
   */
  displayValidationSummary(report) {
    console.log('\n📊 Frontend Simplification Summary:');
    console.log(`Unified endpoints: ${report.summary.unifiedEndpoints}`);
    console.log(`Deprecated endpoints: ${report.summary.deprecatedEndpoints}`);
    console.log(
      `Complex logic instances: ${report.summary.complexLogicInstances}`
    );
    console.log(
      `Key components simplified: ${report.summary.keyComponentsSimplified}/${report.summary.totalKeyComponents}`
    );
    console.log(
      `Error handling simplified: ${report.summary.errorHandlingSimplified ? 'Yes' : 'No'}`
    );
    console.log(`Issues: ${report.summary.issues}`);
    console.log(`Warnings: ${report.summary.warnings}`);

    if (report.recommendations.length > 0) {
      console.log('\n🎯 Recommendations:');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.action} (${rec.priority})`);
        console.log(`   ${rec.description}`);
        if (rec.files && rec.files.length > 0) {
          console.log(`   Files: ${rec.files.join(', ')}`);
        }
      });
    }
  }
}

// 主函数
async function main() {
  console.log('🔍 Relax-Git Frontend Simplification Validator');
  console.log(
    'This will validate that frontend snapshot logic has been properly simplified.'
  );
  console.log('');

  const validator = new FrontendSimplificationValidator();

  try {
    const success = await validator.validate();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Validation script failed:', error.message);
    process.exit(1);
  }
}

main();
