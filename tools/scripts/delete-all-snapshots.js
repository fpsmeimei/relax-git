/**
 * 删除所有基础快照脚本
 * 用于清理问题快照，让系统重新生成
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function deleteAllSnapshots() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 开始删除所有快照...');

    // 1. 查询所有基础快照
    const baseSnapshots = await prisma.baseSnapshot.findMany({
      select: {
        id: true,
        repoId: true,
        branch: {
          select: {
            name: true,
          },
        },
        repository: {
          select: {
            name: true,
          },
        },
        status: true,
        createdAt: true,
      },
    });

    console.log(`📊 找到 ${baseSnapshots.length} 个基础快照:`);
    baseSnapshots.forEach(snapshot => {
      console.log(
        `  - ${snapshot.repository.name}/${snapshot.branch.name} (${snapshot.status}) - ${snapshot.id}`
      );
    });

    if (baseSnapshots.length === 0) {
      console.log('✅ 没有找到需要删除的快照');
      return;
    }

    // 2. 删除所有基础快照（级联删除会自动处理关联数据）
    console.log('\n🗑️ 开始删除基础快照...');
    const deleteResult = await prisma.baseSnapshot.deleteMany({});

    console.log(`✅ 成功删除 ${deleteResult.count} 个基础快照`);
    console.log('📝 级联删除的数据包括:');
    console.log('  - 会话快照 (session_snapshots)');
    console.log('  - 评论数据 (comments)');
    console.log('  - 时间线事件 (timeline_events)');
    console.log('  - 搜索历史 (search_history)');

    console.log('\n🎯 删除完成！');
    console.log('💡 现在用户访问代码时，系统会自动重新生成快照');
  } catch (error) {
    console.error('❌ 删除快照失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 执行删除
deleteAllSnapshots()
  .then(() => {
    console.log('\n🚀 脚本执行完成');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 脚本执行失败:', error);
    process.exit(1);
  });
