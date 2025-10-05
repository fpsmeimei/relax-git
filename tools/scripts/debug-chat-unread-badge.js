/**
 * 调试聊天室未读消息徽章问题
 * 专门检查首页导航栏"聊天室"按钮的未读数字显示
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 调试聊天室未读消息徽章问题\n');

    // 1. 检查用户的聊天室成员关系
    console.log('=== 检查用户聊天室成员关系 ===');
    for (const userId of [
      'cmgciw6ml0000wmczkb7vza90',
      'cmgcr58ue0016imi9yaj6x5gt',
    ]) {
      const username = userId === 'cmgciw6ml0000wmczkb7vza90' ? '001' : '002';

      const chatMembers = await prisma.chatMember.findMany({
        where: { userId: userId },
        include: {
          chat: {
            select: {
              id: true,
              name: true,
              type: true,
              _count: {
                select: { messages: true },
              },
            },
          },
        },
      });

      console.log(`${username} 参与的聊天室 (${chatMembers.length} 个):`);
      for (const member of chatMembers) {
        console.log(
          `  聊天室: ${member.chat.name || '未命名'} (${member.chat.type})`
        );
        console.log(`    聊天室ID: ${member.chat.id}`);
        console.log(`    总消息数: ${member.chat._count.messages}`);
        console.log(`    最后阅读时间: ${member.lastReadAt || '从未阅读'}`);
        console.log(`    加入时间: ${member.createdAt}`);

        // 计算这个聊天室的未读消息
        const lastReadAt = member.lastReadAt || new Date(0);
        const unreadInThisChat = await prisma.message.count({
          where: {
            chatId: member.chat.id,
            senderId: { not: userId }, // 不包括自己发送的消息
            createdAt: { gt: lastReadAt },
          },
        });

        console.log(`    未读消息数: ${unreadInThisChat}`);

        if (unreadInThisChat > 0) {
          // 显示具体的未读消息
          const unreadMessages = await prisma.message.findMany({
            where: {
              chatId: member.chat.id,
              senderId: { not: userId },
              createdAt: { gt: lastReadAt },
            },
            include: {
              sender: { select: { username: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 3,
          });

          console.log(`    未读消息详情:`);
          unreadMessages.forEach(msg => {
            console.log(
              `      ${msg.sender.username}: ${msg.content.substring(0, 30)}... (${msg.createdAt})`
            );
          });
        }
        console.log('');
      }
    }

    // 2. 检查私聊消息（如果有的话）
    console.log('=== 检查私聊消息 ===');
    const privateChatCount = await prisma.chatMessage.count();
    console.log(`私聊消息总数: ${privateChatCount}`);

    if (privateChatCount > 0) {
      for (const userId of [
        'cmgciw6ml0000wmczkb7vza90',
        'cmgcr58ue0016imi9yaj6x5gt',
      ]) {
        const username = userId === 'cmgciw6ml0000wmczkb7vza90' ? '001' : '002';

        const unreadPrivateCount = await prisma.chatMessage.count({
          where: {
            toUserId: userId,
            isRead: false,
          },
        });

        console.log(`${username} 的未读私聊: ${unreadPrivateCount} 条`);

        if (unreadPrivateCount > 0) {
          const unreadPrivateMessages = await prisma.chatMessage.findMany({
            where: {
              toUserId: userId,
              isRead: false,
            },
            include: {
              fromUser: { select: { username: true } },
            },
            orderBy: { createdAt: 'desc' },
          });

          console.log(`  详情:`);
          unreadPrivateMessages.forEach(msg => {
            console.log(
              `    来自 ${msg.fromUser.username}: ${msg.content.substring(0, 30)}... (${msg.createdAt})`
            );
          });
        }
      }
    }

    // 3. 模拟前端计算未读总数的逻辑
    console.log('\n=== 模拟前端未读徽章计算逻辑 ===');
    for (const userId of [
      'cmgciw6ml0000wmczkb7vza90',
      'cmgcr58ue0016imi9yaj6x5gt',
    ]) {
      const username = userId === 'cmgciw6ml0000wmczkb7vza90' ? '001' : '002';

      // 计算群聊未读数
      const chatMembers = await prisma.chatMember.findMany({
        where: { userId: userId },
        include: {
          chat: { select: { id: true } },
        },
      });

      let totalGroupUnread = 0;
      for (const member of chatMembers) {
        const lastReadAt = member.lastReadAt || new Date(0);
        const unreadInThisChat = await prisma.message.count({
          where: {
            chatId: member.chat.id,
            senderId: { not: userId },
            createdAt: { gt: lastReadAt },
          },
        });
        totalGroupUnread += unreadInThisChat;
      }

      // 计算私聊未读数
      const totalPrivateUnread = await prisma.chatMessage.count({
        where: {
          toUserId: userId,
          isRead: false,
        },
      });

      const totalUnread = totalGroupUnread + totalPrivateUnread;
      const badgeNumber = Math.min(totalUnread, 99); // 上限99

      console.log(`${username} 的聊天室徽章应该显示:`);
      console.log(`  群聊未读: ${totalGroupUnread}`);
      console.log(`  私聊未读: ${totalPrivateUnread}`);
      console.log(`  总未读: ${totalUnread}`);
      console.log(`  徽章数字: ${badgeNumber > 0 ? badgeNumber : '无徽章'}`);
      console.log('');
    }

    // 4. 检查可能的问题
    console.log('=== 问题诊断 ===');

    // 检查是否有lastReadAt为null的情况
    const membersWithoutLastRead = await prisma.chatMember.count({
      where: { lastReadAt: null },
    });

    console.log(`没有lastReadAt记录的聊天成员: ${membersWithoutLastRead} 个`);

    if (membersWithoutLastRead > 0) {
      console.log('⚠️  这可能导致未读消息计算错误');
    }

    // 检查消息的isRead字段
    const messagesWithIsReadFalse = await prisma.message.count({
      where: { isRead: false },
    });

    console.log(`isRead=false的群聊消息: ${messagesWithIsReadFalse} 条`);

    if (messagesWithIsReadFalse > 0) {
      console.log('💡 注意: message表的isRead字段可能不是用来计算未读数的');
      console.log(
        '   实际计算可能基于chatMember.lastReadAt和message.createdAt的比较'
      );
    }

    // 5. 给出诊断结果
    console.log('\n=== 诊断结果 ===');

    const hasUnreadMessages =
      (await prisma.message.count({
        where: {
          createdAt: {
            gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 最近7天
          },
        },
      })) > 0;

    if (hasUnreadMessages) {
      console.log('🔍 可能的问题原因:');
      console.log('  1. 前端没有正确查询聊天未读数量API');
      console.log('  2. chatMember.lastReadAt 字段没有正确更新');
      console.log('  3. 前端计算未读数的逻辑与后端不一致');
      console.log('  4. WebSocket推送聊天消息时没有更新未读计数');
      console.log('  5. 聊天室徽章组件没有正确获取或显示未读数');

      console.log('\n🔧 建议检查:');
      console.log('  1. 前端聊天室徽章组件的数据获取逻辑');
      console.log('  2. 聊天消息发送时是否更新了接收者的lastReadAt');
      console.log('  3. 用户打开聊天室时是否更新了lastReadAt');
      console.log('  4. WebSocket推送聊天消息时的未读计数更新');
    } else {
      console.log('✅ 当前没有最近的聊天消息，徽章显示正常');
    }
  } catch (error) {
    console.error('调试过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
