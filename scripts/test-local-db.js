// 测试本地数据库连接
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('../libs/shared/src/generated/prisma-client');

const databaseUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Missing LOCAL_DATABASE_URL or DATABASE_URL');
}

async function testLocalDB() {
  console.log('🔍 测试本地数据库连接...');
  console.log('数据库连接:', describeDatabaseUrl(databaseUrl));

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  try {
    await prisma.$connect();
    console.log('✅ 本地数据库连接成功');

    const userCount = await prisma.user.count();
    console.log(`📊 用户数量: ${userCount}`);

    const repoCount = await prisma.repository.count();
    console.log(`📊 仓库数量: ${repoCount}`);
  } catch (error) {
    console.error('❌ 本地数据库连接失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

function describeDatabaseUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}:${parsed.port || 'default'}${parsed.pathname}`;
  } catch {
    return 'configured';
  }
}

testLocalDB();
