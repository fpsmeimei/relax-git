#!/usr/bin/env node

/**
 * 修复数据库中的 Windows 路径问题
 * 将所有基础快照的 Windows 路径转换为 Linux 路径
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixWindowsPaths() {
  console.log('🔧 开始修复数据库中的 Windows 路径...');

  try {
    // 1. 查找所有包含 Windows 路径的基础快照
    const snapshots = await prisma.baseSnapshot.findMany({
      where: {
        OR: [
          { worktreePath: { contains: 'C:\\' } },
          { bundlePath: { contains: 'C:\\' } },
        ],
      },
      select: {
        id: true,
        worktreePath: true,
        bundlePath: true,
        status: true,
      },
    });

    console.log(`📊 找到 ${snapshots.length} 个包含 Windows 路径的基础快照`);

    if (snapshots.length === 0) {
      console.log('✅ 没有需要修复的路径');
      return;
    }

    // 2. 批量修复路径
    let fixedCount = 0;
    for (const snapshot of snapshots) {
      const updateData = {};
      let needsUpdate = false;

      // 修复工作树路径
      if (snapshot.worktreePath && snapshot.worktreePath.includes('C:\\')) {
        // C:\temp\relax-git-repos\worktree-xxx -> /tmp/relax-git-worktrees/worktree-xxx
        const newWorktreePath = snapshot.worktreePath
          .replace(/^C:\\temp\\relax-git-repos/, '/tmp/relax-git-worktrees')
          .replace(/\\/g, '/');

        updateData.worktreePath = newWorktreePath;
        needsUpdate = true;
        console.log(
          `📁 ${snapshot.id}: ${snapshot.worktreePath} -> ${newWorktreePath}`
        );
      }

      // 修复 bundle 路径
      if (snapshot.bundlePath && snapshot.bundlePath.includes('C:\\')) {
        // C:\temp\relax-git-bundles\xxx.bundle -> /tmp/relax-git-bundles/xxx.bundle
        const newBundlePath = snapshot.bundlePath
          .replace(/^C:\\temp\\relax-git-bundles/, '/tmp/relax-git-bundles')
          .replace(/\\/g, '/');

        updateData.bundlePath = newBundlePath;
        needsUpdate = true;
        console.log(
          `📦 ${snapshot.id}: ${snapshot.bundlePath} -> ${newBundlePath}`
        );
      }

      // 执行更新
      if (needsUpdate) {
        await prisma.baseSnapshot.update({
          where: { id: snapshot.id },
          data: updateData,
        });
        fixedCount++;
      }
    }

    console.log(`✅ 成功修复 ${fixedCount} 个基础快照的路径`);

    // 3. 清理失败的会话快照，让它们重新创建
    const failedSessions = await prisma.sessionSnapshot.deleteMany({
      where: {
        status: 'FAILED',
      },
    });

    console.log(`🧹 清理了 ${failedSessions.count} 个失败的会话快照`);

    // 4. 验证修复结果
    const remainingBadPaths = await prisma.baseSnapshot.count({
      where: {
        OR: [
          { worktreePath: { contains: 'C:\\' } },
          { bundlePath: { contains: 'C:\\' } },
        ],
      },
    });

    if (remainingBadPaths === 0) {
      console.log('🎉 所有 Windows 路径已成功修复！');
    } else {
      console.warn(`⚠️  仍有 ${remainingBadPaths} 个快照包含 Windows 路径`);
    }
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  fixWindowsPaths()
    .then(() => {
      console.log('🏁 Windows 路径修复完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 路径修复失败:', error);
      process.exit(1);
    });
}

module.exports = { fixWindowsPaths };
