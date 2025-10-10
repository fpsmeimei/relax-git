// 检查本地数据库中的图像数据
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('../libs/shared/src/generated/prisma-client');

async function checkImages() {
  console.log('🔍 检查本地数据库中的图像数据...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.LOCAL_DATABASE_URL
      }
    }
  });
  
  try {
    await prisma.$connect();
    console.log('✅ 本地数据库连接成功\n');
    
    // 检查用户头像
    console.log('👥 用户头像数据：');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatar: true
      }
    });
    
    users.forEach(user => {
      console.log(`  - ${user.username}: ${user.avatar || '无头像'}`);
    });
    
    console.log('\n📁 仓库封面数据：');
    const repos = await prisma.repository.findMany({
      select: {
        id: true,
        name: true,
        coverImage: true
      }
    });
    
    repos.forEach(repo => {
      console.log(`  - ${repo.name}: ${repo.coverImage || '无封面'}`);
    });
    
    // 统计
    const usersWithAvatar = users.filter(u => u.avatar).length;
    const reposWithCover = repos.filter(r => r.coverImage).length;
    
    console.log('\n📊 统计：');
    console.log(`  - 有头像的用户: ${usersWithAvatar}/${users.length}`);
    console.log(`  - 有封面的仓库: ${reposWithCover}/${repos.length}`);
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();
