/**
 * 测试聊天未读消息修复的最终效果
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🧪 测试聊天未读消息修复效果\n');

    // 1. 检查当前的聊天消息状态
    console.log('=== 当前聊天消息状态 ===');

    const recentMessages = await prisma.message.findMany({
      include: {
        sender: { select: { username: true } },
        chat: { select: { name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log(`最近消息 (${recentMessages.length} 条):`);
    recentMessages.forEach(msg => {
      console.log(`  ${msg.sender.username}: ${msg.content}`);
      console.log(`    时间: ${msg.createdAt}`);
      console.log(`    已读: ${msg.isRead ? '是' : '否'}`);
      console.log('');
    });

    // 2. 检查002用户的未读消息计算
    console.log('=== 002用户未读消息计算 ===');
    const user002Id = 'cmgcr58ue0016imi9yaj6x5gt';

    const chatMembers = await prisma.chatMember.findMany({
      where: { userId: user002Id },
      include: {
        chat: { select: { id: true, name: true, type: true } },
      },
    });

    let totalUnread = 0;

    for (const member of chatMembers) {
      const lastRead = member.lastReadAt || new Date(0);
      const unreadCount = await prisma.message.count({
        where: {
          chatId: member.chat.id,
          senderId: { not: user002Id },
          createdAt: { gt: lastRead },
        },
      });

      totalUnread += unreadCount;

      console.log(
        `聊天室: ${member.chat.name || '未命名'} (${member.chat.type})`
      );
      console.log(`  最后阅读: ${member.lastReadAt || '从未阅读'}`);
      console.log(`  未读消息: ${unreadCount} 条`);

      if (unreadCount > 0) {
        const unreadMessages = await prisma.message.findMany({
          where: {
            chatId: member.chat.id,
            senderId: { not: user002Id },
            createdAt: { gt: lastRead },
          },
          include: {
            sender: { select: { username: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        });

        console.log(`  未读消息详情:`);
        unreadMessages.forEach(msg => {
          console.log(
            `    ${msg.sender.username}: ${msg.content} (${msg.createdAt})`
          );
        });
      }
      console.log('');
    }

    // 3. 检查私聊消息
    const privateUnread = await prisma.chatMessage.count({
      where: {
        toUserId: user002Id,
        isRead: false,
      },
    });

    console.log(`私聊未读消息: ${privateUnread} 条`);

    const totalUnreadAll = totalUnread + privateUnread;
    console.log(`\n002用户总未读消息: ${totalUnreadAll} 条`);
    console.log(
      `聊天室按钮徽章应该显示: ${totalUnreadAll > 0 ? (totalUnreadAll > 99 ? '99+' : totalUnreadAll) : '无徽章'}`
    );

    // 4. 修复建议
    console.log('\n=== 修复总结 ===');
    console.log('已完成的修复:');
    console.log('✅ 1. 修复了前端导航栏聊天徽章组件');
    console.log('✅ 2. 修复了后端未读计算逻辑');
    console.log('✅ 3. 移除了自动标记已读的逻辑');
    console.log('✅ 4. 添加了手动"标记已读"按钮');

    console.log('\n预期效果:');
    console.log('📱 聊天室按钮会显示正确的未读数量');
    console.log('👥 好友列表中会显示未读消息数字');
    console.log('🔴 只有用户主动点击"标记已读"才会清除未读状态');
    console.log('⚡ 新消息到达时会实时更新未读计数');

    if (totalUnreadAll > 0) {
      console.log('\n🎯 当前状态:');
      console.log(`有 ${totalUnreadAll} 条未读消息，修复后应该能看到徽章！`);
    } else {
      console.log('\n💡 测试建议:');
      console.log('让001用户发送新消息给002，然后检查:');
      console.log('1. 聊天室按钮是否显示红色徽章');
      console.log('2. 好友列表中001头像旁是否显示红色数字');
      console.log('3. 只有点击"标记已读"后徽章才消失');
    }
  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
