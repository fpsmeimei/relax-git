/**
 * 快照流程验证脚本
 * 用于检查从API到Worker的完整流程是否正常
 */

const Redis = require('redis');
const { Client } = require('pg');

async function verifySnapshotFlow() {
  console.log('🔍 开始验证快照流程...\n');

  // 1. 检查Redis队列
  console.log('1️⃣ 检查Redis队列状态...');
  const redisClient = Redis.createClient({
    url: 'redis://localhost:6379',
  });

  try {
    await redisClient.connect();

    // 检查队列长度
    const queueLength = await redisClient.lLen('snapshot:queue');
    console.log(`   ✅ 队列 snapshot:queue 当前长度: ${queueLength}`);

    // 检查是否有积压任务
    if (queueLength > 10) {
      console.log(`   ⚠️  警告: 队列积压较多，可能Worker未正常工作`);
    }

    await redisClient.quit();
  } catch (error) {
    console.error(`   ❌ Redis连接失败: ${error.message}`);
    return false;
  }

  // 2. 检查数据库表
  console.log('\n2️⃣ 检查数据库表状态...');
  const pgClient = new Client({
    host: 'localhost',
    port: 5432,
    database: 'relax_git_dev',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await pgClient.connect();

    // 检查base_snapshots表
    const baseSnapshots = await pgClient.query(`
      SELECT status, COUNT(*) as count 
      FROM base_snapshots 
      GROUP BY status
    `);

    console.log('   基础快照状态分布:');
    if (baseSnapshots.rows.length > 0) {
      baseSnapshots.rows.forEach(row => {
        const emoji =
          row.status === 'READY'
            ? '✅'
            : row.status === 'FAILED'
              ? '❌'
              : row.status === 'PROCESSING'
                ? '⏳'
                : '🔄';
        console.log(`     ${emoji} ${row.status}: ${row.count}`);
      });
    } else {
      console.log('     📭 暂无基础快照');
    }

    // 检查snapshots表
    const snapshots = await pgClient.query(`
      SELECT status, COUNT(*) as count 
      FROM snapshots 
      GROUP BY status
    `);

    console.log('\n   用户快照状态分布:');
    if (snapshots.rows.length > 0) {
      snapshots.rows.forEach(row => {
        const emoji =
          row.status === 'READY'
            ? '✅'
            : row.status === 'FAILED'
              ? '❌'
              : row.status === 'PROCESSING'
                ? '⏳'
                : '🔄';
        console.log(`     ${emoji} ${row.status}: ${row.count}`);
      });
    } else {
      console.log('     📭 暂无用户快照');
    }

    // 检查最近的失败任务
    const failedTasks = await pgClient.query(`
      SELECT id, error_message, created_at 
      FROM base_snapshots 
      WHERE status = 'FAILED' 
      ORDER BY created_at DESC 
      LIMIT 3
    `);

    if (failedTasks.rows.length > 0) {
      console.log('\n   ⚠️  最近失败的任务:');
      failedTasks.rows.forEach((row, index) => {
        console.log(`     ${index + 1}. ID: ${row.id.substring(0, 8)}...`);
        console.log(`        错误: ${row.error_message || '无错误信息'}`);
        console.log(`        时间: ${row.created_at.toLocaleString()}`);
      });
    }

    await pgClient.end();
  } catch (error) {
    console.error(`   ❌ 数据库连接失败: ${error.message}`);
    return false;
  }

  // 3. 提供诊断建议
  console.log('\n3️⃣ 诊断建议:');
  console.log('   如果存在问题，请检查:');
  console.log('   • Worker是否正在运行: cd apps/worker && go run main.go');
  console.log('   • API服务是否正常: pnpm dev');
  console.log('   • Redis是否可访问: redis-cli ping');
  console.log('   • 查看Worker日志是否有错误');

  console.log('\n✅ 验证完成！');
  return true;
}

// 运行验证
verifySnapshotFlow().catch(console.error);
