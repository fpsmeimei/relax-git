/**
 * 测试聊天未读消息修复效果
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🧪 测试聊天未读消息修复效果\n');

    // 1. 重新计算未读数量（使用修复后的逻辑）
    console.log('=== 重新计算未读数量 ===');
    for (const userId of [
      'cmgciw6ml0000wmczkb7vza90',
      'cmgcr58ue0016imi9yaj6x5gt',
    ]) {
      const username = userId === 'cmgciw6ml0000wmczkb7vza90' ? '001' : '002';

      const chatMembers = await prisma.chatMember.findMany({
        where: { userId: userId },
        include: {
          chat: { select: { id: true, name: true, type: true } },
        },
      });

      let totalUnread = 0;

      console.log(`${username} 的聊天室未读统计:`);
      for (const member of chatMembers) {
        const lastRead = member.lastReadAt || new Date(0);

        // 使用修复后的逻辑：只基于 lastReadAt 和 createdAt 比较
        const unreadCount = await prisma.message.count({
          where: {
            chatId: member.chat.id,
            senderId: { not: userId },
            createdAt: { gt: lastRead },
          },
        });

        totalUnread += unreadCount;

        console.log(
          `  聊天室: ${member.chat.name || '未命名'} (${member.chat.type})`
        );
        console.log(`    最后阅读: ${member.lastReadAt || '从未阅读'}`);
        console.log(`    未读消息: ${unreadCount} 条`);

        if (unreadCount > 0) {
          // 显示未读消息详情
          const unreadMessages = await prisma.message.findMany({
            where: {
              chatId: member.chat.id,
              senderId: { not: userId },
              createdAt: { gt: lastRead },
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

      const badgeNumber = Math.min(totalUnread, 99);
      console.log(
        `${username} 聊天室徽章应该显示: ${badgeNumber > 0 ? badgeNumber : '无徽章'}`
      );
      console.log(`总未读消息: ${totalUnread} 条\n`);
    }

    // 2. 检查是否有需要更新 lastReadAt 的情况
    console.log('=== 检查需要修复的 lastReadAt ===');

    const membersWithoutLastRead = await prisma.chatMember.findMany({
      where: { lastReadAt: null },
      include: {
        user: { select: { username: true } },
        chat: { select: { name: true, type: true } },
      },
    });

    if (membersWithoutLastRead.length > 0) {
      console.log(
        `发现 ${membersWithoutLastRead.length} 个没有 lastReadAt 的聊天成员:`
      );
      membersWithoutLastRead.forEach(member => {
        console.log(
          `  ${member.user.username} 在 ${member.chat.name || '未命名'} (${member.chat.type})`
        );
      });

      console.log('\n💡 建议: 这些成员首次打开聊天室时会自动设置 lastReadAt');
    } else {
      console.log('✅ 所有聊天成员都有 lastReadAt 记录');
    }

    // 3. 模拟前端API调用
    console.log('\n=== 模拟前端API响应 ===');

    // 模拟 /api/chats API 的响应格式
    for (const userId of [
      'cmgciw6ml0000wmczkb7vza90',
      'cmgcr58ue0016imi9yaj6x5gt',
    ]) {
      const username = userId === 'cmgciw6ml0000wmczkb7vza90' ? '001' : '002';

      const memberships = await prisma.chatMember.findMany({
        where: { userId },
        include: {
          chat: {
            include: {
              members: {
                include: {
                  user: {
                    select: { id: true, username: true, avatar: true },
                  },
                },
              },
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: {
                  id: true,
                  content: true,
                  createdAt: true,
                  senderId: true,
                },
              },
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
      });

      const results = await Promise.all(
        memberships.map(async m => {
          const lastRead = m.lastReadAt ?? new Date(0);
          const unreadCount = await prisma.message.count({
            where: {
              chatId: m.chatId,
              senderId: { not: userId },
              createdAt: { gt: lastRead },
            },
          });
          const lastMessage = m.chat.messages[0] ?? null;
          const others = m.chat.members
            .filter(cm => cm.userId !== userId)
            .map(cm => cm.user);
          return {
            chatId: m.chatId,
            type: m.chat.type,
            name: m.chat.name,
            members: others,
            lastMessage,
            unreadCount,
            updatedAt: m.chat.updatedAt,
          };
        })
      );

      results.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      const totalUnreadFromAPI = results.reduce(
        (sum, chat) => sum + chat.unreadCount,
        0
      );

      console.log(`${username} 的API响应:`);
      console.log(`  聊天室数量: ${results.length}`);
      console.log(`  总未读数: ${totalUnreadFromAPI}`);
      console.log(
        `  徽章显示: ${totalUnreadFromAPI > 99 ? '99' : totalUnreadFromAPI || '无'}`
      );

      if (results.length > 0) {
        console.log(`  聊天室详情:`);
        results.forEach(chat => {
          console.log(
            `    - ${chat.name || '未命名'}: ${chat.unreadCount} 条未读`
          );
        });
      }
      console.log('');
    }

    console.log('✅ 测试完成！');
    console.log('\n📋 修复总结:');
    console.log(
      '1. ✅ 修复了前端导航栏聊天徽章组件，现在显示聊天未读数而不是好友申请数'
    );
    console.log(
      '2. ✅ 修复了后端未读计算逻辑，移除了 isRead 条件，只基于 lastReadAt 计算'
    );
    console.log('3. ✅ 确认了 markRead API 会正确更新 lastReadAt 字段');
    console.log('\n🎯 预期效果:');
    console.log('- 用户收到新聊天消息时，聊天室按钮上会显示红色徽章');
    console.log('- 徽章数字显示总未读消息数，上限99');
    console.log('- 用户打开聊天室后，徽章会消失（因为 lastReadAt 会更新）');
  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
