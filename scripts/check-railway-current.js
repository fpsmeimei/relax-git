// 检查当前 Railway 数据库中的图像状态
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('../libs/shared/src/generated/prisma-client');

async function checkRailwayImages() {
  console.log('🔍 检查当前 Railway 数据库图像状态...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
  
  try {
    await prisma.$connect();
    console.log('✅ Railway 数据库连接成功\n');
    
    // 检查仓库封面
    console.log('📁 当前仓库封面状态：');
    const repos = await prisma.repository.findMany({
      select: {
        id: true,
        name: true,
        coverImage: true
      }
    });
    
    let nullCount = 0;
    let localPathCount = 0;
    let cloudinaryCount = 0;
    
    repos.forEach(repo => {
      if (!repo.coverImage) {
        nullCount++;
        console.log(`  - ${repo.name}: 无封面 (null)`);
      } else if (repo.coverImage.startsWith('/uploads/')) {
        localPathCount++;
        console.log(`  - ${repo.name}: 本地路径 (${repo.coverImage})`);
      } else if (repo.coverImage.includes('cloudinary.com')) {
        cloudinaryCount++;
        console.log(`  - ${repo.name}: Cloudinary (${repo.coverImage})`);
      } else {
        console.log(`  - ${repo.name}: 其他格式 (${repo.coverImage})`);
      }
    });
    
    console.log('\n📊 统计：');
    console.log(`  - 无封面 (null): ${nullCount}`);
    console.log(`  - 本地路径: ${localPathCount}`);
    console.log(`  - Cloudinary: ${cloudinaryCount}`);
    console.log(`  - 总计: ${repos.length}`);
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRailwayImages();
