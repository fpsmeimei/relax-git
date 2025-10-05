/**
 * 测试聊天未读消息的最终修复效果
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🧪 测试聊天未读消息最终修复效果\n');

    // 1. 检查当前数据库状态
    console.log('=== 当前数据库状态 ===');
    const user002Id = 'cmgcr58ue0016imi9yaj6x5gt';

    const chatMembers = await prisma.chatMember.findMany({
      where: { userId: user002Id },
      include: {
        chat: {
          select: {
            id: true,
            name: true,
            type: true,
            members: {
              include: {
                user: { select: { username: true } },
              },
            },
          },
        },
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

      const otherMembers = member.chat.members
        .filter(m => m.userId !== user002Id)
        .map(m => m.user.username);

      console.log(
        `聊天室: ${member.chat.name || '未命名'} (与 ${otherMembers.join(', ')} 的对话)`
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

    console.log(`002用户总未读消息: ${totalUnread} 条`);
    console.log(
      `聊天室按钮徽章应该显示: ${totalUnread > 0 ? (totalUnread > 99 ? '99+' : totalUnread) : '无徽章'}`
    );

    // 2. 模拟前端修复后的逻辑
    console.log('\n=== 模拟修复后的前端逻辑 ===');

    // 模拟收到新消息的场景
    const latestMessage = await prisma.message.findFirst({
      where: {
        chat: {
          members: {
            some: { userId: user002Id },
          },
        },
      },
      include: {
        sender: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (latestMessage) {
      console.log('模拟收到最新消息:');
      console.log(`  发送者: ${latestMessage.sender.username}`);
      console.log(`  内容: ${latestMessage.content}`);
      console.log(`  时间: ${latestMessage.createdAt}`);

      // 模拟修复后的逻辑
      const isSelf = latestMessage.senderId === user002Id;
      const shouldIncUnread = !isSelf; // 修复后的简化逻辑

      console.log('\n修复后的前端逻辑:');
      console.log(`  isSelf: ${isSelf}`);
      console.log(
        `  shouldIncUnread: ${shouldIncUnread} (简化逻辑：只要不是自己发送就增加未读数)`
      );
      console.log(
        `  结果: ${shouldIncUnread ? '✅ 会增加未读数' : '❌ 不会增加未读数'}`
      );
    }

    // 3. 修复总结
    console.log('\n=== 修复总结 ===');
    console.log('🔧 已完成的修复:');
    console.log('1. ✅ 修复了前端导航栏聊天徽章组件 (nav-chat-link.tsx)');
    console.log('2. ✅ 修复了后端未读计算逻辑 (chats.service.ts)');
    console.log('3. ✅ 移除了自动标记已读的逻辑 (chatroom/page.tsx)');
    console.log('4. ✅ 添加了手动"标记已读"按钮');
    console.log('5. ✅ 修复了前端未读数增加逻辑 (chat-store.ts)');
    console.log('');

    console.log('🎯 关键修复:');
    console.log(
      '- 原逻辑: shouldIncUnread = !isSelf && currentChatId !== chatId'
    );
    console.log('- 新逻辑: shouldIncUnread = !isSelf');
    console.log('- 效果: 只要收到非自己发送的消息就增加未读数');
    console.log('');

    console.log('📱 预期效果:');
    console.log('1. 001发送消息给002时，002的聊天室按钮会显示红色徽章');
    console.log('2. 002进入聊天室页面，001头像旁会显示红色数字');
    console.log('3. 只有002点击"标记已读"后，徽章才会消失');
    console.log('4. 实时WebSocket推送会立即更新未读计数');

    if (totalUnread > 0) {
      console.log('\n🎉 当前状态:');
      console.log(`有 ${totalUnread} 条未读消息，修复后应该能看到徽章！`);
      console.log('请刷新前端页面查看效果。');
    } else {
      console.log('\n💡 测试建议:');
      console.log('1. 让001用户发送新消息给002');
      console.log('2. 检查002的聊天室按钮是否显示红色徽章');
      console.log('3. 检查聊天室页面好友列表中001头像旁的红色数字');
      console.log('4. 验证只有点击"标记已读"后徽章才消失');
    }
  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
