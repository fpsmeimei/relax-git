/**
 * 修复通知表中错误的快照ID
 *
 * 问题：通知表中的snapshotId可能是SessionSnapshot ID，但应该是BaseSnapshot ID
 * 解决：将SessionSnapshot ID转换为对应的BaseSnapshot ID
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('开始修复通知表中的快照ID...');

    // 查找所有包含快照ID的通知
    const notifications = await prisma.notification.findMany({
      where: {
        snapshotId: { not: null },
      },
      select: {
        id: true,
        snapshotId: true,
        commentId: true,
      },
    });

    console.log(`找到 ${notifications.length} 条包含快照ID的通知`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const notification of notifications) {
      try {
        const snapshotId = notification.snapshotId;

        // 检查是否是BaseSnapshot ID
        const baseSnapshot = await prisma.baseSnapshot.findUnique({
          where: { id: snapshotId },
          select: { id: true },
        });

        if (baseSnapshot) {
          // 已经是BaseSnapshot ID，无需修复
          continue;
        }

        // 尝试作为SessionSnapshot ID查找对应的BaseSnapshot
        const sessionSnapshot = await prisma.sessionSnapshot.findUnique({
          where: { id: snapshotId },
          select: { baseSnapshotId: true },
        });

        if (sessionSnapshot?.baseSnapshotId) {
          // 更新通知中的快照ID
          await prisma.notification.update({
            where: { id: notification.id },
            data: { snapshotId: sessionSnapshot.baseSnapshotId },
          });

          console.log(
            `修复通知 ${notification.id}: ${snapshotId} -> ${sessionSnapshot.baseSnapshotId}`
          );
          fixedCount++;
        } else {
          // 通过评论ID查找正确的快照ID
          if (notification.commentId) {
            const comment = await prisma.comment.findUnique({
              where: { id: notification.commentId },
              select: { snapshotId: true },
            });

            if (comment?.snapshotId && comment.snapshotId !== snapshotId) {
              await prisma.notification.update({
                where: { id: notification.id },
                data: { snapshotId: comment.snapshotId },
              });

              console.log(
                `通过评论修复通知 ${notification.id}: ${snapshotId} -> ${comment.snapshotId}`
              );
              fixedCount++;
            } else {
              console.warn(
                `无法修复通知 ${notification.id}，快照ID ${snapshotId} 无效`
              );
              errorCount++;
            }
          } else {
            console.warn(`无法修复通知 ${notification.id}，缺少评论ID`);
            errorCount++;
          }
        }
      } catch (error) {
        console.error(`修复通知 ${notification.id} 时出错:`, error.message);
        errorCount++;
      }
    }

    console.log(`修复完成: 成功修复 ${fixedCount} 条，失败 ${errorCount} 条`);
  } catch (error) {
    console.error('修复过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
