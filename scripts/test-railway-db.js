// 测试 Railway 数据库连接
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('../libs/shared/src/generated/prisma-client');

async function testRailwayDB() {
  console.log('🔍 测试 Railway 数据库连接...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
  
  try {
    await prisma.$connect();
    console.log('✅ Railway 数据库连接成功');
    
    const userCount = await prisma.user.count();
    console.log(`📊 用户数量: ${userCount}`);
    
    const repoCount = await prisma.repository.count();
    console.log(`📊 仓库数量: ${repoCount}`);
    
  } catch (error) {
    console.error('❌ Railway 数据库连接失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRailwayDB();
