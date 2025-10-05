/**
 * 分析评论类型，确定正确的跳转逻辑
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('分析评论类型和跳转逻辑...\n');

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
        snapshot: {
          include: {
            repository: {
              select: { id: true, name: true, ownerId: true },
            },
          },
        },
      },
    });

    if (!replyComment) {
      console.log('找不到指定的回复评论');
      return;
    }

    console.log('回复评论详细信息:');
    console.log(`  ID: ${replyComment.id}`);
    console.log(`  作者: ${replyComment.author.username}`);
    console.log(`  内容: ${replyComment.content}`);
    console.log(`  锚点类型: ${replyComment.anchorType}`);
    console.log(`  文件路径: ${replyComment.filePath || '无'}`);
    console.log(`  行号: ${replyComment.lineStart || '无'}`);
    console.log(`  快照ID: ${replyComment.snapshotId}`);
    console.log(`  仓库ID: ${replyComment.snapshot?.repository?.id || '无'}`);
    console.log(
      `  仓库名称: ${replyComment.snapshot?.repository?.name || '无'}`
    );
    console.log(`  创建时间: ${replyComment.createdAt}`);

    // 判断评论类型
    let commentType = '未知';
    let correctUrl = '';

    if (replyComment.anchorType === 'PROJECT') {
      commentType = '社区/项目级评论';
      correctUrl = `/community?repoId=${replyComment.snapshot?.repository?.id}&commentId=${replyComment.id}`;
    } else if (
      replyComment.anchorType === 'LINE' &&
      replyComment.filePath &&
      replyComment.lineStart
    ) {
      commentType = '行级评论';
      const params = new URLSearchParams();
      params.set('file', replyComment.filePath);
      params.set('line', String(replyComment.lineStart));
      params.set('commentId', replyComment.id);
      correctUrl = `/snapshots/${replyComment.snapshotId}?${params.toString()}`;
    } else if (replyComment.anchorType === 'SNAPSHOT') {
      commentType = '快照级评论';
      correctUrl = `/snapshots/${replyComment.snapshotId}?commentId=${replyComment.id}`;
    }

    console.log(`\n评论类型判断:`);
    console.log(`  类型: ${commentType}`);
    console.log(`  正确的跳转URL: ${correctUrl}`);

    // 检查父评论的信息
    if (replyComment.parent) {
      console.log(`\n父评论信息:`);
      console.log(`  ID: ${replyComment.parent.id}`);
      console.log(`  作者: ${replyComment.parent.author.username}`);
      console.log(`  内容: ${replyComment.parent.content}`);
      console.log(`  锚点类型: ${replyComment.parent.anchorType}`);
      console.log(`  文件路径: ${replyComment.parent.filePath || '无'}`);
      console.log(`  行号: ${replyComment.parent.lineStart || '无'}`);
    }

    // 检查对应的通知
    const notification = await prisma.notification.findFirst({
      where: {
        commentId: replyComment.id,
        type: 'COMMENT_REPLY',
      },
    });

    if (notification) {
      console.log(`\n对应的通知信息:`);
      console.log(`  通知ID: ${notification.id}`);
      console.log(`  快照ID: ${notification.snapshotId}`);
      console.log(`  内容: ${notification.content}`);
    }
  } catch (error) {
    console.error('分析过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
