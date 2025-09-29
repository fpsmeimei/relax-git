const fs = require('fs');
const path = require('path');

const auditLogPath = path.join(
  __dirname,
  '..',
  '..',
  'apps',
  'api',
  'src',
  'common',
  'services',
  'audit-log.service.ts'
);

function fixAuditLogTypes() {
  let content = fs.readFileSync(auditLogPath, 'utf8');

  // 修复所有 ipAddress 和 userAgent 的可选参数问题
  const fixes = [
    {
      old: /ipAddress,\s*userAgent,/g,
      new: "ipAddress: ipAddress || 'unknown',\n      userAgent: userAgent || 'unknown',",
    },
    {
      old: /ipAddress:\s*string\s*\|\s*undefined/g,
      new: 'ipAddress: string | undefined',
    },
  ];

  let changed = false;

  fixes.forEach(fix => {
    if (fix.old.test(content)) {
      content = content.replace(fix.old, fix.new);
      changed = true;
    }
  });

  // 特殊处理 SUSPICIOUS_ACTIVITY 的 userId 问题
  content = content.replace(
    /userId:\s*string\s*\|\s*undefined,\s*ipAddress:\s*string\s*\|\s*undefined/g,
    "userId: userId || 'unknown',\n      ipAddress: ipAddress || 'unknown'"
  );

  if (changed) {
    fs.writeFileSync(auditLogPath, content, 'utf8');
    console.log('Fixed audit log types');
  }
}

fixAuditLogTypes();
