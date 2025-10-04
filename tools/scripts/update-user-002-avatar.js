const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

const prisma = new PrismaClient();

async function updateAvatar() {
  try {
    const avatar =
      'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=002&backgroundColor=b6e3f4&eyes=bulging,happy&mouth=smile01,smile02&scale=80';

    const user = await prisma.user.update({
      where: { username: '002' },
      data: { avatar },
    });

    console.log('✅ 头像设置成功！');
    console.log('用户:', user.username);
    console.log('头像:', user.avatar);
  } catch (error) {
    console.error('❌ 设置头像失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAvatar();
