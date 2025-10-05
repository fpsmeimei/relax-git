/**
 * 检查最近的通知记录
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('检查最近的通知记录...\n');

    // 查找最近的所有通知
    const recentNotifications = await prisma.notification.findMany({
      include: {
        user: {
          select: { id: true, username: true },
        },
        actor: {
          select: { id: true, username: true },
        },
        comment: {
          select: { id: true, content: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`最近的 ${recentNotifications.length} 条通知:`);
    for (const notification of recentNotifications) {
      console.log(`通知ID: ${notification.id}`);
      console.log(`  类型: ${notification.type}`);
      console.log(
        `  通知对象: ${notification.user.username} (ID: ${notification.userId})`
      );
      console.log(
        `  触发者: ${notification.actor.username} (ID: ${notification.actorId})`
      );
      console.log(`  评论ID: ${notification.commentId}`);
      console.log(
        `  评论内容: ${notification.comment?.content?.substring(0, 50) || '无'}...`
      );
      console.log(`  是否已读: ${notification.isRead}`);
      console.log(`  创建时间: ${notification.createdAt}`);
      console.log('');
    }

    // 检查最近的评论（特别是002回复001的）
    console.log('=== 检查最近的评论 ===\n');

    const recentComments = await prisma.comment.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000), // 最近10分钟
        },
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
    });

    console.log(`最近10分钟的 ${recentComments.length} 条评论:`);
    for (const comment of recentComments) {
      console.log(`评论ID: ${comment.id}`);
      console.log(`  作者: ${comment.author.username}`);
      console.log(`  内容: ${comment.content}`);
      console.log(`  是否是回复: ${comment.parentId ? '是' : '否'}`);
      if (comment.parent) {
        console.log(`  回复对象: ${comment.parent.author.username}`);
        console.log(
          `  应该通知: ${comment.parent.author.username} (ID: ${comment.parent.authorId})`
        );
      }
      console.log(`  创建时间: ${comment.createdAt}`);
      console.log('');
    }

    // 检查001用户的所有通知
    console.log('=== 001用户的所有通知 ===\n');

    const user001Notifications = await prisma.notification.findMany({
      where: {
        userId: 'cmgciw6ml0000wmczkb7vza90', // 001的ID
      },
      include: {
        actor: {
          select: { id: true, username: true },
        },
        comment: {
          select: { id: true, content: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`001用户共有 ${user001Notifications.length} 条通知:`);
    for (const notification of user001Notifications) {
      console.log(
        `  ${notification.actor.username} -> 001: ${notification.comment?.content?.substring(0, 30) || notification.content}... (${notification.createdAt})`
      );
    }
  } catch (error) {
    console.error('检查过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
