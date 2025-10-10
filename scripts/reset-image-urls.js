#!/usr/bin/env node

/**
 * Relax-Git 图像 URL 重置脚本
 * 将本地文件路径重置为 null，让系统使用默认图像
 * 
 * 使用方法：
 * 1. 确保数据库连接正常
 * 2. 运行: node scripts/reset-image-urls.js
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('../libs/shared/src/generated/prisma-client');

// 数据库连接
const remotePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('🚀 开始重置图像 URL...\n');
  
  try {
    // 连接数据库
    console.log('🔍 连接数据库...');
    await remotePrisma.$connect();
    console.log('✅ 数据库连接成功\n');

    // 重置用户头像
    console.log('👥 重置用户头像 URL...');
    const userResult = await remotePrisma.user.updateMany({
      where: {
        avatar: {
          startsWith: '/uploads/avatars/'
        }
      },
      data: {
        avatar: null
      }
    });
    console.log(`✅ 重置了 ${userResult.count} 个用户头像`);

    // 重置仓库封面
    console.log('\n📁 重置仓库封面 URL...');
    const repoResult = await remotePrisma.repository.updateMany({
      where: {
        coverImage: {
          startsWith: '/uploads/repositories/'
        }
      },
      data: {
        coverImage: null
      }
    });
    console.log(`✅ 重置了 ${repoResult.count} 个仓库封面`);

    console.log('\n✅ 图像 URL 重置完成！');
    console.log('\n📝 说明：');
    console.log('- 用户头像将显示默认头像');
    console.log('- 仓库封面将显示默认封面');
    console.log('- 用户可以重新上传图像到 Cloudinary');
    console.log('\n🎯 下一步：');
    console.log('1. 刷新浏览器页面');
    console.log('2. 验证默认图像显示');
    console.log('3. 测试重新上传功能');

  } catch (error) {
    console.error('❌ 重置失败：', error);
    process.exit(1);
  } finally {
    await remotePrisma.$disconnect();
  }
}

// 运行重置
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
