/**
 * 修复评论回复关系的错误数据
 *
 * 问题：由于前端显示逻辑错误，一些回复被错误地显示为"回复者回复自己"
 * 实际上这些回复应该是"回复者回复被回复者"
 *
 * 这个脚本会：
 * 1. 查找所有有parentId的回复评论
 * 2. 检查通知表中是否有对应的回复通知
 * 3. 修复错误的通知记录（如果需要）
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('开始修复评论回复关系...');

    // 查找所有回复评论（有parentId的评论）
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
      },
    });

    console.log(`找到 ${replyComments.length} 条回复评论`);

    let checkedCount = 0;
    let fixedNotificationCount = 0;
    let createdNotificationCount = 0;

    for (const reply of replyComments) {
      if (!reply.parent) {
        console.warn(`回复评论 ${reply.id} 的父评论不存在`);
        continue;
      }

      checkedCount++;

      // 检查是否应该有通知但没有通知
      if (reply.authorId !== reply.parent.authorId) {
        // 这是一个有效的回复（不是自己回复自己），应该有通知

        // 查找对应的通知
        const existingNotification = await prisma.notification.findFirst({
          where: {
            type: 'COMMENT_REPLY',
            commentId: reply.id,
            userId: reply.parent.authorId,
            actorId: reply.authorId,
          },
        });

        if (!existingNotification) {
          // 缺少通知，创建一个
          const contentSnippet = `${reply.author.username}: ${reply.content.substring(0, 80)}${reply.content.length > 80 ? '...' : ''}`;

          try {
            await prisma.notification.create({
              data: {
                userId: reply.parent.authorId,
                actorId: reply.authorId,
                type: 'COMMENT_REPLY',
                commentId: reply.id,
                parentId: reply.parentId,
                snapshotId: reply.snapshotId,
                content: contentSnippet,
                createdAt: reply.createdAt, // 使用回复的创建时间
              },
            });

            console.log(
              `为回复 ${reply.id} 创建通知: ${reply.author.username} -> ${reply.parent.author.username}`
            );
            createdNotificationCount++;
          } catch (error) {
            console.error(`创建通知失败 (回复 ${reply.id}):`, error.message);
          }
        }
      }

      // 检查是否有错误的通知（自己回复自己的通知）
      const wrongNotifications = await prisma.notification.findMany({
        where: {
          type: 'COMMENT_REPLY',
          commentId: reply.id,
          userId: reply.authorId, // 错误：通知发给了回复者自己
          actorId: reply.authorId, // 错误：回复者和被通知者是同一人
        },
      });

      if (wrongNotifications.length > 0) {
        // 删除错误的通知
        await prisma.notification.deleteMany({
          where: {
            id: { in: wrongNotifications.map(n => n.id) },
          },
        });

        console.log(
          `删除 ${wrongNotifications.length} 条错误通知 (回复 ${reply.id}): ${reply.author.username} 自己回复自己`
        );
        fixedNotificationCount += wrongNotifications.length;
      }
    }

    console.log(`修复完成:`);
    console.log(`- 检查了 ${checkedCount} 条回复评论`);
    console.log(`- 创建了 ${createdNotificationCount} 条缺失的通知`);
    console.log(`- 删除了 ${fixedNotificationCount} 条错误的通知`);
  } catch (error) {
    console.error('修复过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
