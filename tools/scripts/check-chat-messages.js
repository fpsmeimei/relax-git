const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

const prisma = new PrismaClient();

async function checkChatMessages() {
  try {
    console.log('=== 检查聊天消息数据 ===\n');

    // 检查 Message 表
    const messages = await prisma.message.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: { id: true, username: true },
        },
      },
    });

    console.log(`Message 表记录数: ${messages.length}`);
    if (messages.length > 0) {
      console.log('\n最近的消息:');
      messages.forEach(msg => {
        console.log(
          `- [${msg.createdAt.toISOString()}] ${msg.sender.username}: ${msg.content.substring(0, 50)}...`
        );
        console.log(`  chatId: ${msg.chatId}, isRead: ${msg.isRead}`);
      });
    }

    // 检查 ChatMessage 表
    const chatMessages = await prisma.chatMessage.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        fromUser: {
          select: { id: true, username: true },
        },
        toUser: {
          select: { id: true, username: true },
        },
      },
    });

    console.log(`\nChatMessage 表记录数: ${chatMessages.length}`);
    if (chatMessages.length > 0) {
      console.log('\n最近的私聊消息:');
      chatMessages.forEach(msg => {
        console.log(
          `- [${msg.createdAt.toISOString()}] ${msg.fromUser.username} -> ${msg.toUser.username}: ${msg.content.substring(0, 50)}...`
        );
        console.log(`  isRead: ${msg.isRead}`);
      });
    }

    // 检查 Chat 表
    const chats = await prisma.chat.findMany({
      take: 5,
      include: {
        members: {
          include: {
            user: {
              select: { username: true },
            },
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    console.log(`\nChat 表记录数: ${chats.length}`);
    chats.forEach(chat => {
      const memberNames = chat.members.map(m => m.user.username).join(', ');
      console.log(`- Chat ${chat.id} (${chat.type}): ${memberNames}`);
      console.log(`  消息数: ${chat._count.messages}`);
    });
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkChatMessages();
