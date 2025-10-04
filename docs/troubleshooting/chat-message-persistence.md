# 聊天消息持久化问题排查

## 问题描述

用户反馈：聊天室内的聊天消息，在退出登录后重新登录会消失。

## 问题诊断

### 1. 数据库检查

运行 `node tools/scripts/check-chat-messages.js` 检查数据库：

- ❌ Message 表：0 条记录
- ❌ ChatMessage 表：0 条记录
- ❌ Chat 表：0 条记录

**结论：消息从未保存到数据库！**

### 2. 架构分析

#### 当前有两套聊天系统：

1. **Chat + Message 系统** (群聊/私聊统一)
   - API: `/api/chats/*`
   - 数据表: `Chat`, `ChatMember`, `Message`
   - 前端: `chat-store.ts`

2. **ChatMessage 系统** (独立私聊)
   - API: `/api/private-chat/*`
   - 数据表: `ChatMessage`, `Friendship`
   - 前端: (未使用)

#### 前端聊天室页面使用的是 Chat 系统：

```typescript
// apps/web/src/app/chatroom/page.tsx
const { messages, loadMoreMessages, sendMessage, markRead, setCurrentChat } = useChatStore();

// apps/web/src/stores/chat-store.ts
sendMessage: async (chatId, content) => {
  const res = await apiClient.post<ChatMessage>(`/chats/${chatId}/messages`, { content });
  return res.data as ChatMessage;
};
```

### 3. 可能的原因

#### 原因 A: Chat 对象不存在

- 前端调用 `sendMessage(chatId, ...)` 时，`chatId` 无效
- 后端 `ensureMember` 检查失败，抛出异常
- 异常被前端捕获但未正确提示用户

#### 原因 B: API 调用失败

- 网络错误或权限问题
- 前端错误处理不当，消息被静默吞掉

#### 原因 C: WebSocket 事件误导

- 消息通过 WebSocket 推送到前端
- 前端显示消息，但实际未保存到数据库
- 用户误以为消息已发送成功

## 排查步骤

### 步骤 1: 启用详细日志

已在以下文件添加日志：

- `apps/web/src/stores/chat-store.ts`: 消息发送和加载日志
- `apps/web/src/hooks/use-chat-socket.ts`: WebSocket 事件日志

### 步骤 2: 测试消息发送

1. 重启前后端服务
2. 打开浏览器开发者工具 (F12)
3. 登录并进入聊天室
4. 选择一个好友
5. 发送一条消息
6. 观察控制台输出：
   ```
   [chat-store] 发送消息: { chatId: 'xxx', content: 'test' }
   [chat-store] 消息发送成功: { id: 'xxx', ... }  // 成功
   [chat-store] 消息发送失败: Error ...          // 失败
   [use-chat-socket] 收到新消息推送: { ... }     // WebSocket
   ```

### 步骤 3: 检查 Network 请求

1. 打开 Network 面板
2. 发送消息
3. 查找 `POST /api/chats/{chatId}/messages` 请求
4. 检查：
   - ✅ 请求是否发送？
   - ✅ 状态码是否 200/201？
   - ✅ 响应体是否包含消息对象？
   - ✅ 是否有错误响应？

### 步骤 4: 验证数据库持久化

发送消息后，运行：

```bash
node tools/scripts/check-chat-messages.js
```

检查 Message 表是否有新记录。

## 预期解决方案

### 方案 A: 确保 Chat 对象存在

检查 `handleSelectFriend` 中的 Chat 创建逻辑：

```typescript
// apps/web/src/app/chatroom/page.tsx line 211-221
if (friend.chatId) {
  setSelectedChatId(friend.chatId);
} else {
  // 创建新 Chat
  const { data } = await apiClient.post<{ id: string }>('/chats/direct', {
    userId: friend.id,
  });
  const newChatId = data?.id;
  setSelectedChatId(newChatId);
}
```

### 方案 B: 改进错误处理

在 `handleSendChatMessage` 中添加更详细的错误提示：

```typescript
catch (error: any) {
  console.error('[chatroom] 发送消息失败:', error);
  toast({
    title: '消息发送失败',
    description: error?.response?.data?.message || error?.message || '请稍后重试',
    variant: 'destructive',
  });
}
```

### 方案 C: 统一聊天系统

当前存在两套系统导致混乱，建议：

1. 选择一套系统作为主要实现 (推荐 Chat 系统)
2. 迁移或删除另一套系统
3. 更新文档和类型定义

## 后续优化

1. **添加消息发送状态**
   - 显示 "发送中" / "已发送" / "发送失败"
   - 支持重新发送失败的消息

2. **离线消息队列**
   - 离线时缓存消息
   - 重新连接时自动发送

3. **消息持久化确认**
   - 后端返回消息 ID
   - 前端确认持久化成功后才显示消息

## 参考链接

- Prisma Schema: `apps/api/prisma/schema.prisma`
- Chat API: `apps/api/src/chats/chats.controller.ts`
- WebSocket Gateway: `apps/api/src/websocket/websocket.gateway.ts`
