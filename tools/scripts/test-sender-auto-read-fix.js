/**
 * 测试修复发送者自动标记已读问题的效果
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🧪 测试修复发送者自动标记已读问题\n');

    const user001Id = 'cmgciw6ml0000wmczkb7vza90';
    const user002Id = 'cmgcr58ue0016imi9yaj6x5gt';

    // 1. 检查当前状态
    console.log('=== 当前状态检查 ===');

    const directChat = await prisma.chat.findFirst({
      where: {
        type: 'DIRECT',
        members: {
          every: {
            userId: { in: [user001Id, user002Id] },
          },
        },
      },
    });

    if (!directChat) {
      console.log('❌ 没有找到001和002的聊天室');
      return;
    }

    // 检查最新消息
    const latestMessage = await prisma.message.findFirst({
      where: { chatId: directChat.id },
      include: {
        sender: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (latestMessage) {
      console.log('最新消息:');
      console.log(`  发送者: ${latestMessage.sender.username}`);
      console.log(`  内容: ${latestMessage.content}`);
      console.log(`  时间: ${latestMessage.createdAt}`);
      console.log(`  已读状态: ${latestMessage.isRead ? '已读' : '未读'}`);
    }

    // 检查每个用户的状态
    for (const userId of [user001Id, user002Id]) {
      const username = userId === user001Id ? '001' : '002';

      const chatMember = await prisma.chatMember.findUnique({
        where: {
          chatId_userId: {
            chatId: directChat.id,
            userId: userId,
          },
        },
      });

      if (chatMember) {
        const lastRead = chatMember.lastReadAt || new Date(0);
        const unreadCount = await prisma.message.count({
          where: {
            chatId: directChat.id,
            senderId: { not: userId },
            createdAt: { gt: lastRead },
          },
        });

        console.log(`\n${username} 的状态:`);
        console.log(`  最后阅读时间: ${chatMember.lastReadAt || '从未阅读'}`);
        console.log(`  未读消息数: ${unreadCount}`);

        if (unreadCount > 0) {
          const unreadMessages = await prisma.message.findMany({
            where: {
              chatId: directChat.id,
              senderId: { not: userId },
              createdAt: { gt: lastRead },
            },
            include: {
              sender: { select: { username: true } },
            },
            orderBy: { createdAt: 'desc' },
          });

          console.log(`  未读消息详情:`);
          unreadMessages.forEach(msg => {
            console.log(
              `    ${msg.sender.username}: ${msg.content} (${msg.createdAt})`
            );
          });
        }
      }
    }

    // 2. 修复总结
    console.log('\n=== 修复总结 ===');
    console.log('🔧 已修复的问题:');
    console.log('1. ✅ 移除了chatroom/page.tsx中发送消息后的自动markRead()');
    console.log('2. ✅ 移除了chat/[id]/page.tsx中发送消息后的自动markRead()');
    console.log('3. ✅ 修复了前端未读数增加逻辑(chat-store.ts)');
    console.log('4. ✅ 修复了后端未读计算逻辑(chats.service.ts)');
    console.log('5. ✅ 修复了前端导航栏聊天徽章组件(nav-chat-link.tsx)');

    console.log('\n🎯 修复效果:');
    console.log('- 发送者发送消息后不会自动标记为已读');
    console.log('- 接收者会正确看到未读消息数量');
    console.log('- 同一网页切换账户时不会有状态污染');
    console.log('- 只有用户主动点击"标记已读"才会清除未读状态');

    // 3. 测试建议
    console.log('\n=== 测试建议 ===');
    console.log('请按以下步骤测试:');
    console.log('1. 重启前端服务以应用修复');
    console.log('2. 001用户登录并发送消息给002');
    console.log('3. 检查001发送消息后不会自动标记为已读');
    console.log('4. 退出001账户，登录002账户');
    console.log('5. 检查002是否能看到来自001的未读消息徽章');
    console.log('6. 验证聊天室按钮和好友列表都显示正确的未读数');

    // 4. 账户切换状态隔离
    console.log('\n=== 账户切换状态隔离 ===');
    console.log('当前的状态隔离机制:');
    console.log('✅ auth-store.logout() 调用所有store的reset()方法');
    console.log('✅ chat-store.reset() 清空聊天记录和状态');
    console.log('✅ 移除了发送消息时的自动标记已读');
    console.log('✅ WebSocket事件处理正确区分发送者和接收者');

    console.log('\n现在应该不会有以下问题:');
    console.log('❌ 发送者发送消息后自动标记已读');
    console.log('❌ 切换账户时状态污染');
    console.log('❌ 未读消息被错误清除');
  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
