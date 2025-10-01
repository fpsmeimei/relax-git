#!/usr/bin/env node

/**
 * 清理浏览器本地存储脚本
 * 当数据库重置后，需要清理浏览器中的旧 token
 */

console.log('🧹 清理浏览器本地存储指南\n');
console.log('由于数据库已重置，浏览器中的旧 token 已失效。');
console.log('请按以下步骤清理本地存储：\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('方法 1: 使用浏览器开发者工具（推荐）');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('1. 打开浏览器访问: http://localhost:3000');
console.log('2. 按 F12 打开开发者工具');
console.log('3. 切换到 "Application" (Chrome) 或 "存储" (Firefox) 标签');
console.log('4. 找到左侧 "Local Storage" → "http://localhost:3000"');
console.log('5. 删除以下键：');
console.log('   - auth-storage');
console.log('   - token');
console.log('   - refreshToken');
console.log('6. 按 Ctrl+Shift+R 强制刷新页面\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('方法 2: 使用浏览器控制台');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('1. 打开浏览器访问: http://localhost:3000');
console.log('2. 按 F12 打开开发者工具');
console.log('3. 切换到 "Console" 标签');
console.log('4. 复制粘贴以下代码并回车：\n');

console.log('   localStorage.removeItem("auth-storage");');
console.log('   localStorage.removeItem("token");');
console.log('   localStorage.removeItem("refreshToken");');
console.log('   location.reload();\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('方法 3: 清除所有站点数据（最彻底）');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Chrome:');
console.log('1. 访问 http://localhost:3000');
console.log('2. 点击地址栏左侧的 🔒 图标');
console.log('3. 点击 "网站设置" → "清除数据"\n');

console.log('Firefox:');
console.log('1. 按 Ctrl+Shift+Delete');
console.log('2. 选择 "缓存" 和 "Cookie"');
console.log('3. 时间范围选择 "全部"');
console.log('4. 点击 "立即清除"\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ 清理完成后：');
console.log('1. 刷新页面（应该会自动跳转到登录页）');
console.log('2. 使用新账号登录：');
console.log('   - 用户名: developer');
console.log('   - 密码: Dev2024Pass');
console.log('   或');
console.log('   - 用户名: admin');
console.log('   - 密码: Admin2024Pass\n');

console.log('💡 提示：');
console.log('现在的代码已经改进，下次遇到 token 失效时会自动清理并跳转，');
console.log('不会再显示 "Invalid refresh token" 错误。\n');
