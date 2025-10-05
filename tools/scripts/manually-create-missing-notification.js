/**
 * 手动为缺失的回复创建通知
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('为缺失的回复创建通知...\n');

    // 查找002回复001的评论
    const replyComment = await prisma.comment.findUnique({
      where: { id: 'cmgdxxrhu0009m0p5zgexla7r' },
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

    if (!replyComment) {
      console.log('找不到指定的回复评论');
      return;
    }

    console.log('回复评论信息:');
    console.log(`  ID: ${replyComment.id}`);
    console.log(
      `  作者: ${replyComment.author.username} (${replyComment.authorId})`
    );
    console.log(`  内容: ${replyComment.content}`);
    console.log(
      `  父评论作者: ${replyComment.parent?.author.username} (${replyComment.parent?.authorId})`
    );
    console.log(`  创建时间: ${replyComment.createdAt}`);

    if (!replyComment.parent) {
      console.log('父评论不存在，无法创建通知');
      return;
    }

    // 检查是否已经有通知
    const existingNotification = await prisma.notification.findFirst({
      where: {
        type: 'COMMENT_REPLY',
        commentId: replyComment.id,
        userId: replyComment.parent.authorId,
        actorId: replyComment.authorId,
      },
    });

    if (existingNotification) {
      console.log('通知已存在，无需创建');
      return;
    }

    // 创建通知
    const contentSnippet = `${replyComment.author.username}: ${replyComment.content.substring(0, 80)}${replyComment.content.length > 80 ? '...' : ''}`;

    const notification = await prisma.notification.create({
      data: {
        userId: replyComment.parent.authorId,
        actorId: replyComment.authorId,
        type: 'COMMENT_REPLY',
        commentId: replyComment.id,
        parentId: replyComment.parentId,
        snapshotId: replyComment.snapshotId,
        content: contentSnippet,
        createdAt: replyComment.createdAt,
      },
    });

    console.log(`\n成功创建通知:`);
    console.log(`  通知ID: ${notification.id}`);
    console.log(
      `  ${replyComment.author.username} -> ${replyComment.parent.author.username}`
    );
    console.log(`  内容: ${contentSnippet}`);

    // 验证通知是否创建成功
    const verifyNotification = await prisma.notification.findUnique({
      where: { id: notification.id },
      include: {
        user: { select: { username: true } },
        actor: { select: { username: true } },
      },
    });

    if (verifyNotification) {
      console.log(`\n验证成功: 通知已创建并存储在数据库中`);
      console.log(`  通知给: ${verifyNotification.user.username}`);
      console.log(`  来自: ${verifyNotification.actor.username}`);
    }
  } catch (error) {
    console.error('创建通知过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
