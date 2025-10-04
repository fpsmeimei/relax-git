const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

const prisma = new PrismaClient();

/**
 * 更新 Relax-Git 机器人头像为 GitHub 小猫图标
 */
async function updateBotAvatar() {
  try {
    console.log('=== 更新 Relax-Git 机器人头像 ===\n');

    // 查找机器人用户
    const bot = await prisma.user.findUnique({
      where: { username: 'relax-git-bot' },
    });

    if (!bot) {
      console.error('❌ 机器人用户不存在，请先运行 create-bot-user.js');
      process.exit(1);
    }

    // GitHub Octocat 头像 URL
    const avatarUrl = 'https://avatars.githubusercontent.com/u/9919?s=200&v=4';

    // 更新头像
    await prisma.user.update({
      where: { id: bot.id },
      data: { avatar: avatarUrl },
    });

    console.log('✅ 机器人头像更新成功！');
    console.log(`   ID: ${bot.id}`);
    console.log(`   Username: ${bot.username}`);
    console.log(`   Avatar: ${avatarUrl}`);
    console.log('\n刷新页面即可看到新头像 🐱');
  } catch (error) {
    console.error('❌ 更新机器人头像失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  updateBotAvatar()
    .then(() => {
      console.log('\n✨ 完成！');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { updateBotAvatar };
