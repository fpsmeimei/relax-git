/**
 * 自动修复错误的回复父级关系
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('自动修复错误的回复父级关系...\n');

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

    if (selfReplies.length === 0) {
      console.log('没有发现需要修复的错误数据');
      return;
    }

    console.log(`找到 ${selfReplies.length} 条需要修复的错误回复`);

    // 将这些回复指向002最近的评论
    const targetParentId = 'cmgdtue3o0005xjycif4b1loz'; // 002的最新评论 "the first comment!"

    let fixedCount = 0;
    for (const reply of selfReplies) {
      await prisma.comment.update({
        where: { id: reply.id },
        data: { parentId: targetParentId },
      });

      console.log(`修复回复 ${reply.id}: ${reply.content.substring(0, 30)}...`);
      fixedCount++;
    }

    // 同时需要创建对应的通知
    console.log('\n创建对应的通知...');

    const user002Id = 'cmgcr58ue0016imi9yaj6x5gt';
    const user001Id = 'cmgciw6ml0000wmczkb7vza90';

    let notificationCount = 0;
    for (const reply of selfReplies) {
      // 检查是否已经有通知
      const existingNotification = await prisma.notification.findFirst({
        where: {
          type: 'COMMENT_REPLY',
          commentId: reply.id,
          userId: user002Id,
          actorId: user001Id,
        },
      });

      if (!existingNotification) {
        const contentSnippet = `001: ${reply.content.substring(0, 80)}${reply.content.length > 80 ? '...' : ''}`;

        await prisma.notification.create({
          data: {
            userId: user002Id,
            actorId: user001Id,
            type: 'COMMENT_REPLY',
            commentId: reply.id,
            parentId: targetParentId,
            snapshotId: reply.snapshotId,
            content: contentSnippet,
            createdAt: reply.createdAt,
          },
        });

        console.log(`创建通知: 001 -> 002 (回复 ${reply.id})`);
        notificationCount++;
      }
    }

    console.log(`\n修复完成:`);
    console.log(`- 修复了 ${fixedCount} 条错误回复`);
    console.log(`- 创建了 ${notificationCount} 条通知`);
    console.log(`- 现在001的回复将正确显示为 "001 ▶ 002"`);
  } catch (error) {
    console.error('修复过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
