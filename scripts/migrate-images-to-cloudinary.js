#!/usr/bin/env node

/**
 * Relax-Git 图像迁移脚本
 * 将本地存储的图像文件上传到 Cloudinary 并更新数据库 URL
 * 
 * 使用方法：
 * 1. 确保 Cloudinary 配置正确
 * 2. 确保本地图像文件存在
 * 3. 运行: node scripts/migrate-images-to-cloudinary.js
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('../libs/shared/src/generated/prisma-client');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dzqnf0wcx',
  api_key: process.env.CLOUDINARY_API_KEY || '135786184385336',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'q9ssbXAJWc4GCfPt79vKgPq_XOI'
});

// 数据库连接
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.LOCAL_DATABASE_URL
    }
  }
});

const remotePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// 本地文件根目录（根据您的项目结构调整）
const LOCAL_UPLOADS_ROOT = path.join(__dirname, '..', 'apps', 'api', 'uploads');

async function main() {
  console.log('🚀 开始图像迁移到 Cloudinary...\n');
  
  try {
    // 1. 验证 Cloudinary 配置
    console.log('🔍 验证 Cloudinary 配置...');
    await verifyCloudinaryConfig();
    console.log('✅ Cloudinary 配置正确\n');

    // 2. 连接数据库
    console.log('🔍 连接数据库...');
    await localPrisma.$connect();
    await remotePrisma.$connect();
    console.log('✅ 数据库连接成功\n');

    // 3. 迁移用户头像
    console.log('👥 开始迁移用户头像...');
    await migrateUserAvatars();

    // 4. 迁移仓库封面
    console.log('\n📁 开始迁移仓库封面...');
    await migrateRepositoryCovers();

    console.log('\n✅ 图像迁移完成！');
    console.log('\n📝 下一步：');
    console.log('1. 刷新浏览器页面');
    console.log('2. 检查用户头像显示');
    console.log('3. 检查仓库封面显示');
    console.log('4. 验证图像加载速度');

  } catch (error) {
    console.error('❌ 图像迁移失败：', error);
    process.exit(1);
  } finally {
    await localPrisma.$disconnect();
    await remotePrisma.$disconnect();
  }
}

async function verifyCloudinaryConfig() {
  try {
    const result = await cloudinary.api.ping();
    if (result.status !== 'ok') {
      throw new Error('Cloudinary ping failed');
    }
  } catch (error) {
    throw new Error(`Cloudinary 配置错误: ${error.message}`);
  }
}

async function migrateUserAvatars() {
  // 获取本地用户数据
  const users = await localPrisma.user.findMany({
    where: {
      avatar: {
        not: null,
        startsWith: '/uploads/avatars/'
      }
    },
    select: {
      id: true,
      username: true,
      avatar: true
    }
  });

  console.log(`找到 ${users.length} 个用户需要迁移头像`);

  for (const user of users) {
    try {
      console.log(`🔄 迁移用户 ${user.username} 的头像...`);
      
      // 构建本地文件路径
      const localFilePath = path.join(LOCAL_UPLOADS_ROOT, user.avatar.replace('/uploads/', ''));
      
      // 检查文件是否存在
      if (!fs.existsSync(localFilePath)) {
        console.log(`  ⚠️  文件不存在: ${localFilePath}`);
        continue;
      }

      // 上传到 Cloudinary
      const uploadResult = await cloudinary.uploader.upload(localFilePath, {
        folder: 'relax-git/avatars',
        public_id: `user-${user.id}-${Date.now()}`,
        resource_type: 'image',
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      // 更新远程数据库
      await remotePrisma.user.update({
        where: { id: user.id },
        data: { avatar: uploadResult.secure_url }
      });

      console.log(`  ✅ ${user.username}: ${uploadResult.secure_url}`);
      
    } catch (error) {
      console.error(`  ❌ ${user.username} 迁移失败:`, error.message);
    }
  }
}

async function migrateRepositoryCovers() {
  // 获取本地仓库数据
  const repositories = await localPrisma.repository.findMany({
    where: {
      coverImage: {
        not: null,
        startsWith: '/uploads/repositories/'
      }
    },
    select: {
      id: true,
      name: true,
      coverImage: true
    }
  });

  console.log(`找到 ${repositories.length} 个仓库需要迁移封面`);

  for (const repo of repositories) {
    try {
      console.log(`🔄 迁移仓库 ${repo.name} 的封面...`);
      
      // 构建本地文件路径
      const localFilePath = path.join(LOCAL_UPLOADS_ROOT, repo.coverImage.replace('/uploads/', ''));
      
      // 检查文件是否存在
      if (!fs.existsSync(localFilePath)) {
        console.log(`  ⚠️  文件不存在: ${localFilePath}`);
        continue;
      }

      // 上传到 Cloudinary
      const uploadResult = await cloudinary.uploader.upload(localFilePath, {
        folder: 'relax-git/repositories',
        public_id: `repo-${repo.id}-${Date.now()}`,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 400, crop: 'fill' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      // 更新远程数据库
      await remotePrisma.repository.update({
        where: { id: repo.id },
        data: { coverImage: uploadResult.secure_url }
      });

      console.log(`  ✅ ${repo.name}: ${uploadResult.secure_url}`);
      
    } catch (error) {
      console.error(`  ❌ ${repo.name} 迁移失败:`, error.message);
    }
  }
}

// 辅助函数：获取文件扩展名
function getFileExtension(filename) {
  return path.extname(filename).toLowerCase();
}

// 辅助函数：检查是否为支持的图像格式
function isSupportedImageFormat(filename) {
  const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  return supportedFormats.includes(getFileExtension(filename));
}

// 运行迁移
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
