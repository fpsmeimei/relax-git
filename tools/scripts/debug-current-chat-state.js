/**
 * 调试当前聊天状态，特别是currentChatId的设置
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 调试当前聊天状态\n');

    // 1. 检查002用户的聊天室列表
    console.log('=== 002用户的聊天室列表 ===');
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

    console.log(`002的聊天室 (${chatMembers.length} 个):`);
    chatMembers.forEach(member => {
      const otherMembers = member.chat.members
        .filter(m => m.userId !== user002Id)
        .map(m => m.user.username);

      console.log(`  聊天室ID: ${member.chat.id}`);
      console.log(`  类型: ${member.chat.type}`);
      console.log(`  对话对象: ${otherMembers.join(', ')}`);
      console.log(`  最后阅读: ${member.lastReadAt || '从未阅读'}`);
      console.log('');
    });

    // 2. 分析前端状态管理的问题
    console.log('=== 前端状态管理问题分析 ===');

    console.log('当前的逻辑问题:');
    console.log('1. 用户在聊天室页面选择了某个聊天室');
    console.log('2. setCurrentChat(chatId) 被调用');
    console.log('3. 当收到新消息时，updateOnNewMessage 检查:');
    console.log('   - !isSelf: 不是自己发送的消息 ✓');
    console.log('   - currentChatId !== chatId: 当前聊天室不是消息来源聊天室');
    console.log('');

    console.log('🚨 问题场景:');
    console.log('- 002用户在聊天室页面，选择了与001的聊天室');
    console.log('- currentChatId 被设置为 001-002 聊天室的ID');
    console.log('- 001发送新消息到这个聊天室');
    console.log('- 消息的chatId === currentChatId');
    console.log('- shouldIncUnread = false (因为 currentChatId === chatId)');
    console.log('- 未读数不会增加！');
    console.log('');

    console.log('💡 正确的逻辑应该是:');
    console.log('- 如果用户正在聊天室页面，但没有选择任何聊天室 → 增加未读数');
    console.log(
      '- 如果用户正在聊天室页面，选择了聊天室A，收到聊天室A的消息 → 不增加未读数'
    );
    console.log(
      '- 如果用户正在聊天室页面，选择了聊天室A，收到聊天室B的消息 → 增加未读数'
    );
    console.log('- 如果用户不在聊天室页面，收到任何消息 → 增加未读数');

    // 3. 检查具体的聊天室ID
    console.log('\n=== 具体聊天室ID检查 ===');

    const directChatWith001 = await prisma.chat.findFirst({
      where: {
        type: 'DIRECT',
        members: {
          every: {
            userId: { in: [user002Id, 'cmgciw6ml0000wmczkb7vza90'] },
          },
        },
      },
    });

    if (directChatWith001) {
      console.log(`002与001的聊天室ID: ${directChatWith001.id}`);

      // 检查最新消息
      const latestMessage = await prisma.message.findFirst({
        where: { chatId: directChatWith001.id },
        include: {
          sender: { select: { username: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (latestMessage) {
        console.log(
          `最新消息: ${latestMessage.sender.username}: ${latestMessage.content}`
        );
        console.log(`消息时间: ${latestMessage.createdAt}`);
        console.log(`消息chatId: ${latestMessage.chatId}`);

        // 模拟前端逻辑
        const isSelf = latestMessage.senderId === user002Id;
        const currentChatId = directChatWith001.id; // 假设用户选择了这个聊天室
        const shouldIncUnread =
          !isSelf && currentChatId !== latestMessage.chatId;

        console.log('\n模拟前端逻辑:');
        console.log(`  isSelf: ${isSelf}`);
        console.log(`  currentChatId: ${currentChatId}`);
        console.log(`  message.chatId: ${latestMessage.chatId}`);
        console.log(
          `  currentChatId !== message.chatId: ${currentChatId !== latestMessage.chatId}`
        );
        console.log(`  shouldIncUnread: ${shouldIncUnread}`);
        console.log('');
        console.log(
          `🎯 结果: ${shouldIncUnread ? '会增加未读数' : '不会增加未读数'}`
        );
      }
    }

    // 4. 解决方案
    console.log('\n=== 解决方案 ===');
    console.log('问题根源: currentChatId 的设置逻辑有问题');
    console.log('');
    console.log('方案1: 修改 shouldIncUnread 逻辑');
    console.log('- 考虑用户是否真正在"阅读"消息');
    console.log('- 只有用户主动查看消息时才不增加未读数');
    console.log('');
    console.log('方案2: 区分"选择聊天室"和"正在查看消息"');
    console.log('- 选择聊天室不等于正在查看消息');
    console.log('- 只有用户滚动到底部或主动标记已读时才算"查看"');
    console.log('');
    console.log('方案3: 简化逻辑，总是增加未读数');
    console.log('- 收到非自己发送的消息就增加未读数');
    console.log('- 依赖用户主动标记已读来清除');
  } catch (error) {
    console.error('调试过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
