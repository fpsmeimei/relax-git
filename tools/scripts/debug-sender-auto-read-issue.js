/**
 * 调试发送者自动标记已读的问题
 * 检查001发送消息后是否被自动标记为已读
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 调试发送者自动标记已读问题\n');

    const user001Id = 'cmgciw6ml0000wmczkb7vza90';
    const user002Id = 'cmgcr58ue0016imi9yaj6x5gt';

    // 1. 检查001和002的聊天室
    console.log('=== 检查001和002的聊天室 ===');

    const directChat = await prisma.chat.findFirst({
      where: {
        type: 'DIRECT',
        members: {
          every: {
            userId: { in: [user001Id, user002Id] },
          },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { username: true } },
          },
        },
      },
    });

    if (!directChat) {
      console.log('❌ 没有找到001和002的聊天室');
      return;
    }

    console.log(`聊天室ID: ${directChat.id}`);
    console.log(
      '成员:',
      directChat.members.map(m => m.user.username).join(', ')
    );

    // 2. 检查最近的消息记录
    console.log('\n=== 检查最近的消息记录 ===');

    const recentMessages = await prisma.message.findMany({
      where: { chatId: directChat.id },
      include: {
        sender: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log(`最近消息 (${recentMessages.length} 条):`);
    recentMessages.forEach(msg => {
      console.log(`  ${msg.sender.username}: ${msg.content}`);
      console.log(`    时间: ${msg.createdAt}`);
      console.log(`    已读: ${msg.isRead ? '是' : '否'}`);
      console.log(`    已读时间: ${msg.readAt || '未读'}`);
      console.log('');
    });

    // 3. 检查每个用户的lastReadAt状态
    console.log('=== 检查用户的lastReadAt状态 ===');

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
        console.log(`${username} 的状态:`);
        console.log(`  最后阅读时间: ${chatMember.lastReadAt || '从未阅读'}`);
        console.log(`  加入时间: ${chatMember.createdAt}`);

        // 计算未读消息
        const lastRead = chatMember.lastReadAt || new Date(0);
        const unreadCount = await prisma.message.count({
          where: {
            chatId: directChat.id,
            senderId: { not: userId },
            createdAt: { gt: lastRead },
          },
        });

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
        console.log('');
      }
    }

    // 4. 分析可能的问题
    console.log('=== 问题分析 ===');

    const latestMessage = recentMessages[0];
    if (latestMessage) {
      console.log('最新消息分析:');
      console.log(`  发送者: ${latestMessage.sender.username}`);
      console.log(`  内容: ${latestMessage.content}`);
      console.log(`  消息时间: ${latestMessage.createdAt}`);
      console.log(`  消息已读状态: ${latestMessage.isRead ? '已读' : '未读'}`);

      // 检查发送者的lastReadAt
      const senderId = latestMessage.senderId;
      const senderMember = await prisma.chatMember.findUnique({
        where: {
          chatId_userId: {
            chatId: directChat.id,
            userId: senderId,
          },
        },
      });

      if (senderMember) {
        const senderLastRead = senderMember.lastReadAt;
        const messageTime = new Date(latestMessage.createdAt);

        console.log('\n发送者状态检查:');
        console.log(`  发送者最后阅读时间: ${senderLastRead || '从未阅读'}`);
        console.log(`  消息发送时间: ${messageTime}`);

        if (senderLastRead && messageTime <= senderLastRead) {
          console.log('🚨 问题发现: 发送者的lastReadAt时间 >= 消息时间');
          console.log('   这意味着发送者发送消息后，lastReadAt被自动更新了！');
        } else {
          console.log('✅ 发送者的lastReadAt时间正常');
        }
      }

      // 检查接收者的lastReadAt
      const receiverId = senderId === user001Id ? user002Id : user001Id;
      const receiverMember = await prisma.chatMember.findUnique({
        where: {
          chatId_userId: {
            chatId: directChat.id,
            userId: receiverId,
          },
        },
      });

      if (receiverMember) {
        const receiverLastRead = receiverMember.lastReadAt;
        const messageTime = new Date(latestMessage.createdAt);

        console.log('\n接收者状态检查:');
        console.log(`  接收者最后阅读时间: ${receiverLastRead || '从未阅读'}`);
        console.log(`  消息发送时间: ${messageTime}`);

        if (receiverLastRead && messageTime <= receiverLastRead) {
          console.log('🚨 问题发现: 接收者的lastReadAt时间 >= 消息时间');
          console.log(
            '   这意味着接收者在消息发送后，lastReadAt被意外更新了！'
          );
          console.log('   可能的原因:');
          console.log('   1. 同一网页切换账户时状态污染');
          console.log('   2. WebSocket事件处理错误');
          console.log('   3. 前端自动标记已读逻辑');
        } else {
          console.log('✅ 接收者的lastReadAt时间正常，消息应该显示为未读');
        }
      }
    }

    // 5. 检查发送消息的API调用
    console.log('\n=== 检查发送消息API逻辑 ===');
    console.log('需要检查的关键点:');
    console.log('1. 发送消息时是否调用了markRead()');
    console.log('2. WebSocket推送时是否触发了自动标记已读');
    console.log('3. 前端状态管理是否正确处理发送者和接收者');
    console.log('4. 同一网页切换账户时是否正确清理状态');

    // 6. 检查账户切换时的状态隔离
    console.log('\n=== 账户切换状态隔离检查 ===');
    console.log('当前的状态隔离机制:');
    console.log('1. auth-store 的 logout() 会调用所有 store 的 reset() 方法');
    console.log(
      '2. chat-store 的 reset() 会清空 chats, messages, currentChatId'
    );
    console.log('3. 但是可能存在时序问题或WebSocket事件污染');

    console.log('\n需要验证的场景:');
    console.log('1. 001登录 → 发送消息 → 退出登录 → 002登录');
    console.log('2. 检查002登录后是否能看到正确的未读消息');
    console.log('3. 检查001的操作是否影响了002的状态');
  } catch (error) {
    console.error('调试过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
