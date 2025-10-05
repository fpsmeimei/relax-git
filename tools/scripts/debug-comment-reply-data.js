/**
 * 深度调试评论回复数据
 * 分析为什么前端显示错误的回复关系
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('=== 深度调试评论回复数据 ===\n');

    // 1. 查找所有回复评论及其完整关系
    const replyComments = await prisma.comment.findMany({
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
        snapshot: {
          select: { id: true, repoId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`找到 ${replyComments.length} 条回复评论:\n`);

    for (const reply of replyComments) {
      console.log(`回复ID: ${reply.id}`);
      console.log(`  回复者: ${reply.author.username} (ID: ${reply.authorId})`);
      console.log(`  父评论ID: ${reply.parentId}`);

      if (reply.parent) {
        console.log(
          `  被回复者: ${reply.parent.author.username} (ID: ${reply.parent.authorId})`
        );
        console.log(`  快照ID: ${reply.snapshotId}`);
        console.log(`  父评论快照ID: ${reply.parent.snapshotId}`);
        console.log(
          `  快照ID是否一致: ${reply.snapshotId === reply.parent.snapshotId}`
        );

        // 检查是否是真正的回复还是错误数据
        if (reply.authorId === reply.parent.authorId) {
          console.log(`  ⚠️  警告: 这是自己回复自己！`);
        } else {
          console.log(
            `  ✅ 正常回复: ${reply.author.username} -> ${reply.parent.author.username}`
          );
        }
      } else {
        console.log(`  ❌ 错误: 父评论不存在！`);
      }

      console.log(`  内容: ${reply.content.substring(0, 50)}...`);
      console.log(`  创建时间: ${reply.createdAt}`);
      console.log('');
    }

    // 2. 检查是否有孤儿回复（parentId指向不存在的评论）
    console.log('=== 检查孤儿回复 ===\n');

    const orphanReplies = await prisma.comment.findMany({
      where: {
        parentId: { not: null },
        parent: null,
      },
      include: {
        author: {
          select: { id: true, username: true },
        },
      },
    });

    if (orphanReplies.length > 0) {
      console.log(`发现 ${orphanReplies.length} 条孤儿回复:`);
      for (const orphan of orphanReplies) {
        console.log(
          `  回复ID: ${orphan.id}, 作者: ${orphan.author.username}, 父评论ID: ${orphan.parentId}`
        );
      }
    } else {
      console.log('没有发现孤儿回复');
    }

    // 3. 检查快照数据一致性
    console.log('\n=== 检查快照数据一致性 ===\n');

    const commentsWithDifferentSnapshots = await prisma.comment.findMany({
      where: {
        parentId: { not: null },
      },
      include: {
        parent: {
          select: { snapshotId: true },
        },
      },
    });

    for (const comment of commentsWithDifferentSnapshots) {
      if (comment.parent && comment.snapshotId !== comment.parent.snapshotId) {
        console.log(`快照ID不一致:`);
        console.log(`  回复ID: ${comment.id}`);
        console.log(`  回复快照ID: ${comment.snapshotId}`);
        console.log(`  父评论快照ID: ${comment.parent.snapshotId}`);
      }
    }

    // 4. 检查最近的评论数据（可能是用户看到的那些）
    console.log('\n=== 最近的评论数据 ===\n');

    const recentComments = await prisma.comment.findMany({
      where: {
        authorId: 'cmgcpj9wb000jimi9rncj20xv', // 001用户的ID
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
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`001用户最近的 ${recentComments.length} 条评论:`);
    for (const comment of recentComments) {
      console.log(`  评论ID: ${comment.id}`);
      console.log(`  内容: ${comment.content.substring(0, 30)}...`);
      console.log(`  是否是回复: ${comment.parentId ? '是' : '否'}`);
      if (comment.parent) {
        console.log(`  回复对象: ${comment.parent.author.username}`);
      }
      console.log('');
    }
  } catch (error) {
    console.error('调试过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
