/**
 * 深度对比聊天通知 vs 评论回复通知机制
 * 找出聊天通知不生效的根本原因
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 深度对比聊天通知 vs 评论回复通知机制\n');

    // 1. 对比评论回复通知的成功机制
    console.log('=== 评论回复通知机制分析 ===');

    const commentNotifications = await prisma.notification.findMany({
      where: { type: 'COMMENT_REPLY' },
      include: {
        user: { select: { username: true } },
        actor: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    console.log('✅ 评论回复通知的成功要素:');
    console.log('1. 📊 数据存储: notifications 表');
    console.log('2. 🔔 前端组件: NotificationsBell (个人中心)');
    console.log('3. 📱 状态管理: useNotificationsStore');
    console.log('4. ⚡ WebSocket: RG_NOTIFICATION_ARRIVED 事件');
    console.log('5. 🎯 触发时机: 创建回复评论时自动创建通知记录');

    if (commentNotifications.length > 0) {
      console.log('\n评论通知示例:');
      commentNotifications.forEach(notif => {
        console.log(
          `  ${notif.actor.username} -> ${notif.user.username}: ${notif.content}`
        );
        console.log(`    已读: ${notif.isRead}, 时间: ${notif.createdAt}`);
      });
    }

    // 2. 分析聊天通知的当前机制
    console.log('\n=== 聊天通知机制分析 ===');
    console.log('❓ 聊天通知的当前实现:');
    console.log('1. 📊 数据存储: messages 表 + chatMember.lastReadAt');
    console.log('2. 🔔 前端组件: NavChatLink (聊天室按钮)');
    console.log('3. 📱 状态管理: useChatStore');
    console.log('4. ⚡ WebSocket: chat:message:new 事件');
    console.log('5. 🎯 触发时机: 发送消息时推送，前端计算未读数');

    // 3. 检查当前聊天消息的实时状态
    console.log('\n=== 检查当前聊天消息实时状态 ===');

    // 检查最新的聊天消息
    const latestChatMessage = await prisma.message.findFirst({
      include: {
        sender: { select: { id: true, username: true } },
        chat: {
          select: {
            id: true,
            type: true,
            members: {
              include: {
                user: { select: { id: true, username: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (latestChatMessage) {
      console.log('最新聊天消息:');
      console.log(`  发送者: ${latestChatMessage.sender.username}`);
      console.log(`  内容: ${latestChatMessage.content}`);
      console.log(`  时间: ${latestChatMessage.createdAt}`);
      console.log(`  聊天室类型: ${latestChatMessage.chat.type}`);
      console.log(`  聊天室成员:`);
      latestChatMessage.chat.members.forEach(member => {
        console.log(`    - ${member.user.username} (${member.user.id})`);
      });

      // 检查每个成员的lastReadAt状态
      console.log('\n  成员阅读状态:');
      for (const member of latestChatMessage.chat.members) {
        const chatMember = await prisma.chatMember.findUnique({
          where: {
            chatId_userId: {
              chatId: latestChatMessage.chatId,
              userId: member.user.id,
            },
          },
        });

        if (chatMember) {
          const lastReadAt = chatMember.lastReadAt;
          const messageTime = new Date(latestChatMessage.createdAt);
          const isUnread = !lastReadAt || messageTime > lastReadAt;

          console.log(`    ${member.user.username}:`);
          console.log(`      最后阅读: ${lastReadAt || '从未阅读'}`);
          console.log(`      消息时间: ${messageTime}`);
          console.log(`      应该未读: ${isUnread ? '是' : '否'}`);
        }
      }
    }

    // 4. 检查WebSocket推送日志
    console.log('\n=== WebSocket推送机制检查 ===');
    console.log('需要检查的关键点:');
    console.log('1. 🚀 后端是否正确推送 chat:message:new 事件');
    console.log('2. 📡 前端是否正确接收并处理事件');
    console.log('3. 🔄 前端状态是否正确更新');
    console.log('4. 🎯 未读计算逻辑是否正确');

    // 5. 模拟完整的聊天通知流程
    console.log('\n=== 模拟聊天通知流程 ===');

    const user002Id = 'cmgcr58ue0016imi9yaj6x5gt';
    const user001Id = 'cmgciw6ml0000wmczkb7vza90';

    // 模拟001发送消息给002的场景
    console.log('模拟场景: 001发送消息给002');

    // 查找001和002的聊天室
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

    if (directChat) {
      console.log(`\n找到聊天室: ${directChat.id}`);
      console.log(
        '成员:',
        directChat.members.map(m => m.user.username).join(', ')
      );

      // 检查002的lastReadAt
      const user002Member = await prisma.chatMember.findUnique({
        where: {
          chatId_userId: {
            chatId: directChat.id,
            userId: user002Id,
          },
        },
      });

      if (user002Member) {
        console.log(`\n002的当前状态:`);
        console.log(
          `  最后阅读时间: ${user002Member.lastReadAt || '从未阅读'}`
        );

        // 计算002的未读消息
        const lastRead = user002Member.lastReadAt || new Date(0);
        const unreadCount = await prisma.message.count({
          where: {
            chatId: directChat.id,
            senderId: { not: user002Id },
            createdAt: { gt: lastRead },
          },
        });

        console.log(`  当前未读消息: ${unreadCount} 条`);

        if (unreadCount > 0) {
          const unreadMessages = await prisma.message.findMany({
            where: {
              chatId: directChat.id,
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
      }
    }

    // 6. 问题诊断
    console.log('\n=== 问题诊断 ===');

    console.log('🔍 可能的问题点:');
    console.log('1. ❌ WebSocket事件名称不匹配');
    console.log('2. ❌ 前端事件监听器未正确注册');
    console.log('3. ❌ 状态更新逻辑有bug');
    console.log('4. ❌ 组件重新渲染问题');
    console.log('5. ❌ 数据计算时机问题');

    console.log('\n🎯 对比评论通知的差异:');
    console.log('评论通知: 直接存储在notifications表，前端直接显示');
    console.log('聊天通知: 需要实时计算未读数，依赖lastReadAt字段');
    console.log('');
    console.log('💡 关键差异:');
    console.log('- 评论通知是"推送型"（直接推送通知记录）');
    console.log('- 聊天通知是"计算型"（需要实时计算未读数）');

    console.log('\n🚨 需要重点检查:');
    console.log('1. 前端接收到chat:message:new事件后的处理逻辑');
    console.log('2. useChatStore的updateOnNewMessage方法');
    console.log('3. NavChatLink组件的未读数计算');
    console.log('4. 聊天室页面的好友列表未读显示');
  } catch (error) {
    console.error('深度排查过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
