/**
 * 基于真实表结构调试聊天通知问题
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 调试聊天通知问题 (基于真实表结构)\n');

    // 1. 检查ChatMessage表 (私聊消息)
    console.log('=== 检查私聊消息 (ChatMessage) ===');
    const chatMessages = await prisma.chatMessage.findMany({
      include: {
        fromUser: { select: { id: true, username: true } },
        toUser: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`私聊消息总数: ${chatMessages.length}`);
    chatMessages.forEach(msg => {
      console.log(`  ${msg.fromUser.username} -> ${msg.toUser.username}`);
      console.log(`    内容: ${msg.content.substring(0, 50)}...`);
      console.log(`    时间: ${msg.createdAt}`);
      console.log(`    已读: ${msg.isRead ? '是' : '否'}`);
      console.log(`    已读时间: ${msg.readAt || '未读'}`);
      console.log('');
    });

    // 2. 检查Messages表 (群聊消息)
    console.log('=== 检查群聊消息 (Messages) ===');
    const groupMessages = await prisma.message.findMany({
      include: {
        sender: { select: { id: true, username: true } },
        chat: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`群聊消息总数: ${groupMessages.length}`);
    groupMessages.forEach(msg => {
      console.log(
        `  ${msg.sender.username} 在 ${msg.chat.name || '未命名聊天室'}`
      );
      console.log(`    内容: ${msg.content.substring(0, 50)}...`);
      console.log(`    时间: ${msg.createdAt}`);
      console.log(`    已读: ${msg.isRead ? '是' : '否'}`);
      console.log('');
    });

    // 3. 检查用户的未读消息统计
    console.log('=== 检查未读消息统计 ===');
    for (const userId of [
      'cmgciw6ml0000wmczkb7vza90',
      'cmgcr58ue0016imi9yaj6x5gt',
    ]) {
      const username = userId === 'cmgciw6ml0000wmczkb7vza90' ? '001' : '002';

      // 私聊未读消息
      const unreadPrivateCount = await prisma.chatMessage.count({
        where: {
          toUserId: userId,
          isRead: false,
        },
      });

      // 群聊未读消息 (需要通过chatMember的lastReadAt来计算)
      const userChats = await prisma.chatMember.findMany({
        where: { userId: userId },
        include: {
          chat: {
            include: {
              messages: {
                where: {
                  senderId: { not: userId }, // 不包括自己发送的消息
                },
                orderBy: { createdAt: 'desc' },
              },
            },
          },
        },
      });

      let unreadGroupCount = 0;
      for (const chatMember of userChats) {
        const lastReadAt = chatMember.lastReadAt || new Date(0);
        const unreadInThisChat = chatMember.chat.messages.filter(
          msg => new Date(msg.createdAt) > lastReadAt
        ).length;
        unreadGroupCount += unreadInThisChat;
      }

      console.log(`${username} 的未读消息统计:`);
      console.log(`  私聊未读: ${unreadPrivateCount} 条`);
      console.log(`  群聊未读: ${unreadGroupCount} 条`);
      console.log(`  总未读: ${unreadPrivateCount + unreadGroupCount} 条`);

      // 显示具体的未读私聊消息
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

        console.log(`  未读私聊详情:`);
        unreadPrivateMessages.forEach(msg => {
          console.log(
            `    来自 ${msg.fromUser.username}: ${msg.content.substring(0, 30)}...`
          );
          console.log(`      时间: ${msg.createdAt}`);
        });
      }
      console.log('');
    }

    // 4. 检查好友关系 (包括relax-git-bot)
    console.log('=== 检查好友关系 ===');
    const friendships = await prisma.friendship.findMany({
      include: {
        user: { select: { username: true } },
        friend: { select: { username: true } },
      },
    });

    console.log(`好友关系总数: ${friendships.length}`);

    // 按用户分组显示好友
    const friendsByUser = {};
    friendships.forEach(f => {
      if (!friendsByUser[f.user.username]) {
        friendsByUser[f.user.username] = [];
      }
      friendsByUser[f.user.username].push(f.friend.username);
    });

    Object.keys(friendsByUser).forEach(username => {
      console.log(
        `  ${username} 的好友: ${friendsByUser[username].join(', ')}`
      );
    });

    // 5. 分析聊天通知问题
    console.log('\n=== 聊天通知问题分析 ===');

    const totalUnreadPrivate = await prisma.chatMessage.count({
      where: { isRead: false },
    });

    const totalUnreadGroup = await prisma.message.count({
      where: { isRead: false },
    });

    console.log(`系统中总未读私聊消息: ${totalUnreadPrivate} 条`);
    console.log(`系统中总未读群聊消息: ${totalUnreadGroup} 条`);

    if (totalUnreadPrivate > 0 || totalUnreadGroup > 0) {
      console.log('\n🚨 发现未读消息但首页可能没有显示通知');
      console.log('\n💡 可能的原因:');
      console.log('  1. 前端首页没有查询聊天消息的未读数量');
      console.log('  2. 聊天通知和评论通知使用不同的系统');
      console.log('  3. WebSocket推送聊天通知可能有问题');
      console.log('  4. 前端通知组件没有集成聊天未读数量');

      console.log('\n🔧 建议的解决方案:');
      console.log('  1. 检查前端首页是否查询了聊天未读消息');
      console.log('  2. 确认WebSocket是否推送聊天消息通知');
      console.log('  3. 在通知中心添加聊天消息类型的通知');
      console.log('  4. 或者在首页单独显示聊天未读数量');
    } else {
      console.log('\n✅ 当前没有未读的聊天消息');
    }
  } catch (error) {
    console.error('调试过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
