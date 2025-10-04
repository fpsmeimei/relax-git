const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');
const bcrypt = require('../../apps/api/node_modules/bcrypt');

const prisma = new PrismaClient();

/**
 * 创建 Relax-Git 机器人用户
 * 用于聊天室欢迎消息和系统通知
 */
async function createBotUser() {
  try {
    console.log('=== 创建 Relax-Git 机器人用户 ===\n');

    // 检查机器人是否已存在
    const existingBot = await prisma.user.findUnique({
      where: { username: 'relax-git-bot' },
    });

    if (existingBot) {
      console.log('✅ 机器人用户已存在');
      console.log(`   ID: ${existingBot.id}`);
      console.log(`   Username: ${existingBot.username}`);
      console.log(`   UID: ${existingBot.uid}`);
      return existingBot;
    }

    // 创建机器人用户
    const hashedPassword = await bcrypt.hash(
      'relax-git-bot-secure-password',
      10
    );

    const bot = await prisma.user.create({
      data: {
        username: 'relax-git-bot',
        uid: 'relax-git-bot',
        password: hashedPassword,
        role: 'USER',
        isActive: true,
        isOnline: true,
        avatar: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4', // GitHub Octocat 头像
      },
    });

    console.log('✅ 机器人用户创建成功！');
    console.log(`   ID: ${bot.id}`);
    console.log(`   Username: ${bot.username}`);
    console.log(`   UID: ${bot.uid}`);
    console.log(`   Role: ${bot.role}`);

    return bot;
  } catch (error) {
    console.error('❌ 创建机器人用户失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  createBotUser()
    .then(() => {
      console.log('\n✨ 完成！');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { createBotUser };
