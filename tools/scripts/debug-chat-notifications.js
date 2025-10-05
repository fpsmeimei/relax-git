/**
 * 调试聊天通知问题
 * 检查私信未读消息通知为什么没有显示在首页
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 调试聊天通知问题\n');

    // 1. 检查聊天消息表结构和数据
    console.log('=== 检查聊天消息 ===');
    const chatMessages = await prisma.chatMessage.findMany({
      include: {
        sender: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`聊天消息总数: ${chatMessages.length}`);
    chatMessages.forEach(msg => {
      console.log(`  ${msg.sender.username} -> ${msg.receiver.username}`);
      console.log(`    内容: ${msg.content.substring(0, 50)}...`);
      console.log(`    时间: ${msg.createdAt}`);
      console.log(`    已读时间: ${msg.readAt || '未读'}`);
      console.log('');
    });

    // 2. 检查未读消息统计
    console.log('=== 检查未读消息统计 ===');
    for (const userId of [
      'cmgciw6ml0000wmczkb7vza90',
      'cmgcr58ue0016imi9yaj6x5gt',
    ]) {
      const username = userId === 'cmgciw6ml0000wmczkb7vza90' ? '001' : '002';

      const unreadCount = await prisma.chatMessage.count({
        where: {
          receiverId: userId,
          readAt: null,
        },
      });

      const totalReceived = await prisma.chatMessage.count({
        where: {
          receiverId: userId,
        },
      });

      console.log(`${username} 的消息统计:`);
      console.log(`  收到消息总数: ${totalReceived}`);
      console.log(`  未读消息数: ${unreadCount}`);

      if (unreadCount > 0) {
        const unreadMessages = await prisma.chatMessage.findMany({
          where: {
            receiverId: userId,
            readAt: null,
          },
          include: {
            sender: { select: { username: true } },
          },
          orderBy: { createdAt: 'desc' },
        });

        console.log(`  未读消息详情:`);
        unreadMessages.forEach(msg => {
          console.log(
            `    来自 ${msg.sender.username}: ${msg.content.substring(0, 30)}...`
          );
        });
      }
      console.log('');
    }

    // 3. 检查前端通知相关的表
    console.log('=== 检查通知系统是否包含聊天通知 ===');

    // 检查是否有专门的聊天通知类型
    const chatNotifications = await prisma.notification.findMany({
      where: {
        type: { in: ['CHAT_MESSAGE', 'PRIVATE_MESSAGE'] },
      },
    });

    console.log(`聊天相关通知数: ${chatNotifications.length}`);

    if (chatNotifications.length === 0) {
      console.log('❌ 没有发现聊天相关的通知记录');
      console.log('   这可能是问题所在：私信没有创建通知记录');
    }

    // 4. 检查是否有其他未读消息统计表
    console.log('\n=== 检查其他可能的未读统计表 ===');

    try {
      // 尝试查找可能的未读统计表
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%unread%' 
        OR table_name LIKE '%message%'
        OR table_name LIKE '%chat%'
      `;

      console.log('数据库中相关的表:');
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    } catch (error) {
      console.log('无法查询数据库表结构');
    }

    // 5. 检查前端可能使用的未读消息API
    console.log('\n=== 分析可能的问题原因 ===');

    const hasUnreadMessages = chatMessages.some(msg => !msg.readAt);

    if (hasUnreadMessages) {
      console.log('🔍 发现的问题:');
      console.log('  1. 数据库中确实有未读的聊天消息');
      console.log('  2. 但是通知系统中没有对应的聊天通知记录');
      console.log('  3. 这说明聊天消息和通知系统是分离的');
      console.log('');
      console.log('💡 可能的解决方案:');
      console.log('  1. 前端需要单独查询聊天消息的未读数量');
      console.log('  2. 或者在发送聊天消息时同时创建通知记录');
      console.log('  3. 或者前端首页需要集成聊天未读消息的显示');
    } else {
      console.log('✅ 当前没有未读的聊天消息');
    }
  } catch (error) {
    console.error('调试过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
