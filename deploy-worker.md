# Railway Worker 服务部署指南

## 🚀 部署步骤

### 1. 创建 Worker 服务

1. 在 Railway 项目中点击 **"+ New Service"**
2. 选择 **"GitHub Repo"**
3. 选择 `relax-git` 仓库

### 2. 配置服务设置

- **Service Name**: `relax-git-worker`
- **Root Directory**: `apps/worker`
- **Build Command**: 留空（使用 Dockerfile）
- **Start Command**: 留空（使用 Dockerfile）

### 3. 设置环境变量

在 Variables 标签页添加：

```bash
# 基础配置
NODE_ENV=production
PORT=3002

# 数据库连接 (使用相同的数据库)
DATABASE_URL=postgresql://postgres:YKKlOsakKrqNaFrKKyQxKptCYisSSrEn@postgres.railway.internal:5432/railway

# Redis 连接 (使用相同的 Redis)
REDIS_URL=redis://default:nBXcbFJSBXifCbOysXcCoeQIVOotyndo@trolley.proxy.rlwy.net:17157

# Worker 配置
WORKER_CONCURRENCY=2
WORKER_QUEUE_NAME=snapshot:queue
WORKER_WORK_DIR=/tmp/relax-git-worker

# Git 配置
GIT_TEMP_DIR=/tmp/relax-git-repos
GIT_BUNDLE_DIR=/tmp/relax-git-bundles
GIT_MAX_REPO_SIZE=1073741824

# 日志配置
LOG_LEVEL=info
```

### 4. 部署并验证

1. 点击 **"Deploy"** 按钮
2. 等待构建完成
3. 检查日志确认 Worker 正常启动
4. 访问健康检查：`https://[WORKER-DOMAIN]/health`

## 🔧 服务架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   API Backend   │    │  Worker Service │
│   Port: 8080    │◄──►│   Port: 3000    │◄──►│   Port: 3002    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │     Redis       │
                    └─────────────────┘
```

## 📋 验证清单

- [ ] Worker 服务成功启动
- [ ] 连接到 PostgreSQL 数据库
- [ ] 连接到 Redis 队列
- [ ] 健康检查端点响应正常
- [ ] 日志显示队列监听正常

## 🔄 完整部署后的服务

1. **API 服务**: `https://relax-git-production.up.railway.app`
2. **Web 服务**: `https://relax-git-web-production.up.railway.app`
3. **Worker 服务**: 内部服务，处理后台任务

所有服务共享同一个 PostgreSQL 数据库和 Redis 实例。
