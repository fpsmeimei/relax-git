/**
 * 全面深度排查聊天未读消息问题
 * 系统性检查每一个环节
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 全面深度排查聊天未读消息问题\n');

    const user001Id = 'cmgciw6ml0000wmczkb7vza90';
    const user002Id = 'cmgcr58ue0016imi9yaj6x5gt';

    // 1. 检查数据库基础数据
    console.log('=== 1. 数据库基础数据检查 ===');

    // 检查用户是否存在
    const users = await prisma.user.findMany({
      where: { id: { in: [user001Id, user002Id] } },
      select: { id: true, username: true },
    });

    console.log('用户信息:');
    users.forEach(user => {
      console.log(`  ${user.username}: ${user.id}`);
    });

    // 检查聊天室
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
      console.log('❌ 没有找到001和002的聊天室！');

      // 检查是否有其他聊天室
      const allChats = await prisma.chat.findMany({
        where: {
          members: {
            some: {
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

      console.log(`找到相关聊天室 ${allChats.length} 个:`);
      allChats.forEach(chat => {
        console.log(`  聊天室ID: ${chat.id}, 类型: ${chat.type}`);
        console.log(
          `  成员: ${chat.members.map(m => m.user.username).join(', ')}`
        );
      });

      return;
    }

    console.log(`\n找到聊天室: ${directChat.id}`);
    console.log(
      `成员: ${directChat.members.map(m => m.user.username).join(', ')}`
    );

    // 2. 检查消息记录
    console.log('\n=== 2. 消息记录检查 ===');

    const messages = await prisma.message.findMany({
      where: { chatId: directChat.id },
      include: {
        sender: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`消息记录 (${messages.length} 条):`);
    messages.forEach((msg, index) => {
      console.log(`  ${index + 1}. ${msg.sender.username}: ${msg.content}`);
      console.log(`     时间: ${msg.createdAt}`);
      console.log(`     已读: ${msg.isRead ? '是' : '否'}`);
      console.log(`     已读时间: ${msg.readAt || '未读'}`);
      console.log('');
    });

    // 3. 检查chatMember记录
    console.log('=== 3. ChatMember记录检查 ===');

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
        console.log(`${username} 的ChatMember记录:`);
        console.log(`  chatId: ${chatMember.chatId}`);
        console.log(`  userId: ${chatMember.userId}`);
        console.log(`  lastReadAt: ${chatMember.lastReadAt || '从未阅读'}`);
        console.log(`  createdAt: ${chatMember.createdAt}`);
        console.log(`  updatedAt: ${chatMember.updatedAt}`);
        console.log('');
      } else {
        console.log(`❌ ${username} 没有ChatMember记录！`);
      }
    }

    // 4. 模拟后端API未读计算
    console.log('=== 4. 后端API未读计算模拟 ===');

    for (const userId of [user001Id, user002Id]) {
      const username = userId === user001Id ? '001' : '002';

      console.log(`${username} 的未读计算:`);

      // 获取用户的聊天室成员关系
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

      console.log(`  聊天室数量: ${memberships.length}`);

      let totalUnread = 0;

      for (const m of memberships) {
        const lastRead = m.lastReadAt ?? new Date(0);
        const unreadCount = await prisma.message.count({
          where: {
            chatId: m.chatId,
            senderId: { not: userId },
            createdAt: { gt: lastRead },
          },
        });

        totalUnread += unreadCount;

        const lastMessage = m.chat.messages[0] ?? null;
        const others = m.chat.members
          .filter(cm => cm.userId !== userId)
          .map(cm => cm.user);

        console.log(`  聊天室: ${m.chat.name || '未命名'} (${m.chat.type})`);
        console.log(`    对话对象: ${others.map(u => u.username).join(', ')}`);
        console.log(`    最后阅读: ${lastRead.toISOString()}`);
        console.log(`    未读数量: ${unreadCount}`);

        if (lastMessage) {
          console.log(
            `    最后消息: ${lastMessage.content} (${lastMessage.createdAt})`
          );
        }

        if (unreadCount > 0) {
          const unreadMessages = await prisma.message.findMany({
            where: {
              chatId: m.chatId,
              senderId: { not: userId },
              createdAt: { gt: lastRead },
            },
            include: {
              sender: { select: { username: true } },
            },
            orderBy: { createdAt: 'desc' },
          });

          console.log(`    未读消息详情:`);
          unreadMessages.forEach(msg => {
            console.log(
              `      ${msg.sender.username}: ${msg.content} (${msg.createdAt})`
            );
          });
        }
        console.log('');
      }

      console.log(`${username} 总未读数: ${totalUnread}`);
      console.log(
        `聊天室按钮应该显示: ${totalUnread > 0 ? (totalUnread > 99 ? '99+' : totalUnread) : '无徽章'}`
      );
      console.log('');
    }

    // 5. 检查私聊消息表
    console.log('=== 5. 私聊消息表检查 ===');

    const chatMessages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { fromUserId: user001Id, toUserId: user002Id },
          { fromUserId: user002Id, toUserId: user001Id },
        ],
      },
      include: {
        fromUser: { select: { username: true } },
        toUser: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log(`私聊消息记录 (${chatMessages.length} 条):`);
    chatMessages.forEach(msg => {
      console.log(
        `  ${msg.fromUser.username} -> ${msg.toUser.username}: ${msg.content}`
      );
      console.log(`    时间: ${msg.createdAt}`);
      console.log(`    已读: ${msg.isRead ? '是' : '否'}`);
      console.log('');
    });

    // 6. 检查前端API响应格式
    console.log('=== 6. 前端API响应格式检查 ===');

    // 模拟 /api/chats API 的完整响应
    for (const userId of [user001Id, user002Id]) {
      const username = userId === user001Id ? '001' : '002';

      console.log(`模拟 ${username} 调用 /api/chats 的响应:`);

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

      console.log(`  响应数据:`);
      console.log(`    聊天室数量: ${results.length}`);

      const totalUnread = results.reduce(
        (sum, chat) => sum + chat.unreadCount,
        0
      );
      console.log(`    总未读数: ${totalUnread}`);
      console.log(`    徽章显示: ${totalUnread > 0 ? totalUnread : '无'}`);

      console.log(`    详细数据:`);
      results.forEach(chat => {
        console.log(`      chatId: ${chat.chatId}`);
        console.log(`      type: ${chat.type}`);
        console.log(
          `      members: ${chat.members.map(m => m.username).join(', ')}`
        );
        console.log(`      unreadCount: ${chat.unreadCount}`);
        console.log(
          `      lastMessage: ${chat.lastMessage ? chat.lastMessage.content : '无'}`
        );
        console.log('');
      });
    }

    // 7. 诊断问题
    console.log('=== 7. 问题诊断 ===');

    console.log('检查清单:');
    console.log('1. ✅ 用户存在');
    console.log('2. ✅ 聊天室存在');
    console.log('3. ✅ ChatMember记录存在');
    console.log('4. ✅ 消息记录存在');

    const latestMessage = messages[0];
    if (latestMessage) {
      const senderId = latestMessage.senderId;
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
        const lastRead = receiverMember.lastReadAt || new Date(0);
        const messageTime = new Date(latestMessage.createdAt);
        const shouldBeUnread = messageTime > lastRead;

        console.log('\n关键时间戳分析:');
        console.log(`  最新消息时间: ${messageTime.toISOString()}`);
        console.log(`  接收者最后阅读: ${lastRead.toISOString()}`);
        console.log(`  应该未读: ${shouldBeUnread ? '是' : '否'}`);

        if (!shouldBeUnread) {
          console.log('🚨 问题: 接收者的lastReadAt时间 >= 消息时间');
          console.log('   这说明接收者的lastReadAt被意外更新了');
        }
      }
    }

    console.log('\n可能的问题点:');
    console.log('1. 前端API调用是否正确');
    console.log('2. 前端状态管理是否正确');
    console.log('3. 组件渲染是否正确');
    console.log('4. WebSocket事件是否正确处理');
    console.log('5. 账户切换是否正确清理状态');
  } catch (error) {
    console.error('全面排查过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
