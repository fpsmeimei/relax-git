#!/usr/bin/env node

/**
 * ⚠️ 已废弃：此脚本已不再使用
 * 
 * 系统已从 JWT 认证迁移到 UID 认证，不再需要 JWT 密钥。
 * 
 * 如需恢复 JWT 认证，请参考：
 * - docs/UID_AUTHENTICATION_MIGRATION.md
 * 
 * @deprecated 系统已切换为 UID 认证
 */

console.warn('\n⚠️  警告：此脚本已废弃\n');
console.warn('系统已从 JWT 认证迁移到 UID 认证，不再需要生成 JWT 密钥。\n');
console.warn('详见文档: docs/UID_AUTHENTICATION_MIGRATION.md\n');

process.exit(0);

/* ============================================
 * 以下代码已停用，仅供参考
 * ============================================

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 生成强随机密钥
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

console.log('🔐 生成安全密钥...\n');

const jwtSecret = generateSecret(32);
const jwtRefreshSecret = generateSecret(32);

console.log('✅ 密钥生成成功！\n');
console.log('请将以下内容添加到你的 .env.local 文件中：\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 检查是否已有 .env.local 文件
const apiEnvPath = path.join(process.cwd(), 'apps', 'api', '.env.local');
const envExists = fs.existsSync(apiEnvPath);

if (envExists) {
  console.log('⚠️  检测到 apps/api/.env.local 文件已存在');
  console.log('请手动更新文件中的密钥，或者删除文件后重新运行此脚本\n');
} else {
  // 询问是否自动创建
  console.log('💡 提示：');
  console.log('1. 手动复制上述密钥到 apps/api/.env.local');
  console.log('2. 或运行: node tools/scripts/generate-secrets.js --create');
  console.log('   （将自动创建配置文件）\n');
}

// 如果带 --create 参数，自动创建配置文件
if (process.argv.includes('--create') && !envExists) {
  const envTemplate = `# Demo mode: disable auth and use demo user
# AUTH_DISABLED=true
API_PORT=3001
CORS_ORIGIN=*
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/relax_git_dev
REDIS_URL=redis://localhost:6379

# Git proxy settings (keep your existing proxy if needed)
GIT_HTTP_PROXY=http://127.0.0.1:7899
GIT_HTTPS_PROXY=http://127.0.0.1:7899
GIT_REMOTE_TIMEOUT_MS=180000
GIT_REMOTE_HEAD_TIMEOUT_MS=90000
`;

  try {
    fs.writeFileSync(apiEnvPath, envTemplate, 'utf8');
    console.log('✅ 已创建 apps/api/.env.local 文件！');
    console.log(`📁 文件路径: ${apiEnvPath}\n`);
  } catch (error) {
    console.error('❌ 创建文件失败:', error.message);
  }
}

console.log('🔒 安全提醒：');
console.log('  - 请勿将 .env.local 文件提交到版本控制系统');
console.log('  - 生产环境请使用环境变量或密钥管理服务');
console.log('  - 定期轮换密钥以提高安全性\n');

*/
