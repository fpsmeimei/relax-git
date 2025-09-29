const fs = require('fs');
const path = require('path');

function findTSFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (
      stat.isDirectory() &&
      !item.includes('node_modules') &&
      !item.includes('dist')
    ) {
      findTSFiles(fullPath, files);
    } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 修复 Prisma 客户端导入
  const oldImport1 = '@relax-git/shared/generated/prisma-client';
  const newImport1 = '@relax-git/shared';
  const oldImport2 = '@relax-git/shared/types/database';
  const newImport2 = '@relax-git/shared';

  if (content.includes(oldImport1)) {
    content = content.replace(
      new RegExp(oldImport1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      newImport1
    );
    changed = true;
    console.log(`Fixed imports in: ${filePath}`);
  }

  if (content.includes(oldImport2)) {
    content = content.replace(
      new RegExp(oldImport2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      newImport2
    );
    changed = true;
    console.log(`Fixed imports in: ${filePath}`);
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// 修复 apps/api 目录下的所有 TypeScript 文件
const apiDir = path.join(__dirname, '..', 'apps', 'api', 'src');
const tsFiles = findTSFiles(apiDir);

console.log(`Found ${tsFiles.length} TypeScript files in apps/api/src`);

tsFiles.forEach(fixImports);

console.log('Import fixing completed!');
