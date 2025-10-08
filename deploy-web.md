# Railway Web 应用部署指南

## 🚀 部署步骤

### 1. 登录 Railway

访问 [Railway.app](https://railway.app) 并登录您的账户

### 2. 创建新项目

1. 点击 "New Project"
2. 选择 `relax-git` 仓库

### 3. 配置 Web 服务

1. 在项目中点击 "Add Service"
2. 选择 "GitHub Repo"

#### 3. 配置服务设置

- **Service Name**: `relax-git-web`
- **Root Directory**: 留空 (使用仓库根目录)
- **Build Command**: 留空 (使用 Dockerfile)
- **Start Command**: 留空 (使用 Dockerfile)

### 4. 设置环境变量

在 Railway Web 服务的 Variables 标签页中添加：

```bash
# 基础配置
NODE_ENV=production
PORT=8080
NEXT_TELEMETRY_DISABLED=1

# API 连接配置 (指向已部署的 API 服务)
API_URL=https://relax-git-production.up.railway.app
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_WS_URL=wss://relax-git-production.up.railway.app

# NextAuth 配置
AUTH_SECRET=relax-git-nextauth-secret-key-32-chars-long-2024
NEXTAUTH_URL=https://relax-git-web-production.up.railway.app

# 应用配置
NEXT_PUBLIC_APP_URL=https://relax-git-web-production.up.railway.app
NEXT_PUBLIC_ENABLE_DEVTOOLS=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_PERFORMANCE=false
```

### 5. 配置自定义域名 (可选)

1. 在 Settings 标签页中
2. 添加自定义域名或使用 Railway 提供的域名

### 6. 部署

1. 点击 "Deploy" 按钮
2. 等待构建和部署完成
3. 访问提供的 URL 测试应用

## 🔧 重要配置说明

### Dockerfile 位置

确保 Railway 能找到正确的 Dockerfile：

- 文件路径: `apps/web/Dockerfile`
- 已配置多阶段构建优化

### 健康检查

- 端点: `/api/health`
- 已在应用中实现健康检查路由

### API 代理配置

- Web 应用会自动将 `/api/*` 请求代理到 API 服务
- WebSocket 连接通过 `/api/socket.io` 代理

## 📋 部署后验证

1. **健康检查**: `https://your-web-domain.railway.app/api/health`
2. **首页访问**: `https://your-web-domain.railway.app`
3. **API 代理**: 确保前端能正常调用后端 API

## 🔄 更新 API 服务 CORS (重要!)

部署 Web 服务后，**必须**更新 API 服务的 CORS 配置：

### 方法 1: 单个域名

```bash
# 在 API 服务的环境变量中更新
CORS_ORIGIN=https://your-web-domain.railway.app
```

### 方法 2: 多个域名 (推荐)

```bash
# 支持多个域名，用逗号分隔
CORS_ORIGIN=https://relax-git-production.up.railway.app,https://your-web-domain.railway.app
```

### 步骤:

1. 在 Railway 控制台打开 API 服务
2. 进入 Variables 标签页
3. 修改 `CORS_ORIGIN` 环境变量
4. 重新部署 API 服务
