/**
 * 修复错误的回复父级关系
 *
 * 问题：一些回复的parentId指向了错误的评论，导致显示为"自己回复自己"
 * 解决：根据时间顺序和内容分析，修复这些错误的关系
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('开始修复错误的回复父级关系...\n');

    // 查找所有"自己回复自己"的错误数据
    const wrongReplies = await prisma.comment.findMany({
      where: {
        parentId: { not: null },
      },
      include: {
        author: {
          select: { id: true, username: true },
        },
        parent: {
          include: {
            author: {
              select: { id: true, username: true },
            },
          },
        },
      },
    });

    const selfReplies = wrongReplies.filter(
      reply => reply.parent && reply.authorId === reply.parent.authorId
    );

    console.log(`找到 ${selfReplies.length} 条"自己回复自己"的错误数据:`);

    for (const reply of selfReplies) {
      console.log(
        `  - ${reply.author.username}: ${reply.content.substring(0, 30)}... (${reply.createdAt})`
      );
    }

    if (selfReplies.length === 0) {
      console.log('没有发现错误数据');
      return;
    }

    console.log('\n开始分析和修复...\n');

    // 查找可能的正确父评论（002用户的评论）
    const user002Comments = await prisma.comment.findMany({
      where: {
        authorId: 'cmgcr58ue0016imi9yaj6x5gt', // 002的ID
        parentId: null, // 主评论
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log('002用户的主评论:');
    for (const comment of user002Comments) {
      console.log(
        `  - ${comment.id}: ${comment.content} (${comment.createdAt})`
      );
    }

    // 手动修复策略：
    // 1. 根据时间顺序，找到最可能被回复的002的评论
    // 2. 将001的错误回复重新指向正确的父评论

    console.log('\n请手动确认修复策略...');
    console.log('由于这涉及到用户意图的判断，建议：');
    console.log('1. 将最近的001回复指向最近的002评论');
    console.log('2. 或者删除这些错误的回复，让用户重新回复');

    // 为了安全起见，我们先不自动修复，而是提供修复建议
    console.log('\n建议的修复操作:');

    // 找到最近的002评论作为可能的目标
    const latestUser002Comment = user002Comments[user002Comments.length - 1];

    if (latestUser002Comment) {
      console.log(
        `建议将以下回复的parentId从 ${selfReplies[0].parentId} 改为 ${latestUser002Comment.id}:`
      );
      for (const reply of selfReplies) {
        console.log(
          `  - 回复ID: ${reply.id} (${reply.content.substring(0, 30)}...)`
        );
      }

      // 询问是否执行修复
      console.log('\n如果要执行修复，请取消注释下面的代码并重新运行:');
      console.log('/*');
      console.log('for (const reply of selfReplies) {');
      console.log('  await prisma.comment.update({');
      console.log('    where: { id: reply.id },');
      console.log(`    data: { parentId: "${latestUser002Comment.id}" }`);
      console.log('  });');
      console.log('  console.log(`修复回复 ${reply.id}`);');
      console.log('}');
      console.log('*/');
    }
  } catch (error) {
    console.error('修复过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
