const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

const prisma = new PrismaClient();

/**
 * 为指定用户设置机器人好友和欢迎消息
 * @param {string} userId - 用户ID
 * @param {string} botId - 机器人ID
 */
async function setupBotForUser(userId, botId) {
  try {
    console.log(`=== 为用户设置机器人好友 ===`);
    console.log(`用户ID: ${userId}`);
    console.log(`机器人ID: ${botId}\n`);

    // 1. 创建双向好友关系
    await prisma.friendship.createMany({
      data: [
        { userId: userId, friendId: botId },
        { userId: botId, friendId: userId },
      ],
      skipDuplicates: true,
    });
    console.log('✅ 好友关系创建成功');

    // 2. 创建 Chat 对象
    const [x, y] = [userId, botId].sort();
    const directKey = `${x}:${y}`;

    let chat = await prisma.chat.findUnique({
      where: { directKey },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          type: 'DIRECT',
          directKey,
          members: {
            createMany: {
              data: [
                { userId: userId, role: 'MEMBER' },
                { userId: botId, role: 'MEMBER' },
              ],
            },
          },
        },
      });
      console.log(`✅ Chat 创建成功: ${chat.id}`);
    } else {
      console.log(`✅ Chat 已存在: ${chat.id}`);
    }

    // 3. 发送欢迎消息
    const welcomeMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: botId,
        content:
          '你好，我是 Relax-Git 助手机器人。\n可以点击下面的输入框和我打个招呼，体验一下聊天的流程吧！',
        type: 'TEXT',
        isRead: false,
      },
    });
    console.log(`✅ 欢迎消息发送成功: ${welcomeMessage.id}`);

    // 4. 更新 Chat 的 updatedAt
    await prisma.chat.update({
      where: { id: chat.id },
      data: { updatedAt: new Date() },
    });

    console.log('\n✨ 设置完成！');
    return { chat, welcomeMessage };
  } catch (error) {
    console.error('❌ 设置失败:', error);
    throw error;
  }
}

/**
 * 为所有现有用户设置机器人
 */
async function setupBotForAllUsers() {
  try {
    // 获取机器人
    const bot = await prisma.user.findUnique({
      where: { username: 'relax-git-bot' },
    });

    if (!bot) {
      console.error('❌ 机器人用户不存在，请先运行 create-bot-user.js');
      process.exit(1);
    }

    // 获取所有非机器人用户
    const users = await prisma.user.findMany({
      where: {
        id: { not: bot.id },
        isActive: true,
      },
      select: { id: true, username: true },
    });

    console.log(`找到 ${users.length} 个用户\n`);

    for (const user of users) {
      console.log(`处理用户: ${user.username}`);
      await setupBotForUser(user.id, bot.id);
      console.log('');
    }

    console.log('✨ 所有用户设置完成！');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  setupBotForAllUsers();
}

module.exports = { setupBotForUser, setupBotForAllUsers };
