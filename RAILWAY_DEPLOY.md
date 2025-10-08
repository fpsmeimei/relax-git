# Railway 部署指南

本文档详细说明如何将 Relax-Git 项目部署到 Railway 平台。

## 🚀 部署方案

### 方案 A: 全栈单容器部署 (推荐)

使用根目录的 `Dockerfile` 将 API 和 Web 打包到一个容器中，使用 PM2 管理多个进程。

### 方案 B: 微服务分离部署

分别部署 API、Web 和 Worker 服务到不同的 Railway 服务中。

## 📋 部署前准备

### 1. 环境变量配置

在 Railway 项目中配置以下环境变量：

#### 数据库相关

```bash
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://host:port
```

#### 应用配置

```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
CORS_ORIGIN=https://your-domain.railway.app
```

#### Next.js 配置

```bash
NEXTAUTH_URL=https://your-domain.railway.app
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXT_PUBLIC_API_URL=https://your-domain.railway.app
```

### 2. 数据库服务

在 Railway 中添加 PostgreSQL 和 Redis 服务：

- PostgreSQL 16
- Redis 7

## 🛠️ 部署步骤

### 方案 A: 全栈部署

1. **创建 Railway 项目**

   ```bash
   railway login
   railway init
   ```

2. **添加数据库服务**
   - 在 Railway Dashboard 中添加 PostgreSQL
   - 添加 Redis 服务
   - 复制连接字符串到环境变量

3. **配置环境变量**

   ```bash
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=your-jwt-secret
   railway variables set CORS_ORIGIN=https://your-app.railway.app
   # ... 其他环境变量
   ```

4. **部署应用**
   ```bash
   railway up
   ```

### 方案 B: 微服务部署

1. **部署 API 服务**

   ```bash
   # 使用 API Dockerfile
   railway service create api
   railway service use api
   railway variables set DOCKERFILE_PATH=apps/api/Dockerfile
   railway up
   ```

2. **部署 Web 服务**

   ```bash
   # 使用 Web Dockerfile
   railway service create web
   railway service use web
   railway variables set DOCKERFILE_PATH=apps/web/Dockerfile
   railway variables set NEXT_PUBLIC_API_URL=https://api-service-url.railway.app
   railway up
   ```

3. **部署 Worker 服务**
   ```bash
   # 使用 Worker Dockerfile
   railway service create worker
   railway service use worker
   railway variables set DOCKERFILE_PATH=apps/worker/Dockerfile
   railway up
   ```

## 🔧 本地测试

在部署前，可以使用 Docker Compose 在本地测试：

### 测试全栈部署

```bash
# 启动全栈容器
docker-compose --profile fullstack up fullstack postgres redis

# 访问应用
# Web: http://localhost:8000
# API: http://localhost:8001
```

### 测试微服务部署

```bash
# 启动所有服务
docker-compose up

# 访问应用
# Web: http://localhost:3000
# API: http://localhost:3001
# Worker: 后台运行
```

## 📊 监控和日志

### 健康检查

- **Web**: `GET /` - 返回 200 表示正常
- **API**: `GET /health` - 返回健康状态
- **Worker**: `GET /health` - 返回工作状态

### 日志查看

```bash
# Railway CLI 查看日志
railway logs

# 或在 Dashboard 中查看实时日志
```

## 🔍 故障排除

### 常见问题

1. **构建失败**
   - 检查 Dockerfile 路径是否正确
   - 确认所有依赖都已正确安装
   - 查看构建日志中的错误信息

2. **数据库连接失败**
   - 确认 DATABASE_URL 格式正确
   - 检查数据库服务是否正常运行
   - 验证网络连接

3. **Prisma 客户端错误**
   - 确保在构建时运行了 `pnpm db:generate`
   - 检查 Prisma schema 文件是否存在

4. **内存不足**
   - 考虑升级 Railway 计划
   - 优化 Docker 镜像大小
   - 调整 PM2 进程配置

### 调试命令

```bash
# 连接到 Railway 容器
railway shell

# 查看进程状态
pm2 status

# 查看应用日志
pm2 logs

# 重启服务
pm2 restart all
```

## 🚀 性能优化

### Docker 镜像优化

- 使用多阶段构建减少镜像大小
- 利用 Docker 层缓存
- 只安装生产依赖

### 应用优化

- 启用 Next.js 静态优化
- 配置适当的缓存策略
- 使用 PM2 集群模式（如需要）

## 📝 部署清单

- [ ] 配置所有必需的环境变量
- [ ] 添加 PostgreSQL 和 Redis 服务
- [ ] 测试数据库连接
- [ ] 验证 Prisma 客户端生成
- [ ] 检查健康检查端点
- [ ] 配置域名（如需要）
- [ ] 设置监控和告警
- [ ] 备份数据库（生产环境）

## 🔗 相关链接

- [Railway 官方文档](https://docs.railway.app/)
- [Docker 最佳实践](https://docs.docker.com/develop/dev-best-practices/)
- [PM2 文档](https://pm2.keymetrics.io/docs/)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
