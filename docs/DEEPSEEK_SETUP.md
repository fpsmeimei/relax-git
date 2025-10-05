# 智谱 AI 集成指南

Relax-Git 已经集成了智谱 AI（ChatGLM）模型，为 relax-git-bot 提供智能对话能力。

## ✨ 功能特性

- 🤖 **智能聊天机器人**：与 relax-git-bot 进行自然语言对话
- 💬 **上下文理解**：记住最近 10 条对话，提供连贯的回复
- 🎯 **Relax-Git 专家**：了解平台功能，提供专业的技术支持
- 📝 **代码分析**：生成 Git 提交信息、代码审查（即将上线）

## 🚀 快速开始

### 1. 获取智谱 AI API Key

1. 访问 [智谱 AI 开放平台](https://open.bigmodel.cn/)
2. 注册/登录账号（支持手机号、微信、GitHub）
3. 进入 [API Keys 页面](https://open.bigmodel.cn/usercenter/apikeys)
4. 点击"创建API Key"
5. 复制生成的 API Key

**优势**：

- ✅ **清华大学出品**，技术实力强
- ✅ **新用户送 1800 万 tokens**，免费额度充足
- ✅ **中文能力顶级**，理解能力强
- ✅ **GLM-4-Flash 模型超快**，响应迅速
- ✅ **配置简单**，开箱即用

### 2. 配置环境变量

在 `apps/api/.env.local` 文件中添加：

```bash
# 智谱 AI 配置
ZHIPU_API_KEY=your-zhipu-api-key-here
```

> **注意**：如果没有 `.env.local` 文件，可以复制 `.env.example` 并重命名

### 3. 重启后端服务

```bash
# 停止当前服务（Ctrl+C）
# 重新启动
pnpm -C apps/api dev
```

### 4. 测试 AI 功能

1. 启动前端服务：`pnpm -C apps/web dev`
2. 访问：`http://localhost:3000/chat/bot`
3. 发送消息测试

## 📋 API 接口

### 1. 检查 AI 服务状态

```bash
GET /api/ai/status
```

**响应示例**：

```json
{
  "available": true,
  "provider": "Zhipu AI",
  "model": "glm-4-flash",
  "timestamp": "2025-10-05T00:00:00.000Z"
}
```

### 2. 聊天对话

```bash
POST /api/ai/chat
```

**请求体**：

```json
{
  "message": "你好，Relax-Git 有哪些功能？",
  "conversationHistory": [
    {
      "role": "user",
      "content": "之前的消息"
    },
    {
      "role": "assistant",
      "content": "之前的回复"
    }
  ]
}
```

**响应示例**：

```json
{
  "reply": "你好！Relax-Git 是一个代码仓库管理平台...",
  "timestamp": "2025-10-05T00:00:00.000Z"
}
```

### 3. 生成提交信息（即将上线）

```bash
POST /api/ai/generate-commit
```

**请求体**：

```json
{
  "diff": "git diff 输出内容"
}
```

### 4. 代码审查（即将上线）

```bash
POST /api/ai/review-code
```

**请求体**：

```json
{
  "code": "代码内容",
  "language": "typescript"
}
```

## 💡 使用技巧

### 1. 提高回复质量

- **具体描述问题**：详细说明你的问题或需求
- **提供上下文**：在对话中保持连贯性
- **明确意图**：清楚表达你想了解什么

### 2. 成本控制

DeepSeek 提供免费额度，但建议：

- 避免过长的对话历史
- 控制消息频率
- 监控 API 使用量

### 3. 错误处理

如果 AI 服务不可用：

- 检查 `DEEPSEEK_API_KEY` 是否正确配置
- 查看后端日志：`apps/api` 终端输出
- 检查网络连接

## 🔧 高级配置

### 调整 AI 参数

编辑 `apps/api/src/ai/ai.service.ts`：

```typescript
const response = await this.client!.chat.completions.create({
  model: 'deepseek-chat',
  messages,
  temperature: 0.7, // 创造性：0.0-2.0，越高越随机
  max_tokens: 800, // 最大回复长度
  top_p: 0.95, // 核采样参数
});
```

### 自定义系统提示词

在 `ai.service.ts` 的 `chat` 方法中修改 `system` 消息内容。

## ⚠️ 注意事项

1. **API Key 安全**
   - ❌ 不要将 API Key 提交到 Git
   - ✅ 使用 `.env.local` 文件（已在 .gitignore 中）
   - ✅ 生产环境使用环境变量注入

2. **免费额度**
   - 每天有使用限制
   - 超出额度后需要等待或升级

3. **数据隐私**
   - 聊天内容会发送到 DeepSeek 服务器
   - 不要发送敏感信息

## 🐛 常见问题

### Q: AI 回复 "AI 服务暂时不可用"

**A**: 检查以下几点：

1. `DEEPSEEK_API_KEY` 是否配置
2. 后端服务是否重启
3. 查看后端日志是否有错误

### Q: 提示"当前请求过于频繁"

**A**: 触发了 DeepSeek 的速率限制，等待几分钟后再试。

### Q: 如何禁用 AI 功能？

**A**: 删除或注释 `.env.local` 中的 `DEEPSEEK_API_KEY`。

## 📚 相关资源

- [DeepSeek 官方文档](https://platform.deepseek.com/docs)
- [OpenAI API 兼容性说明](https://platform.deepseek.com/api-docs/)
- [DeepSeek API 价格](https://platform.deepseek.com/pricing)

## 🎉 下一步

- 探索更多 AI 功能：代码审查、提交信息生成
- 自定义机器人的个性和专业领域
- 集成到更多场景：代码注释、文档生成

---

**享受与 AI 的智能对话！** 🚀
