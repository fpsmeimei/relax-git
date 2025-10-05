/**
 * Relax-Git 社交功能全面测试运行器
 * 运行所有社交功能测试并生成综合报告
 */

const SocialFeaturesTestSuite = require('./social-features-test-suite');
const ChatSystemTest = require('./chat-system-test');
const RealWorldScenariosTest = require('./real-world-scenarios-test');

class ComprehensiveTestRunner {
  constructor() {
    this.allResults = {
      socialFeatures: null,
      chatSystem: null,
      realWorldScenarios: null,
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        successRate: 0,
        duration: 0,
        criticalIssues: [],
        recommendations: [],
      },
    };
  }

  async runComprehensiveTests() {
    console.log('🚀 Relax-Git 社交功能全面测试套件');
    console.log('='.repeat(80));
    console.log('测试开始时间:', new Date().toLocaleString('zh-CN'));
    console.log('测试范围: 评论系统 + 通知系统 + 聊天系统 + 真实场景');
    console.log('='.repeat(80));

    const overallStartTime = Date.now();

    try {
      // 1. 运行社交功能核心测试
      console.log('\n🔧 第一阶段: 社交功能核心测试');
      console.log('-'.repeat(50));
      const socialTest = new SocialFeaturesTestSuite();
      await socialTest.runAllTests();
      this.allResults.socialFeatures = socialTest.testResults;
      await socialTest.cleanup();

      // 2. 运行聊天系统专项测试
      console.log('\n💬 第二阶段: 聊天系统专项测试');
      console.log('-'.repeat(50));
      const chatTest = new ChatSystemTest();
      await chatTest.runAllTests();
      this.allResults.chatSystem = 'completed'; // ChatSystemTest 没有返回结构化结果
      await chatTest.cleanup();

      // 3. 运行真实场景测试
      console.log('\n🎭 第三阶段: 真实场景测试');
      console.log('-'.repeat(50));
      const scenarioTest = new RealWorldScenariosTest();
      await scenarioTest.runAllScenarios();
      this.allResults.realWorldScenarios = scenarioTest.scenarios;
      await scenarioTest.cleanup();

      const overallEndTime = Date.now();
      this.allResults.summary.duration = (
        (overallEndTime - overallStartTime) /
        1000
      ).toFixed(2);

      // 4. 生成综合报告
      this.generateComprehensiveReport();
    } catch (error) {
      console.error('❌ 测试运行过程中出现严重错误:', error);
      this.allResults.summary.criticalIssues.push(
        `测试运行失败: ${error.message}`
      );
    }
  }

  generateComprehensiveReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELAX-GIT 社交功能综合测试报告');
    console.log('='.repeat(80));

    // 统计社交功能测试结果
    if (this.allResults.socialFeatures) {
      const socialTests = this.allResults.socialFeatures;
      const socialPassed = socialTests.filter(t => t.passed).length;
      const socialTotal = socialTests.length;

      console.log(`\n🔧 社交功能核心测试:`);
      console.log(`   测试数量: ${socialTotal}`);
      console.log(`   通过: ${socialPassed} ✅`);
      console.log(`   失败: ${socialTotal - socialPassed} ❌`);
      console.log(
        `   成功率: ${((socialPassed / socialTotal) * 100).toFixed(1)}%`
      );

      this.allResults.summary.totalTests += socialTotal;
      this.allResults.summary.passedTests += socialPassed;
      this.allResults.summary.failedTests += socialTotal - socialPassed;

      // 收集关键问题
      socialTests
        .filter(t => !t.passed)
        .forEach(t => {
          this.allResults.summary.criticalIssues.push(
            `社交功能: ${t.test} - ${t.details}`
          );
        });
    }

    // 统计真实场景测试结果
    if (this.allResults.realWorldScenarios) {
      const scenarios = this.allResults.realWorldScenarios;
      const scenarioPassed = scenarios.filter(s => s.passed).length;
      const scenarioTotal = scenarios.length;

      console.log(`\n🎭 真实场景测试:`);
      console.log(`   场景数量: ${scenarioTotal}`);
      console.log(`   通过: ${scenarioPassed} ✅`);
      console.log(`   失败: ${scenarioTotal - scenarioPassed} ❌`);
      console.log(
        `   成功率: ${((scenarioPassed / scenarioTotal) * 100).toFixed(1)}%`
      );

      this.allResults.summary.totalTests += scenarioTotal;
      this.allResults.summary.passedTests += scenarioPassed;
      this.allResults.summary.failedTests += scenarioTotal - scenarioPassed;

      // 收集场景问题
      scenarios
        .filter(s => !s.passed)
        .forEach(s => {
          s.issues.forEach(issue => {
            this.allResults.summary.criticalIssues.push(
              `场景测试: ${s.name} - ${issue}`
            );
          });
        });
    }

    // 计算总体成功率
    if (this.allResults.summary.totalTests > 0) {
      this.allResults.summary.successRate = (
        (this.allResults.summary.passedTests /
          this.allResults.summary.totalTests) *
        100
      ).toFixed(1);
    }

    // 显示总体统计
    console.log(`\n📈 总体统计:`);
    console.log(`   总测试数: ${this.allResults.summary.totalTests}`);
    console.log(`   总通过: ${this.allResults.summary.passedTests} ✅`);
    console.log(`   总失败: ${this.allResults.summary.failedTests} ❌`);
    console.log(`   总成功率: ${this.allResults.summary.successRate}%`);
    console.log(`   总耗时: ${this.allResults.summary.duration}秒`);

    // 显示关键问题
    if (this.allResults.summary.criticalIssues.length > 0) {
      console.log(
        `\n❌ 关键问题 (${this.allResults.summary.criticalIssues.length} 个):`
      );
      this.allResults.summary.criticalIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }

    // 生成建议
    this.generateRecommendations();

    // 显示建议
    console.log(`\n💡 改进建议:`);
    this.allResults.summary.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

    // 总体评估
    console.log(`\n🎯 总体评估:`);
    const successRate = parseFloat(this.allResults.summary.successRate);

    if (successRate >= 95) {
      console.log('   🌟 优秀! Relax-Git 的社交功能非常稳定可靠。');
    } else if (successRate >= 85) {
      console.log('   ✅ 良好! 社交功能基本正常，有少量问题需要修复。');
    } else if (successRate >= 70) {
      console.log('   ⚠️  一般! 社交功能可用，但存在一些需要关注的问题。');
    } else {
      console.log('   ❌ 需要改进! 社交功能存在较多问题，建议优先修复。');
    }

    console.log('\n' + '='.repeat(80));
    console.log('测试完成时间:', new Date().toLocaleString('zh-CN'));
    console.log('='.repeat(80));
  }

  generateRecommendations() {
    const issues = this.allResults.summary.criticalIssues;
    const successRate = parseFloat(this.allResults.summary.successRate);

    // 基于成功率的通用建议
    if (successRate < 70) {
      this.allResults.summary.recommendations.push(
        '立即停止新功能开发，优先修复现有社交功能问题'
      );
    } else if (successRate < 85) {
      this.allResults.summary.recommendations.push(
        '在下个版本中优先修复失败的测试项'
      );
    }

    // 基于具体问题的建议
    const commentIssues = issues.filter(
      issue => issue.includes('评论') || issue.includes('回复')
    );
    if (commentIssues.length > 0) {
      this.allResults.summary.recommendations.push(
        '重点检查评论回复逻辑，确保parentId正确设置'
      );
    }

    const notificationIssues = issues.filter(issue => issue.includes('通知'));
    if (notificationIssues.length > 0) {
      this.allResults.summary.recommendations.push(
        '优化通知系统，确保通知及时创建和正确跳转'
      );
    }

    const dataIssues = issues.filter(
      issue =>
        issue.includes('孤儿') ||
        issue.includes('重复') ||
        issue.includes('不一致')
    );
    if (dataIssues.length > 0) {
      this.allResults.summary.recommendations.push(
        '建立数据一致性检查机制，定期清理孤儿数据'
      );
    }

    const permissionIssues = issues.filter(
      issue => issue.includes('权限') || issue.includes('私有')
    );
    if (permissionIssues.length > 0) {
      this.allResults.summary.recommendations.push(
        '加强权限控制验证，防止未授权访问'
      );
    }

    // 通用建议
    this.allResults.summary.recommendations.push(
      '建立自动化测试流程，在每次部署前运行社交功能测试'
    );
    this.allResults.summary.recommendations.push(
      '监控生产环境中的社交功能使用情况和错误率'
    );

    if (this.allResults.summary.recommendations.length === 2) {
      // 如果只有通用建议，说明测试通过率很高
      this.allResults.summary.recommendations.unshift(
        '继续保持当前的代码质量和测试覆盖率'
      );
    }
  }

  // 保存测试结果到文件
  async saveResultsToFile() {
    const fs = require('fs').promises;
    const path = require('path');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `social-test-results-${timestamp}.json`;
    const filepath = path.join(__dirname, filename);

    try {
      await fs.writeFile(filepath, JSON.stringify(this.allResults, null, 2));
      console.log(`\n💾 测试结果已保存到: ${filepath}`);
    } catch (error) {
      console.error('保存测试结果失败:', error.message);
    }
  }
}

async function main() {
  const runner = new ComprehensiveTestRunner();

  try {
    await runner.runComprehensiveTests();
    await runner.saveResultsToFile();
  } catch (error) {
    console.error('综合测试运行失败:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ComprehensiveTestRunner;
