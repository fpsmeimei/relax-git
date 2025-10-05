/**
 * 测试通知API返回的数据结构
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('测试修复后的通知API数据结构...\n');

    // 模拟通知服务的查询（与notifications.service.ts中的逻辑一致）
    const notifications = await prisma.notification.findMany({
      where: {
        userId: 'cmgciw6ml0000wmczkb7vza90', // 001的ID
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        actor: { select: { id: true, username: true, avatar: true } },
        comment: {
          select: {
            id: true,
            snapshotId: true,
            anchorType: true,
            commitSha: true,
            filePath: true,
            lineStart: true,
            lineEnd: true,
            snapshot: {
              select: {
                repository: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log(`找到 ${notifications.length} 条通知:`);

    for (const notification of notifications) {
      console.log(`\n通知ID: ${notification.id}`);
      console.log(`  类型: ${notification.type}`);
      console.log(`  触发者: ${notification.actor.username}`);
      console.log(`  评论ID: ${notification.commentId}`);

      if (notification.comment) {
        console.log(`  评论信息:`);
        console.log(`    锚点类型: ${notification.comment.anchorType}`);
        console.log(`    快照ID: ${notification.comment.snapshotId}`);
        console.log(`    文件路径: ${notification.comment.filePath || '无'}`);
        console.log(`    行号: ${notification.comment.lineStart || '无'}`);

        if (notification.comment.snapshot?.repository) {
          console.log(
            `    仓库ID: ${notification.comment.snapshot.repository.id}`
          );
          console.log(
            `    仓库名称: ${notification.comment.snapshot.repository.name}`
          );
        }

        // 根据评论类型生成正确的跳转URL
        let correctUrl = '';
        const anchorType = notification.comment.anchorType;

        if (anchorType === 'PROJECT') {
          const repoId = notification.comment.snapshot?.repository?.id;
          if (repoId) {
            correctUrl = `/community?repoId=${repoId}&commentId=${notification.commentId}`;
          }
        } else if (
          anchorType === 'SNAPSHOT' &&
          !notification.comment.filePath
        ) {
          const repoId = notification.comment.snapshot?.repository?.id;
          if (repoId) {
            correctUrl = `/repositories/${repoId}?tab=discussion&commentId=${notification.commentId}`;
          }
        } else if (
          anchorType === 'LINE' &&
          notification.comment.filePath &&
          notification.comment.lineStart
        ) {
          const params = new URLSearchParams();
          params.set('file', notification.comment.filePath);
          params.set('line', String(notification.comment.lineStart));
          params.set('commentId', notification.commentId);
          correctUrl = `/snapshots/${notification.comment.snapshotId}?${params.toString()}`;
        } else if (notification.comment.snapshotId) {
          correctUrl = `/snapshots/${notification.comment.snapshotId}?commentId=${notification.commentId}`;
        }

        console.log(`    正确跳转URL: ${correctUrl}`);
      }

      console.log(`  创建时间: ${notification.createdAt}`);
    }
  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
