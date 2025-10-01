/**
 * 移除所有查询中的 email 字段
 * 因为数据库 User 模型中没有 email 字段
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'apps/api/src/users/users.service.ts',
  'apps/api/src/timeline/timeline.service.ts',
  'apps/api/src/snapshots/session-lifecycle.service.ts',
  'apps/api/src/snapshots/services/unified-snapshot.service.ts',
  'apps/api/src/repositories/repositories.service.ts',
  'apps/api/src/members/members.service.ts',
  'apps/api/src/join-requests/join-requests.service.ts',
  'apps/api/src/comments/comments.service.ts',
  'apps/api/src/auth/auth.service.ts',
];

const rootDir = path.resolve(__dirname, '../..');

console.log('🔧 开始移除 email 字段...\n');

let totalRemoved = 0;

filesToFix.forEach(file => {
  const filePath = path.join(rootDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  跳过（文件不存在）: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // 移除 email: true, （带逗号）
  content = content.replace(/\s*email:\s*true,?\s*\n/g, '\n');
  
  // 移除类型定义中的 email
  content = content.replace(/\s*email:\s*true;\s*\n/g, '\n');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    const count = (originalContent.match(/email:\s*true/g) || []).length;
    console.log(`✅ ${file}: 移除了 ${count} 处`);
    totalRemoved += count;
  } else {
    console.log(`⏭️  ${file}: 无需修改`);
  }
});

console.log(`\n🎉 完成！共移除 ${totalRemoved} 处 email 字段`);
