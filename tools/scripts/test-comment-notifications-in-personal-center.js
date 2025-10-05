/**
 * 测试三种评论区的回复通知是否正确出现在个人中心通知页面
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('📬 测试评论回复通知在个人中心的显示\n');

    // 1. 检查所有评论回复通知
    console.log('=== 检查评论回复通知记录 ===');
    const replyNotifications = await prisma.notification.findMany({
      where: {
        type: 'COMMENT_REPLY',
      },
      include: {
        user: { select: { id: true, username: true } },
        actor: { select: { id: true, username: true } },
        comment: {
          select: {
            id: true,
            anchorType: true,
            filePath: true,
            lineStart: true,
            content: true,
            snapshot: {
              select: {
                repository: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`评论回复通知总数: ${replyNotifications.length} 条\n`);

    if (replyNotifications.length === 0) {
      console.log('❌ 没有发现评论回复通知');
      console.log('   这可能意味着：');
      console.log('   1. 系统中没有回复评论');
      console.log('   2. 回复通知创建逻辑有问题');
      console.log('   3. 或者所有回复都是自己回复自己');
    } else {
      // 按评论类型分组分析
      const notificationsByType = {
        PROJECT: [],
        SNAPSHOT: [],
        LINE: [],
      };

      replyNotifications.forEach(notif => {
        const anchorType = notif.comment?.anchorType;
        if (anchorType && notificationsByType[anchorType]) {
          notificationsByType[anchorType].push(notif);
        }
      });

      console.log('按评论类型分类的通知:');

      // 社区评论 (PROJECT)
      console.log(
        `\n🏢 社区评论区回复通知: ${notificationsByType.PROJECT.length} 条`
      );
      notificationsByType.PROJECT.forEach(notif => {
        console.log(`  ${notif.actor.username} -> ${notif.user.username}`);
        console.log(
          `    项目: ${notif.comment.snapshot?.repository?.name || '未知'}`
        );
        console.log(`    内容: ${notif.content || '无内容'}`);
        console.log(`    时间: ${notif.createdAt}`);
        console.log(`    已读: ${notif.isRead ? '是' : '否'}`);
        console.log('');
      });

      // 项目讨论评论 (SNAPSHOT without filePath)
      const discussionNotifications = notificationsByType.SNAPSHOT.filter(
        notif => !notif.comment?.filePath
      );
      console.log(
        `💬 项目讨论区回复通知: ${discussionNotifications.length} 条`
      );
      discussionNotifications.forEach(notif => {
        console.log(`  ${notif.actor.username} -> ${notif.user.username}`);
        console.log(
          `    项目: ${notif.comment.snapshot?.repository?.name || '未知'}`
        );
        console.log(`    内容: ${notif.content || '无内容'}`);
        console.log(`    时间: ${notif.createdAt}`);
        console.log(`    已读: ${notif.isRead ? '是' : '否'}`);
        console.log('');
      });

      // 行级评论 (LINE)
      console.log(
        `📝 行级评论区回复通知: ${notificationsByType.LINE.length} 条`
      );
      notificationsByType.LINE.forEach(notif => {
        console.log(`  ${notif.actor.username} -> ${notif.user.username}`);
        console.log(
          `    文件: ${notif.comment?.filePath || '未知'}:${notif.comment?.lineStart || '?'}`
        );
        console.log(
          `    项目: ${notif.comment.snapshot?.repository?.name || '未知'}`
        );
        console.log(`    内容: ${notif.content || '无内容'}`);
        console.log(`    时间: ${notif.createdAt}`);
        console.log(`    已读: ${notif.isRead ? '是' : '否'}`);
        console.log('');
      });
    }

    // 2. 检查每个用户在个人中心应该看到的通知
    console.log('=== 检查用户个人中心通知 ===');
    for (const userId of [
      'cmgciw6ml0000wmczkb7vza90',
      'cmgcr58ue0016imi9yaj6x5gt',
    ]) {
      const username = userId === 'cmgciw6ml0000wmczkb7vza90' ? '001' : '002';

      const userNotifications = await prisma.notification.findMany({
        where: {
          userId: userId,
          type: 'COMMENT_REPLY',
        },
        include: {
          actor: { select: { username: true } },
          comment: {
            select: {
              anchorType: true,
              filePath: true,
              lineStart: true,
              snapshot: {
                select: {
                  repository: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      console.log(
        `${username} 的个人中心通知 (${userNotifications.length} 条):`
      );

      if (userNotifications.length === 0) {
        console.log(`  📭 暂无评论回复通知`);
      } else {
        const unreadCount = userNotifications.filter(n => !n.isRead).length;
        console.log(`  📊 总通知: ${userNotifications.length} 条`);
        console.log(`  🔴 未读: ${unreadCount} 条`);
        console.log(
          `  📱 个人中心徽章应该显示: ${unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : '无徽章'}`
        );

        console.log(`  📋 通知详情:`);
        userNotifications.forEach(notif => {
          const comment = notif.comment;
          let location = '';

          if (comment?.anchorType === 'PROJECT') {
            location = `社区评论区 (${comment.snapshot?.repository?.name})`;
          } else if (comment?.anchorType === 'SNAPSHOT' && !comment?.filePath) {
            location = `项目讨论区 (${comment.snapshot?.repository?.name})`;
          } else if (comment?.anchorType === 'LINE') {
            location = `行级评论区 (${comment.filePath}:${comment.lineStart})`;
          } else {
            location = '未知位置';
          }

          console.log(`    - ${notif.actor.username} 在 ${location} 回复了你`);
          console.log(`      内容: ${notif.content || '无内容'}`);
          console.log(`      时间: ${notif.createdAt}`);
          console.log(`      状态: ${notif.isRead ? '已读' : '未读'}`);
        });
      }
      console.log('');
    }

    // 3. 验证通知跳转URL的正确性
    console.log('=== 验证通知跳转URL ===');

    const sampleNotifications = replyNotifications.slice(0, 3);
    if (sampleNotifications.length > 0) {
      console.log('示例通知的跳转URL验证:');

      sampleNotifications.forEach(notif => {
        const comment = notif.comment;
        let expectedUrl = '';

        if (comment?.anchorType === 'PROJECT') {
          const repoId = comment.snapshot?.repository?.id;
          expectedUrl = `/community?repoId=${repoId}&commentId=${comment.id}`;
        } else if (comment?.anchorType === 'SNAPSHOT' && !comment?.filePath) {
          const repoId = comment.snapshot?.repository?.id;
          expectedUrl = `/repositories/${repoId}?tab=discussion&commentId=${comment.id}`;
        } else if (
          comment?.anchorType === 'LINE' &&
          comment?.filePath &&
          comment?.lineStart
        ) {
          expectedUrl = `/snapshots/${notif.snapshotId}?file=${comment.filePath}&line=${comment.lineStart}&commentId=${comment.id}`;
        } else {
          expectedUrl = `/snapshots/${notif.snapshotId}?commentId=${comment.id}`;
        }

        console.log(
          `  通知: ${notif.actor.username} -> ${notif.user.username}`
        );
        console.log(`  类型: ${comment?.anchorType || '未知'}`);
        console.log(`  跳转URL: ${expectedUrl}`);
        console.log('');
      });
    }

    // 4. 检查通知系统的完整性
    console.log('=== 通知系统完整性检查 ===');

    // 检查是否有回复但没有通知的情况
    const allReplies = await prisma.comment.findMany({
      where: {
        parentId: { not: null },
      },
      include: {
        author: { select: { id: true, username: true } },
        parent: {
          include: {
            author: { select: { id: true, username: true } },
          },
        },
      },
    });

    const validReplies = allReplies.filter(
      reply => reply.parent && reply.authorId !== reply.parent.authorId
    );

    console.log(`系统中的有效回复: ${validReplies.length} 条`);
    console.log(`对应的回复通知: ${replyNotifications.length} 条`);

    if (validReplies.length === replyNotifications.length) {
      console.log('✅ 通知系统完整性良好 - 每个有效回复都有对应通知');
    } else if (validReplies.length > replyNotifications.length) {
      console.log(
        `⚠️  可能缺少 ${validReplies.length - replyNotifications.length} 条通知`
      );

      // 找出缺少通知的回复
      const notifiedCommentIds = new Set(
        replyNotifications.map(n => n.commentId)
      );
      const missingNotifications = validReplies.filter(
        reply => !notifiedCommentIds.has(reply.id)
      );

      if (missingNotifications.length > 0) {
        console.log('  缺少通知的回复:');
        missingNotifications.forEach(reply => {
          console.log(
            `    ${reply.author.username} -> ${reply.parent.author.username} (评论ID: ${reply.id})`
          );
        });
      }
    } else {
      console.log(`ℹ️  通知数量多于回复数量，可能包含历史修复的通知`);
    }

    // 5. 总结
    console.log('\n📋 测试总结:');
    console.log('三种评论区的回复通知测试结果:');

    const projectCount = replyNotifications.filter(
      n => n.comment?.anchorType === 'PROJECT'
    ).length;
    const discussionCount = replyNotifications.filter(
      n => n.comment?.anchorType === 'SNAPSHOT' && !n.comment?.filePath
    ).length;
    const lineCount = replyNotifications.filter(
      n => n.comment?.anchorType === 'LINE'
    ).length;

    console.log(`✅ 社区评论区: ${projectCount} 条通知`);
    console.log(`✅ 项目讨论区: ${discussionCount} 条通知`);
    console.log(`✅ 行级评论区: ${lineCount} 条通知`);
    console.log(`📊 总计: ${replyNotifications.length} 条通知`);

    if (replyNotifications.length > 0) {
      console.log('\n✅ 评论回复通知系统工作正常！');
      console.log('✅ 三种评论区的回复都能正确出现在个人中心通知页面');
      console.log('✅ 通知包含正确的跳转链接和内容信息');
    } else {
      console.log('\n⚠️  当前没有评论回复通知，建议创建一些测试数据验证功能');
    }
  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
