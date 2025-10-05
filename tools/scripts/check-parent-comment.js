/**
 * 检查错误的父评论
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    // 查看这个被错误引用的父评论
    const parentComment = await prisma.comment.findUnique({
      where: { id: 'cmgcpjwjg000vimi9ukj0zcuw' },
      include: {
        author: {
          select: { id: true, username: true },
        },
        replies: {
          include: {
            author: {
              select: { id: true, username: true },
            },
          },
        },
      },
    });

    if (parentComment) {
      console.log('错误的父评论信息:');
      console.log(`  ID: ${parentComment.id}`);
      console.log(`  作者: ${parentComment.author.username}`);
      console.log(`  内容: ${parentComment.content}`);
      console.log(`  创建时间: ${parentComment.createdAt}`);
      console.log(`  回复数量: ${parentComment.replies.length}`);
      console.log('');

      console.log('所有回复:');
      for (const reply of parentComment.replies) {
        console.log(
          `  - ${reply.author.username}: ${reply.content.substring(0, 30)}...`
        );
      }
    }

    // 查找002的评论，看看应该回复哪个
    const user002Comments = await prisma.comment.findMany({
      where: {
        authorId: 'cmgcr58ue0016imi9yaj6x5gt', // 002的ID
        parentId: null, // 主评论，不是回复
      },
      include: {
        author: {
          select: { id: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('\n002用户的主评论:');
    for (const comment of user002Comments) {
      console.log(`  ID: ${comment.id}`);
      console.log(`  内容: ${comment.content}`);
      console.log(`  创建时间: ${comment.createdAt}`);
      console.log('');
    }
  } catch (error) {
    console.error('检查过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
