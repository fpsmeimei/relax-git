/**
 * 调试前端组件和状态管理
 * 重点检查前端为什么没有显示未读徽章
 */

console.log('🔍 前端组件调试指南\n');

console.log('=== 1. 前端调试步骤 ===');
console.log('请在浏览器开发者工具中执行以下检查:\n');

console.log('1️⃣ 检查API调用是否正确:');
console.log('   打开Network标签，刷新页面');
console.log('   查找 /api/chats 请求');
console.log('   检查响应数据中的 unreadCount 是否为 1');
console.log('');

console.log('2️⃣ 检查前端状态管理:');
console.log('   在Console中执行:');
console.log('   > window.localStorage.getItem("chat-store")');
console.log('   检查 chats 数组中每个聊天室的 unreadCount');
console.log('');

console.log('3️⃣ 检查导航栏组件状态:');
console.log('   在Console中执行:');
console.log('   > document.querySelector("[aria-label=\\"聊天室\\"]")');
console.log('   检查聊天室按钮是否存在');
console.log('   查看是否有红色徽章元素');
console.log('');

console.log('4️⃣ 检查计算逻辑:');
console.log('   在nav-chat-link.tsx组件中添加console.log');
console.log('   检查 totalUnreadCount 的计算结果');
console.log('');

console.log('=== 2. 可能的前端问题点 ===');
console.log('');

console.log('🔍 问题点1: API数据没有正确加载');
console.log('   - 检查 useChatStore 的 loadChats() 是否被调用');
console.log('   - 检查 API 响应是否被正确解析');
console.log('   - 检查是否有网络错误或权限问题');
console.log('');

console.log('🔍 问题点2: 状态管理问题');
console.log('   - 检查 chat-store 的 chats 数组是否包含正确数据');
console.log('   - 检查 unreadCount 字段是否存在且正确');
console.log('   - 检查状态是否被意外重置');
console.log('');

console.log('🔍 问题点3: 组件渲染问题');
console.log('   - 检查 nav-chat-link.tsx 是否正确订阅状态');
console.log('   - 检查 totalUnreadCount 计算是否正确');
console.log('   - 检查条件渲染逻辑是否正确');
console.log('');

console.log('🔍 问题点4: 样式问题');
console.log('   - 检查红色徽章的CSS是否被覆盖');
console.log('   - 检查z-index或position是否有问题');
console.log('   - 检查是否被其他元素遮挡');
console.log('');

console.log('=== 3. 具体检查代码 ===');
console.log('');

console.log('📝 在nav-chat-link.tsx中添加调试代码:');
console.log(`
// 在组件内部添加
useEffect(() => {
  console.log('[nav-chat-link] chats:', chats);
  console.log('[nav-chat-link] totalUnreadCount:', totalUnreadCount);
  console.log('[nav-chat-link] displayCount:', displayCount);
}, [chats, totalUnreadCount]);
`);

console.log('📝 在chat-store.ts中添加调试代码:');
console.log(`
// 在loadChats方法中添加
console.log('[chat-store] loadChats response:', data);
console.log('[chat-store] parsed chats:', results);

// 在updateOnNewMessage方法中添加
console.log('[chat-store] updateOnNewMessage:', msg, isSelf);
console.log('[chat-store] shouldIncUnread:', shouldIncUnread);
`);

console.log('📝 检查WebSocket连接:');
console.log(`
// 在Console中执行
window.addEventListener('RG_SOCKET_CONNECTED', () => {
  console.log('WebSocket已连接');
});

window.addEventListener('RG_SOCKET_DISCONNECTED', () => {
  console.log('WebSocket已断开');
});
`);

console.log('=== 4. 常见问题解决方案 ===');
console.log('');

console.log('💡 如果API数据正确但前端没显示:');
console.log('   1. 清除浏览器缓存和localStorage');
console.log('   2. 重新登录账户');
console.log('   3. 检查是否有JavaScript错误');
console.log('');

console.log('💡 如果状态管理有问题:');
console.log('   1. 检查Zustand store的persist配置');
console.log('   2. 检查是否有状态竞争条件');
console.log('   3. 检查useEffect依赖数组');
console.log('');

console.log('💡 如果WebSocket有问题:');
console.log('   1. 检查WebSocket连接状态');
console.log('   2. 检查事件监听器是否正确注册');
console.log('   3. 检查事件处理逻辑');
console.log('');

console.log('=== 5. 紧急修复建议 ===');
console.log('');

console.log('🚨 如果以上都检查过仍然有问题，尝试:');
console.log('1. 完全清除浏览器数据 (Ctrl+Shift+Delete)');
console.log('2. 重启前端开发服务器');
console.log('3. 检查是否有缓存的Service Worker');
console.log('4. 尝试无痕模式或其他浏览器');
console.log('5. 检查是否有浏览器扩展干扰');
console.log('');

console.log('📋 请按照以上步骤逐一检查，并报告具体发现的问题！');
