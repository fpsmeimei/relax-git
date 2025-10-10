#!/usr/bin/env node

/**
 * Relax-Git 安全数据迁移脚本
 * 只迁移核心数据，跳过快照系统相关数据
 * 
 * 使用方法：
 * 1. 确保本地数据库正在运行
 * 2. 确保 Railway 数据库连接正常
 * 3. 运行: node scripts/safe-migration.js
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

// 使用共享的 Prisma 客户端
const { PrismaClient } = require('../libs/shared/src/generated/prisma-client');
const fs = require('fs');
const path = require('path');

// 数据库连接配置
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.LOCAL_DATABASE_URL || 'postgresql://postgres:localpass@localhost:5432/relax_git'
    }
  }
});

const remotePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL // Railway 数据库
    }
  }
});

// 要迁移的表（按依赖顺序）
const MIGRATION_TABLES = [
  'User',
  'Repository', 
  'RepositoryBranch',  // 正确的分支表名
  'Friendship',
  'ChatMessage',
  // 'Comment',        // 跳过：依赖 BaseSnapshot
  // 'CommentLike',    // 跳过：依赖 Comment
  // 'Notification',   // 跳过：可能依赖 Comment
];

// 跳过的表（快照相关 + 依赖快照的表）
const SKIPPED_TABLES = [
  'BaseSnapshot',      // 快照系统重新创建
  'SessionSnapshot',   // 快照系统重新创建
  'Comment',          // 依赖 BaseSnapshot.snapshotId
  'CommentLike',      // 依赖 Comment
  'Notification',     // 可能依赖 Comment 和 Repository 事件
];

async function main() {
  console.log('🚀 开始 Relax-Git 安全数据迁移...\n');
  
  try {
    // 1. 验证连接
    console.log('🔍 验证数据库连接...');
    await localPrisma.$connect();
    await remotePrisma.$connect();
    console.log('✅ 数据库连接成功\n');

    // 2. 检查本地数据
    console.log('📊 检查本地数据统计...');
    const localStats = await getDataStats(localPrisma);
    console.log('本地数据统计：');
    Object.entries(localStats).forEach(([table, count]) => {
      console.log(`  ${table}: ${count} 条记录`);
    });
    console.log();

    // 3. 检查远程数据（应该为空）
    console.log('📊 检查远程数据统计...');
    const remoteStats = await getDataStats(remotePrisma);
    console.log('远程数据统计：');
    Object.entries(remoteStats).forEach(([table, count]) => {
      console.log(`  ${table}: ${count} 条记录`);
    });
    console.log();

    // 4. 确认迁移
    const hasRemoteData = Object.values(remoteStats).some(count => count > 0);
    if (hasRemoteData) {
      console.log('⚠️  警告：远程数据库不为空！');
      console.log('请确认是否要覆盖现有数据...');
      // 在生产环境中，这里应该要求用户确认
    }

    // 5. 执行迁移
    console.log('🔄 开始数据迁移...\n');
    
    for (const tableName of MIGRATION_TABLES) {
      await migrateTable(tableName);
    }

    // 6. 显示跳过的表
    console.log('\n⚠️  跳过的表（快照相关，将由系统重新创建）：');
    SKIPPED_TABLES.forEach(table => {
      console.log(`  - ${table}`);
    });

    // 7. 验证迁移结果
    console.log('\n📊 迁移后数据统计：');
    const finalStats = await getDataStats(remotePrisma);
    Object.entries(finalStats).forEach(([table, count]) => {
      console.log(`  ${table}: ${count} 条记录`);
    });

    console.log('\n✅ 数据迁移完成！');
    console.log('\n📝 下一步：');
    console.log('1. 访问应用，使用迁移的账号登录');
    console.log('2. 添加仓库，测试快照系统');
    console.log('3. 验证浏览代码功能');
    console.log('4. 检查评论和社交功能');

  } catch (error) {
    console.error('❌ 迁移失败：', error);
    process.exit(1);
  } finally {
    await localPrisma.$disconnect();
    await remotePrisma.$disconnect();
  }
}

// Prisma 客户端方法名映射
function getClientMethodName(tableName) {
  const methodMap = {
    'User': 'user',
    'Repository': 'repository',
    'RepositoryBranch': 'repositoryBranch',
    'Friendship': 'friendship',
    'Comment': 'comment',
    'CommentLike': 'commentLike',
    'ChatMessage': 'chatMessage',
    'Notification': 'notification'
  };
  return methodMap[tableName] || tableName.toLowerCase();
}

async function getDataStats(prisma) {
  const stats = {};
  
  for (const table of MIGRATION_TABLES) {
    try {
      const clientMethodName = getClientMethodName(table);
      const count = await prisma[clientMethodName].count();
      stats[table] = count;
    } catch (error) {
      stats[table] = 0;
    }
  }
  
  return stats;
}

async function migrateTable(tableName) {
  console.log(`🔄 迁移 ${tableName}...`);
  
  try {
    // 获取正确的 Prisma 客户端方法名
    const clientMethodName = getClientMethodName(tableName);
    
    // 获取本地数据
    const localData = await localPrisma[clientMethodName].findMany();
    
    if (localData.length === 0) {
      console.log(`  ℹ️  ${tableName}: 无数据需要迁移`);
      return;
    }

    // 清空远程表（如果有数据）
    await remotePrisma[clientMethodName].deleteMany();
    
    // 批量插入数据
    if (localData.length > 0) {
      // 处理特殊字段（如日期）
      const processedData = localData.map(item => {
        const processed = { ...item };
        
        // 确保日期字段正确格式化
        Object.keys(processed).forEach(key => {
          if (processed[key] instanceof Date) {
            processed[key] = new Date(processed[key]);
          }
        });
        
        return processed;
      });

      await remotePrisma[clientMethodName].createMany({
        data: processedData,
        skipDuplicates: true
      });
    }
    
    console.log(`  ✅ ${tableName}: ${localData.length} 条记录迁移成功`);
    
  } catch (error) {
    console.error(`  ❌ ${tableName} 迁移失败:`, error.message);
    throw error;
  }
}

// 运行迁移
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
