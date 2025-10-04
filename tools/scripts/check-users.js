const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`数据库中共有 ${users.length} 个用户:\n`);
    users.forEach(user => {
      console.log(`- ${user.username} (${user.isActive ? '活跃' : '禁用'})`);
      console.log(`  ID: ${user.id}`);
      console.log(`  注册时间: ${user.createdAt.toISOString()}\n`);
    });
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
