/**
 * 调试当前聊天未读消息问题
 * 001给002发了私信，但002看不到未读提示
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 调试当前聊天未读消息问题\n');

    // 1. 检查最新的聊天消息
    console.log('=== 检查最新聊天消息 ===');

    // 检查群聊消息
    const recentGroupMessages = await prisma.message.findMany({
      include: {
        sender: { select: { username: true } },
        chat: { select: { name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`最近群聊消息 (${recentGroupMessages.length} 条):`);
    recentGroupMessages.forEach(msg => {
      console.log(
        `  ${msg.sender.username} 在 ${msg.chat.name || '未命名'} (${msg.chat.type})`
      );
      console.log(`    内容: ${msg.content}`);
      console.log(`    时间: ${msg.createdAt}`);
      console.log(`    已读: ${msg.isRead ? '是' : '否'}`);
      console.log(`    已读时间: ${msg.readAt || '未读'}`);
      console.log('');
    });

    // 检查私聊消息
    const recentPrivateMessages = await prisma.chatMessage.findMany({
      include: {
        fromUser: { select: { username: true } },
        toUser: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`最近私聊消息 (${recentPrivateMessages.length} 条):`);
    recentPrivateMessages.forEach(msg => {
      console.log(`  ${msg.fromUser.username} -> ${msg.toUser.username}`);
      console.log(`    内容: ${msg.content}`);
      console.log(`    时间: ${msg.createdAt}`);
      console.log(`    已读: ${msg.isRead ? '是' : '否'}`);
      console.log(`    已读时间: ${msg.readAt || '未读'}`);
      console.log('');
    });

    // 2. 检查002用户的聊天室成员关系和未读计算
    console.log('=== 检查002用户的聊天未读计算 ===');
    const user002Id = 'cmgcr58ue0016imi9yaj6x5gt';

    // 检查002的聊天室成员关系
    const chatMembers = await prisma.chatMember.findMany({
      where: { userId: user002Id },
      include: {
        chat: {
          select: {
            id: true,
            name: true,
            type: true,
            directKey: true,
          },
        },
      },
    });

    console.log(`002的聊天室成员关系 (${chatMembers.length} 个):`);
    for (const member of chatMembers) {
      console.log(
        `  聊天室: ${member.chat.name || '未命名'} (${member.chat.type})`
      );
      console.log(`    聊天室ID: ${member.chat.id}`);
      console.log(`    DirectKey: ${member.chat.directKey || '无'}`);
      console.log(`    最后阅读时间: ${member.lastReadAt || '从未阅读'}`);
      console.log(`    加入时间: ${member.createdAt}`);

      // 计算这个聊天室的未读消息
      const lastRead = member.lastReadAt || new Date(0);
      const unreadCount = await prisma.message.count({
        where: {
          chatId: member.chat.id,
          senderId: { not: user002Id },
          createdAt: { gt: lastRead },
        },
      });

      console.log(`    未读消息数: ${unreadCount}`);

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

    // 3. 检查002收到的私聊消息
    console.log('=== 检查002收到的私聊消息 ===');
    const privateMessagesTo002 = await prisma.chatMessage.findMany({
      where: { toUserId: user002Id },
      include: {
        fromUser: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`002收到的私聊消息 (${privateMessagesTo002.length} 条):`);
    privateMessagesTo002.forEach(msg => {
      console.log(`  来自 ${msg.fromUser.username}: ${msg.content}`);
      console.log(`    时间: ${msg.createdAt}`);
      console.log(`    已读: ${msg.isRead ? '是' : '否'}`);
      console.log(`    已读时间: ${msg.readAt || '未读'}`);
    });

    const unreadPrivateCount = privateMessagesTo002.filter(
      msg => !msg.isRead
    ).length;
    console.log(`\n002的未读私聊消息: ${unreadPrivateCount} 条`);

    // 4. 模拟前端API调用
    console.log('\n=== 模拟前端API调用 ===');

    // 模拟 /api/chats 调用
    const memberships = await prisma.chatMember.findMany({
      where: { userId: user002Id },
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
            senderId: { not: user002Id },
            createdAt: { gt: lastRead },
          },
        });
        const lastMessage = m.chat.messages[0] ?? null;
        const others = m.chat.members
          .filter(cm => cm.userId !== user002Id)
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

    const totalGroupUnread = results.reduce(
      (sum, chat) => sum + chat.unreadCount,
      0
    );

    console.log('前端API响应模拟:');
    console.log(`  聊天室数量: ${results.length}`);
    console.log(`  群聊未读总数: ${totalGroupUnread}`);
    console.log(`  私聊未读总数: ${unreadPrivateCount}`);
    console.log(`  总未读数: ${totalGroupUnread + unreadPrivateCount}`);
    console.log(
      `  聊天室按钮徽章应该显示: ${totalGroupUnread + unreadPrivateCount > 0 ? totalGroupUnread + unreadPrivateCount : '无徽章'}`
    );

    console.log('\n  聊天室详情:');
    results.forEach(chat => {
      console.log(
        `    - ${chat.name || '未命名'} (${chat.type}): ${chat.unreadCount} 条未读`
      );
      if (chat.members.length > 0) {
        console.log(
          `      成员: ${chat.members.map(m => m.username).join(', ')}`
        );
      }
      if (chat.lastMessage) {
        console.log(
          `      最后消息: ${chat.lastMessage.content} (${chat.lastMessage.createdAt})`
        );
      }
    });

    // 5. 诊断问题
    console.log('\n=== 问题诊断 ===');

    const hasRecentMessages =
      recentGroupMessages.length > 0 || recentPrivateMessages.length > 0;
    const shouldShowBadge = totalGroupUnread + unreadPrivateCount > 0;

    if (hasRecentMessages && !shouldShowBadge) {
      console.log('🚨 发现问题:');
      console.log('  1. 系统中有最近的聊天消息');
      console.log('  2. 但是未读计算结果为0');
      console.log('  3. 聊天室按钮不会显示徽章');

      console.log('\n💡 可能的原因:');
      console.log('  1. lastReadAt 时间戳比消息时间戳更新');
      console.log('  2. 私聊消息的 isRead 字段被错误设置为 true');
      console.log('  3. 前端没有正确处理私聊未读数量');
      console.log('  4. WebSocket 推送消息时没有正确更新未读状态');

      // 检查具体的时间戳问题
      if (recentGroupMessages.length > 0) {
        const latestMessage = recentGroupMessages[0];
        const correspondingMember = chatMembers.find(
          m => m.chat.id === latestMessage.chatId
        );
        if (correspondingMember) {
          const messageTime = new Date(latestMessage.createdAt);
          const lastReadTime = correspondingMember.lastReadAt
            ? new Date(correspondingMember.lastReadAt)
            : new Date(0);

          console.log('\n  时间戳分析:');
          console.log(`    最新消息时间: ${messageTime.toISOString()}`);
          console.log(`    最后阅读时间: ${lastReadTime.toISOString()}`);
          console.log(
            `    消息是否应该未读: ${messageTime > lastReadTime ? '是' : '否'}`
          );
        }
      }
    } else if (shouldShowBadge) {
      console.log('✅ 系统状态正常:');
      console.log(`  应该显示徽章: ${totalGroupUnread + unreadPrivateCount}`);
    } else {
      console.log('ℹ️  当前没有未读消息，徽章不显示是正常的');
    }
  } catch (error) {
    console.error('调试过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
