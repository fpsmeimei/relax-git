#!/usr/bin/env node

/**
 * Relax-Git 社交功能测试启动器
 *
 * 使用方法:
 * node test-social-features.js [选项]
 *
 * 选项:
 * --all          运行所有测试 (默认)
 * --core         只运行核心社交功能测试
 * --chat         只运行聊天系统测试
 * --scenarios    只运行真实场景测试
 * --quick        快速测试 (核心功能 + 关键场景)
 */

const ComprehensiveTestRunner = require('./run-all-social-tests');
const SocialFeaturesTestSuite = require('./social-features-test-suite');
const ChatSystemTest = require('./chat-system-test');
const RealWorldScenariosTest = require('./real-world-scenarios-test');

function printUsage() {
  console.log(`
🧪 Relax-Git 社交功能测试工具

使用方法:
  node test-social-features.js [选项]

选项:
  --all          运行所有测试 (默认)
  --core         只运行核心社交功能测试
  --chat         只运行聊天系统测试  
  --scenarios    只运行真实场景测试
  --quick        快速测试 (核心功能 + 关键场景)
  --help         显示此帮助信息

测试覆盖范围:
  ✓ 三种评论区的回复逻辑
  ✓ 通知系统的创建和跳转
  ✓ 聊天室和好友系统
  ✓ 数据一致性和权限控制
  ✓ 真实用户使用场景
  ✓ 边界情况和异常处理
`);
}

async function runTests() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  const testType =
    args.find(arg =>
      ['--all', '--core', '--chat', '--scenarios', '--quick'].includes(arg)
    ) || '--all';

  console.log('🚀 启动 Relax-Git 社交功能测试');
  console.log('='.repeat(60));
  console.log('测试类型:', testType);
  console.log('开始时间:', new Date().toLocaleString('zh-CN'));
  console.log('='.repeat(60));

  try {
    switch (testType) {
      case '--core':
        console.log('🔧 运行核心社交功能测试...\n');
        const coreTest = new SocialFeaturesTestSuite();
        await coreTest.runAllTests();
        await coreTest.cleanup();
        break;

      case '--chat':
        console.log('💬 运行聊天系统测试...\n');
        const chatTest = new ChatSystemTest();
        await chatTest.runAllTests();
        await chatTest.cleanup();
        break;

      case '--scenarios':
        console.log('🎭 运行真实场景测试...\n');
        const scenarioTest = new RealWorldScenariosTest();
        await scenarioTest.runAllScenarios();
        await scenarioTest.cleanup();
        break;

      case '--quick':
        console.log('⚡ 运行快速测试...\n');

        console.log('第一部分: 核心功能测试');
        console.log('-'.repeat(30));
        const quickCoreTest = new SocialFeaturesTestSuite();
        await quickCoreTest.runAllTests();
        await quickCoreTest.cleanup();

        console.log('\n第二部分: 关键场景测试');
        console.log('-'.repeat(30));
        const quickScenarioTest = new RealWorldScenariosTest();
        // 只运行前3个关键场景
        await quickScenarioTest.testNewUserJoinsProject();
        await quickScenarioTest.testCodeReviewWithLineComments();
        await quickScenarioTest.testCommunityInteraction();
        await quickScenarioTest.cleanup();

        console.log('\n⚡ 快速测试完成！如需完整测试请使用 --all 选项');
        break;

      case '--all':
      default:
        console.log('🌟 运行完整测试套件...\n');
        const runner = new ComprehensiveTestRunner();
        await runner.runComprehensiveTests();
        await runner.saveResultsToFile();
        break;
    }

    console.log('\n✅ 测试执行完成!');
  } catch (error) {
    console.error('\n❌ 测试执行失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
  process.exit(1);
});

process.on('uncaughtException', error => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

// 运行测试
runTests().catch(error => {
  console.error('启动测试失败:', error);
  process.exit(1);
});
