# 前端要点（说人话版 + 详细版）

## 说人话版

- **路由与鉴权**：中间件只放行首页、`/auth/*`、`/health`，其他都要登录。
- **登录怎么走**：前端用 `next-auth@5` 的 Credentials 调 API
  `POST /api/_auth/login`（通过 Next 代理），后端写 HttpOnly Cookie。
- **请求怎么发**：所有 `/api/*` 自动代理到 API 服务；WebSocket 用 `/api/socket.io`，避免跨域。
- **图片怎么配**：`next.config.js images.domains` 动态汇总 Cloudinary、GitHub 头像、CDN 域名。

## 详细版

### 认证与中间件

- 文件：`apps/web/src/middleware.ts`
  - 放行：`/`、`/auth/*`、`/health`。
  - 未登录访问其他路径 → 302 到 `/auth/login?callbackUrl=...`。
  - 已登录访问 `/auth/*` → 302 到首页。
- 文件：`apps/web/src/lib/auth.ts`、`auth.config.ts`
  - Credentials Provider 调用 `${API_BASE}/api/_auth/login`，SSR/客户端均通过 Next 代理；成功后将
    `accessToken/refreshToken` 注入 JWT/Session（显示用，后端仍以 Cookie 为准）。

### 代理与重写（WS 重点）

- 文件：`apps/web/next.config.js`
  - `beforeFiles`：
    - `/api/socket.io`、`/api/socket.io/`、`/api/socket.io/:path*` →
      `${API_URL}/socket.io/`（目标带尾随斜杠，修复 Engine.IO 404）。
  - `afterFiles`：
    - `/api/_auth/:path*` → `${API_URL}/auth/:path*`（避开 NextAuth 自己的 `/api/auth`）。
    - `/api/:path((?!auth).*)` → `${API_URL}/api/:path*`。
    - `/uploads/:path*` → `${API_URL}/uploads/:path*`。
  - `headers()`：对 `/api/:path*` 追加简单 CORS 响应头（代理层）。

### 图片与静态资源

- `images.domains`：聚合
  `localhost/127.0.0.1`、`res.cloudinary.com`、GitHub 头像域、`NEXT_PUBLIC_APP_URL`、`NEXT_PUBLIC_IMAGE_DOMAINS`、`CDN_DOMAIN`
  等。
- `/uploads/*` 也走代理转到 API 静态服务（`@fastify/static`）。

### WebSocket 客户端

- 使用 `socket.io-client@4`：连接路径 `/api/socket.io`，`withCredentials: true`
  以发送 Cookie。握手由后端 `JwtStrategy`/WS 网关读取 Cookie `access_token`。
- 房间与事件：
  - `snapshot:<id>` 收 `snapshot:status-changed`。
  - `timeline:<repoId>` 收 `timeline:new-event`。
  - `user:<userId>` 收通知、未读、私信等。

### 数据与状态

- `@tanstack/react-query@5` 管网络请求缓存与失效；`Zustand` 管本地 UI 状态。
- 大文件与安全：前端调用时路径均为相对路径，后端进行路径净化与大小限制（10MB）。

### 常见坑

- 忘了给 WS 目标加尾随 `/socket.io/` 会握手 404。
- `NEXT_PUBLIC_API_URL` 未指向 `http://localhost:4000` 导致 proxy 失败。
- Cloudinary 域名没加入 `images.domains` 导致图片不显示。

## 基础理解（从一次请求开始）

- **[API 代理心智模型]** 浏览器请求 `/api/*` 并不会直达后端，而是先到 Next：
  - `apps/web/next.config.js` 的 `rewrites()` 将 `/api/_auth/*` 转发到 `${API_URL}/auth/*`；其它
    `/api/:path((?!auth).*)` 转 `${API_URL}/api/:path*`。
  - WebSocket 走 `/api/socket.io`，在 `beforeFiles` 优先转发到
    `${API_URL}/socket.io/`（目标端必须带尾随斜杠）。
- **[登录链路（Credentials）]**
  1. 前端通过 `next-auth@5` 的 Credentials Provider 调用 `/api/_auth/login`（Next 代理到 API 的
     `/auth/login`）。
  2. 后端验证成功后写入 HttpOnly Cookie（`access_token/refresh_token`）。
  3. NextAuth 还会把 `accessToken/refreshToken`
     放到 session（仅用于前端显示/调用备选，核心仍以 Cookie 为准）。
  4. 之后 SSR/CSR/WS 都共享同源 Cookie，无需额外携带 Header。
- **[中间件与重定向]** `apps/web/src/middleware.ts`：
  - 仅放行 `/`、`/auth/*`、`/health`。
  - 未登录访问受保护页面 → 重定向到 `/auth/login?callbackUrl=...`。
  - 已登录访问 `/auth/*` → 重定向到首页（`NEXT_PUBLIC_HOME_ROUTE` 可定制）。
- **[WS 握手与房间]**
  - 客户端：`io('/api/socket.io', { withCredentials:true })`。
  - 服务端网关读取 Cookie/Bearer 做鉴权，并将连接加入
    `user:*`、`repository:*`、`timeline:*`、`snapshot:*` 等房间。
  - 快照状态通过房间 `snapshot:<id>` 广播到前端，触发 UI 刷新。
- **[图片域名与上传展示]**
  - Cloudinary 返回 `https://res.cloudinary.com/...`；需在 `images.domains` 中包含
    `res.cloudinary.com` 才能由 Next Image 渲染。
  - 本地 `/uploads/*` 也通过 rewrites 代理到 API 的静态目录。

### 动手实验

```ts
// WS 连接实验（浏览器控制台）
import { io } from 'socket.io-client';
const s = io('/api/socket.io', { withCredentials: true });
s.on('connect', () => console.log('connected', s.id));
s.on('snapshot:status-changed', e => console.log('snapshot status', e));
```

```bash
# 检查图片是否可被 Next Image 信任
node -e "console.log(require('./apps/web/next.config.js').images?.domains)"
```

### 易混点澄清

- **`beforeFiles` vs `afterFiles`**：WS 必须放 `beforeFiles`，避免被通配 `/api/:path((?!auth).*)`
  抢先匹配。
- **Cookie vs Header**：同源代理后，Cookie 是首选凭证；前端无需在每个请求手动加 Bearer。
- **Cloudinary 开关**：`.env` 里是字符串
  `'true'/'false'`，后端已做布尔解析；若不生效看 API 启动日志。
