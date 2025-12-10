# 部署与环境（说人话版 + 详细版）

## 说人话版

- **单容器全栈**：Next.js 对外 3000；NestJS API 内部 4000；Go Worker 后台。用 PM2 管理进程。
- **代理**：Next `rewrites` 代理 `/api/*` 和 `/api/socket.io` 到 API；目标 `socket.io/`
  必须带尾随斜杠。
- **健康**：Railway 健康检查指向 `/api/health`。
- **域名与 CORS**：`NEXTAUTH_URL/NEXT_PUBLIC_APP_URL/CORS_ORIGIN` 统一；生产不要 `*`。

## 详细版

### 架构与进程

- 单容器 PM2 三进程：
  - `web`：Next.js（外部端口 `PORT=3000`）。
  - `api`：NestJS（内部端口 `API_PORT=4000`）。
  - `worker`：Go 处理器（后台；健康端口 :3002）。
- 反向代理链路：浏览器 → Next（3000） → rewrites 转发 → API（4000）。

### Next.js 代理与头

- 文件：`apps/web/next.config.js`
  - `beforeFiles`：
    - `/api/socket.io`、`/api/socket.io/`、`/api/socket.io/:path*` → `${API_URL}/socket.io/`（目标带
      `/`）。
  - `afterFiles`：
    - `/api/_auth/:path*` → `${API_URL}/auth/:path*`（避免与 NextAuth 自身 `/api/auth` 冲突）。
    - `/api/:path((?!auth).*)` → `${API_URL}/api/:path*`。
    - `/uploads/:path*` → `${API_URL}/uploads/:path*`。
  - `headers()`：给 `/api/:path*` 附加简单 CORS 响应头（代理层）。

### API 启动要点

- 文件：`apps/api/src/main.ts`
  - `@fastify/multipart`（2MB/单文件）、`@fastify/static`（静态 `/uploads`）。
  - `fastifyCookie` 写/读 HttpOnly JWT Cookie。
  - `IoAdapter` 附着 HTTP，Socket.IO 路径 `/socket.io`。
  - CORS：生产用白名单（`CORS_ORIGIN=a.com,b.com`），开发允许 localhost。
  - 端口：强制用 `API_PORT=4000`，不跟随 `process.env.PORT`。

### WebSocket

- 路径：客户端用 `/api/socket.io`，rewrites 到 API `/socket.io/`。
- 鉴权：握手从 Cookie/Bearer 取 JWT，失败立即断开；每用户最多 5 个连接。

### 环境变量清单

- 端口与域名：
  - `PORT=3000`（Web 对外），`API_PORT=4000`（API 内部）。
  - `NEXTAUTH_URL`、`NEXT_PUBLIC_APP_URL`、`CORS_ORIGIN`（生产保持一致域）。
  - `NEXT_PUBLIC_API_URL=http://localhost:4000`（容器内的 API 地址）。
- 数据与安全：
  - `DATABASE_URL`、`REDIS_URL`、`JWT_SECRET`、`JWT_ACCESS_TTL_MINUTES`、`JWT_REFRESH_TTL_DAYS`。
- 上传：
  - `CLOUDINARY_ENABLED=true|false` 与 `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET`。
  - 或
    `S3_ENABLED`、`S3_ENDPOINT`、`S3_BUCKET`、`AWS_REGION`、`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`。
- Worker：
  - `WORKER_QUEUE_NAME=snapshot:queue`、`GIT_TEMP_DIR=/tmp/relax-git-repos`、`GIT_BUNDLE_DIR=/tmp/relax-git-bundles`。

### Railway 配置

- 健康检查：`/api/health`。
- 单服务镜像：根 `Dockerfile` 构建；`start.sh` 启动顺序：Web → API → Worker；后台同步
  `prisma db push`（学习版）。

### 验证清单

- **Web 页面**：`/` 可打开。
- **健康检查**：`/api/health` 200。
- **Swagger**：`/api/docs` 可访问。
- **Socket.IO**：`/api/socket.io` 握手 200（非 404），前端无“连接断开”。
- **上传**：头像/仓库封面返回 Cloudinary URL；图片正常渲染（`images.domains` 覆盖
  `res.cloudinary.com`）。
- **快照**：导入仓库 → `GET /api/artifacts/:id/status` 最终应为 `READY`，并可浏览 `tree/file`。

### 常见问题

- 404 握手：目标端缺少尾随 `/socket.io/` 或 NPM 版本不匹配。
- 跨域：生产 `CORS_ORIGIN=*` 会告警；请改成白名单逗号分隔。
- Cookie 丢失：必须同源代理或 `withCredentials`；Next rewrites 可避免跨域。

## 基础理解（部署心智模型）

- **[同源与端口]** 单容器内有三个进程：`web(3000)`、`api(4000)`、`worker`。外界只访问
  `web:3000`，其余内部通信通过容器环回。
- **[PM2 多进程]** `ecosystem.config.js` 启三进程；`start.sh`
  控制启动顺序（先 Web 再 API 最后 Worker），并在后台执行 `prisma db push`（学习版）。
- **[同源代理链路]** 浏览器 → Next(3000) → rewrites 转发 → API(4000)。WS 路径统一为
  `/api/socket.io`，目标端必须是 `/socket.io/`（尾随斜杠）。
- **[健康检查]** Railway 指向 `/api/health`；等价于 Next 代理到 API 的
  `/api/health`，用于判定容器就绪。
- **[环境变量联动]**
  - `PORT=3000`、`API_PORT=4000` 固定分工；`NEXT_PUBLIC_API_URL=http://localhost:4000` 供 Next
    rewrites 使用。
  - `NEXTAUTH_URL/NEXT_PUBLIC_APP_URL/CORS_ORIGIN` 需一致域，保证 Cookie 与 CORS 正常。
- **[排障路线]**
  1. 打开 `/api/health` 与 `/api/docs` 验证 API；2) 访问 `/api/socket.io`
     看握手是否 200；3) 查看 PM2 与容器日志定位进程异常；4) 检查 `next.config.js` rewrites 与
     `images.domains`。
- **[易混点]**
  - Web 端口不可改为 4000（外部只暴露 3000），API 固定内部 4000。
  - WS 必须 `beforeFiles` 代理且带尾随斜杠；否则握手 404。
  - 生产 CORS 拒绝 `*`，需白名单（逗号分隔）。

### 动手验证

```bash
# 1) 健康检查
curl -sS https://<domain>/api/health | jq

# 2) WS 握手（应返回 200 而非 404）
curl -I https://<domain>/api/socket.io

# 3) PM2 进程（容器内）
pm2 status && pm2 logs --lines 100

# 4) 检查 Next 代理目标（容器内）
node -e "(async()=>{const c=require('./apps/web/next.config.js');const r=await c.rewrites();console.log(r)})()"
```
