# 后端要点（说人话版 + 详细版）

## 说人话版

- **HTTP 层**：Nest + Fastify，Swagger 在 `/api/docs`，静态 `/uploads`，端口用 `API_PORT=4000`。
- **鉴权**：全局 `JwtAuthGuard`，`JwtStrategy` 优先从 Cookie 读 `access_token`，再看 Bearer。
- **WebSocket**：Socket.IO 路径 `/socket.io`，握手校验 JWT，按
  `user:/repository:/timeline:/snapshot:` 分房间。
- **Redis**：一个服务封装三客户端（主/发布/订阅），既当缓存又当队列与 Pub/Sub。
- **快照 API**：提供
  `/status|tree|file|retry|by-branch`，自带“自愈”逻辑，缺路径/状态不一致时自动修正。

## 详细版

### 启动与基础设施

- 文件：`apps/api/src/main.ts`
  - Fastify 适配、`IoAdapter`、`@fastify/multipart`（2MB 单文件）、`@fastify/static`（`/uploads`）。
  - CORS 白名单（生产不允许 `*`，本地开发可反射 origin）。
  - `API_PORT` 固定为内部端口（与 Web 不同步）。
- 文件：`apps/api/src/app.module.ts`
  - 模块：`Database/Redis/Health/WebSocket/Auth/Upload/Users/Repositories/Snapshots/Community/Search/Comments/Members/JoinRequests/Timeline/Notifications/Chats/ChatFriends/Ai`。
  - 全局守卫：`JwtAuthGuard`（`@Public` 可放行）。

### 认证与会话

- `apps/api/src/auth/strategies/jwt.strategy.ts`：
  - 提取 JWT：Cookie `access_token` → Authorization Bearer。
  - 回源校验用户 `isActive`，注入 `request.user`。
- `apps/api/src/auth/services/token.service.ts`：
  - `signAccessToken()`、`signRefreshToken()`（带 JTI，写 Redis）与 `rotateRefreshToken()`。
  - `setAuthCookies()` 写 HttpOnly Cookie，`clearAuthCookies()` 退出清 Cookie。

### Redis 服务

- `apps/api/src/redis/redis.service.ts`：
  - 三客户端（主/发布/订阅），`publish/subscribe/psubscribe`。
  - 简易队列：`enqueue/dequeue`（`lpush/brpop`），`getQueueLength`，健康检查。

### WebSocket 网关

- `apps/api/src/websocket/websocket.gateway.ts`：
  - `@WSGateway({ path:'/socket.io', transports:['websocket','polling'] })`。
  - 握手：从 Cookie/Bearer 提取 JWT → 回源查用户 → 限制单用户最多 5 连接。
  - 订阅 `snapshot:status:*`，把 Worker 发布的状态转发到 `snapshot:<id>` 房间。
  - 房间：`user:*`、`repository:*`、`timeline:*`、`snapshot:*`；提供聊天/通知/时间线的 emit 方法。

### 快照与文件访问

- `apps/api/src/snapshots/base-snapshot.service.ts`：
  - 创建/更新基础快照，状态 `QUEUED/PROCESSING/READY/FAILED`，`enqueueBaseSnapshotTask()`
    入 Redis 队列。
  - `ensureArtifact(repoId, commitSha, branchId?)` 幂等复用与失败重试。
- `apps/api/src/snapshots/artifacts.controller.ts`：
  - `/api/artifacts/:id/status|tree|file|retry|by-branch`。
  - 自愈：`processedAt && worktreePath && status !== READY` 时写回 READY，避免前端卡转圈。
- `apps/api/src/snapshots/services/unified-snapshot.service.ts`：
  - `getTree/getFile` 做路径净化（防遍历）与大小限制（10MB）。
  - Windows → Linux 路径自愈（如 `C:\temp\relax-git-repos` → `/tmp/relax-git-repos`）。
  - 会话快照共享基础快照的工作树；可续期与释放。

### 上传

- `apps/api/src/upload/upload.service.ts`：
  - Cloudinary/S3/Local 三态；`CLOUDINARY_ENABLED` 兼容字符串 `'true'`。
  - 头像/仓库封面统一走该服务（此前封面直写本地已修复）。

### 健康与可观测

- `apps/api/src/health/*`：健康检查（含 Redis/DB）与简单统计。
- 统一日志：关键位置打印成功/失败与修复动作日志，便于生产排错。

## 基础理解（一次后端请求如何被处理）

- **[HTTP 入口]** `apps/api/src/main.ts` 创建 Fastify 实例并挂载：
  - `@fastify/cookie` 解析 HttpOnly Cookie；`@fastify/multipart` 限制上传；`@fastify/static` 暴露
    `/uploads`。
  - 全局 `ValidationPipe` 与异常过滤器统一输入/输出。
- **[鉴权链路]** 全局 `JwtAuthGuard` 拦截：
  - `JwtStrategy` 先取 Cookie `access_token`，再取 Header Bearer；验证用户活跃态，注入
    `request.user`。
  - 标注 `@Public()` 的路由跳过鉴权（如健康检查等）。
- **[快照 API 心智模型]** `apps/api/src/snapshots/*`：
  - `BaseSnapshotService.ensureArtifact()`：幂等创建/复用→`lpush snapshot:queue`→返回 artifact 记录。
  - `ArtifactsController.getArtifactStatus()`：若
    `processedAt && worktreePath && status !== READY`，立即“自愈”为 `READY` 防止前端卡住。
  - `getTree/getFile`：`UnifiedSnapshotService`
    做路径净化（拒绝绝对/..）、大小限制（10MB），读取并排序目录/文件。
  - Windows→Linux 路径自愈：`autoFixWindowsPath('C:\\temp\\...'→'/tmp/...')` 并回写 DB。
- **[WebSocket]** `apps/api/src/websocket/websocket.gateway.ts`：
  - `@WSGateway({ path:'/socket.io' })` 附着 HTTP；握手从 Cookie/Bearer 取 JWT，限制单用户连接数；按
    `user:/repository:/timeline:/snapshot:` 分房间。
  - 订阅 Redis `psubscribe('snapshot:status:*')`，把 Worker 发布的状态转发到房间 `snapshot:<id>`。
- **[Redis 抽象]** `apps/api/src/redis/redis.service.ts`：
  - 三客户端（主/发布/订阅）；封装 `enqueue/dequeue`（`lpush/brpop`）与
    `publish/psubscribe`；提供健康检查与长度查询。
- **[上传心智模型]** `apps/api/src/upload/upload.service.ts`：
  - 统一入口：头像/仓库封面都走这里；优先 Cloudinary（解析 `CLOUDINARY_ENABLED`
    字符串→布尔），否则 S3，否则本地。
  - Cloudinary 使用 `upload_stream`，配置 `folder=relax-git` + 自动格式/质量，返回
    `secure_url`；S3 返回可直链；本地返回 `/uploads/...`。
- **[易混点澄清]**
  - “`processedAt=true` 但 `status=QUEUED`”：自愈逻辑会修；新任务由 Worker 根本修复保障。
  - “文件树读不到/路径报错”：多为路径净化触发或工作树缺失；刷新后由自愈/重入队恢复。
  - “Cookie 不生效”：确保同源代理（Next rewrites）与 `withCredentials`，服务端优先读 Cookie。
