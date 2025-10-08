# Relax-Git Web 服务 Railway 部署指南

## 🎯 部署架构

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Web 服务          │    │   API 服务          │    │  Worker 服务        │
│   Next.js           │────│   NestJS            │────│   Go                │
│   端口: 8080        │    │   端口: 3000        │    │   后台任务          │
│   relax-git-web     │    │   relax-git-prod    │    │   relax-git-worker  │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## 📋 部署前检查清单

### 1. 代码准备

- [x] Dockerfile 已配置（端口 8080）
- [x] railway.json 已配置
- [x] 健康检查端点 `/api/health` 已实现
- [x] Next.js 重写规则已配置为独立架构
- [x] 环境变量模板已创建

### 2. 依赖服务状态

- [x] API 服务：`https://relax-git-production.up.railway.app` ✅ 运行中
- [x] Worker 服务：后台运行 ✅ 运行中
- [x] PostgreSQL：Railway 托管 ✅ 运行中
- [x] Redis：Railway 托管 ✅ 运行中

## 🚀 Railway 部署步骤

### 1. 创建新的 Railway 服务

```bash
# 在 Railway 控制台中：
# 1. 点击 "New Project"
# 2. 选择 "Deploy from GitHub repo"
# 3. 选择 relax-git 仓库
# 4. 选择 railway部署 分支
```

### 2. 配置服务设置

**服务名称**: `relax-git-web` **构建配置**:

- Root Directory: `/`
- Dockerfile Path: `apps/web/Dockerfile`

### 3. 设置环境变量

在 Railway 控制台中设置以下环境变量：

```bash
# 基础配置
PORT=8080
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# API 服务通信
NEXT_PUBLIC_API_URL=https://relax-git-production.up.railway.app
NEXT_PUBLIC_WS_URL=wss://relax-git-production.up.railway.app

# NextAuth 配置
NEXTAUTH_URL=https://relax-git-web.up.railway.app
NEXTAUTH_SECRET=relax-git-nextauth-secret-key-32-chars-long-2024
AUTH_SECRET=relax-git-nextauth-secret-key-32-chars-long-2024

# 应用配置
NEXT_PUBLIC_APP_URL=https://relax-git-web.up.railway.app

# GitHub OAuth（需要配置实际值）
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

### 4. 部署验证

部署完成后，验证以下端点：

1. **健康检查**: `https://relax-git-web.up.railway.app/api/health`
2. **首页**: `https://relax-git-web.up.railway.app`
3. **认证**: `https://relax-git-web.up.railway.app/api/auth/session`

## 🔧 故障排除

### 常见问题

1. **NextAuth 500 错误**
   - 检查 `NEXTAUTH_SECRET` 和 `AUTH_SECRET` 是否设置
   - 确认 `NEXTAUTH_URL` 指向正确的 Web 服务域名

2. **API 调用失败**
   - 检查 `NEXT_PUBLIC_API_URL` 是否指向正确的 API 服务
   - 确认 API 服务正常运行

3. **WebSocket 连接失败**
   - 检查 `NEXT_PUBLIC_WS_URL` 配置
   - 确认使用 `wss://` 协议

### 日志查看

```bash
# 在 Railway 控制台中查看实时日志
# 或使用 Railway CLI
railway logs --service relax-git-web
```

## 📊 预期结果

部署成功后：

- **Web 服务**: `https://relax-git-web.up.railway.app`
- **API 服务**: `https://relax-git-production.up.railway.app` (已存在)
- **服务间通信**: HTTPS/WSS
- **认证流程**: NextAuth.js 完整支持
- **健康检查**: 30秒间隔自动检查

## 🎉 部署完成验证

1. 访问 Web 服务首页
2. 测试用户登录功能
3. 验证 API 调用正常
4. 检查 WebSocket 连接
5. 确认所有功能正常工作

---

**注意**: 确保在部署前已经配置好 GitHub OAuth 应用，并将回调 URL 设置为
`https://relax-git-web.up.railway.app/api/auth/callback/github`
