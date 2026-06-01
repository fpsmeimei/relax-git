# Relax-Git 全面审计报告

审计日期：2026-06-01

## 摘要

本次审计覆盖仓库结构、依赖供应链、认证会话、CORS/安全头、文件上传与静态资源、Git/Worker 命令执行、测试与构建健康度。当前主干可以通过 API type-check、Web type-check、API 单元测试和 Go worker 测试，但 Web 单元测试有 1 个失败，依赖审计存在 4 个 critical 与 68 个 high 漏洞。最优先处理项是 Next.js critical RCE、前端暴露 refresh token、硬编码 Cloudinary secret、shell 拼接执行 git 命令，以及已提交的用户上传文件。

## Critical

### C-1 Next.js 15.5.4 命中 critical RCE 与多项 high 漏洞

位置：
- `apps/web/package.json`
- `pnpm-lock.yaml`

证据：
- `pnpm list` 显示 `next 15.5.4`。
- `pnpm audit --audit-level high` 报告 `Next.js is vulnerable to RCE in React flight protocol`，漏洞范围 `>=15.5.0-canary.0 <15.5.7`，当前路径 `apps/web > next@15.5.4`。
- 同一次 audit 还报告 Next.js 多个 high：DoS、Middleware/Proxy bypass，补丁线至少到 `15.5.16`。

影响：
公开部署时，Next.js 服务可能受 RCE 或认证代理绕过类漏洞影响。

建议：
升级 `next` 到当前 15.x 安全补丁线，至少高于 audit 所示的 `15.5.16`；同时更新 `next-auth`/相关 peer 依赖后重新跑 build、type-check、test、audit。

### C-2 前端会话向浏览器暴露 access token 和 refresh token

位置：
- `apps/api/src/auth/auth.controller.ts:119`
- `apps/web/src/lib/auth.ts:59`
- `apps/web/src/lib/auth.ts:81`
- `apps/web/src/lib/auth.ts:95`
- `apps/web/src/app/auth/login/page.tsx:82`

证据：
- 后端登录接口设置 HttpOnly cookie 后，又在 JSON 响应体返回 `accessToken` 和 `refreshToken`。
- NextAuth `authorize` 把二者写入 user；`jwt` callback 写入 NextAuth token；`session` callback 又写入 `session.user`，客户端 `getSession()` 可读。
- 登录页读取 `session.user.accessToken`，再用 Bearer 调用 `/api/_auth/set-cookie`。

影响：
refresh token 失去 HttpOnly 保护，一旦发生 XSS 或恶意浏览器扩展读取 session，长期会话凭据可被盗用。

建议：
登录接口只通过 Set-Cookie 下发 token，不在响应体返回 refresh token。NextAuth session 只保留非敏感用户资料；如果必须做 cookie 同步，改为服务端 route handler 或后端直接统一负责 cookie。

### C-3 仓库内硬编码 Cloudinary API secret

位置：
- `scripts/migrate-images-to-cloudinary.js:23`
- `scripts/migrate-images-to-cloudinary.js:24`
- `scripts/migrate-images-to-cloudinary.js:25`

证据：
迁移脚本为 `CLOUDINARY_CLOUD_NAME`、`CLOUDINARY_API_KEY`、`CLOUDINARY_API_SECRET` 提供真实形态的 fallback 字符串。

影响：
如果这些值是真实凭据，任何拿到仓库的人都可使用 Cloudinary API。即使已失效，也会污染 Git 历史。

建议：
立即在 Cloudinary 轮换该 secret；删除硬编码 fallback；改为缺失环境变量时 fail fast；对 Git 历史做 secret 扫描。

## High

### H-1 多处 shell 字符串拼接执行 Git 命令

位置：
- `apps/api/src/repositories/services/git-validation.service.ts:123`
- `apps/api/src/repositories/services/git-validation.service.ts:185`
- `apps/api/src/repositories/services/git-validation.service.ts:249`
- `apps/api/src/repositories/services/git-validation.service.ts:279`
- `apps/api/src/snapshots/performance-optimizer.service.ts:425`

证据：
代码用 `child_process.exec` 拼接命令字符串执行 `git ls-remote` 和 `git clone --bare`。其中 `performance-optimizer.service.ts` 直接拼接 `repo.gitUrl` 与 `bareRepoPath`，没有参数数组隔离。

影响：
攻击者如能影响 Git URL、分支名或路径，可能造成命令注入；即使现有 sanitize 拦截了部分字符，仍不如 `execFile/spawn` 参数数组可靠。

建议：
统一替换为 `execFile('git', ['ls-remote', '--heads', gitUrl])` 或 `spawn`；对 Git URL 额外做协议/域名 allowlist；禁止本地路径、`file://`、内网地址 SSRF 类目标。

### H-2 依赖供应链存在 147 个 audit 漏洞

位置：
- `pnpm-lock.yaml`
- `apps/api/package.json`
- `apps/web/package.json`

证据：
`pnpm audit --audit-level high` 失败：`147 vulnerabilities found`，其中 `4 critical`、`68 high`。除 Next.js 外，还包括 `fast-xml-parser`、`handlebars`、`@fastify/middie`、`jws`、`axios` 等。

影响：
生产依赖和开发链路都存在已知 CVE 面。部分位于运行时路径，如 Next.js、AWS SDK transitive、Fastify/Nest transitive、axios。

建议：
先分运行时与 dev-only 两类治理。运行时优先：`next`、`@aws-sdk/*`、`@nestjs/platform-fastify`/Fastify、`@nestjs/jwt`/jsonwebtoken/jws、`axios`。然后处理 dev-only 的 `ts-jest > handlebars`。

### H-3 用户上传图片被提交进仓库并进入 Docker build context

位置：
- `apps/api/uploads/...`
- `.gitignore:1`
- `.dockerignore:1`

证据：
`git ls-files apps/api/uploads | wc -l` 返回 52。根 `.gitignore` 与 `.dockerignore` 没有排除 `apps/api/uploads/`。

影响：
用户数据、头像、仓库封面被纳入 Git 历史和镜像构建上下文，造成隐私、仓库膨胀、部署不可控和环境污染。

建议：
将 `apps/api/uploads/` 加入 `.gitignore` 和 `.dockerignore`；从索引移除已跟踪上传文件；生产使用对象存储或持久卷。

### H-4 Redis URL 会被完整打印到日志

位置：
- `libs/shared/src/config/redis.config.ts:16`
- `libs/shared/src/config/redis.config.ts:17`

证据：
`console.log('REDIS_URL:', redisUrl)` 会输出完整连接串，包含密码。

影响：
日志系统、CI 输出或容器日志会泄漏 Redis 凭据。

建议：
删除该日志，或只打印 host/port/db，密码和 username 必须脱敏。

### H-5 Go worker 健康检查 HTTP Server 未设置超时

位置：
- `apps/worker/health/server.go:35`

证据：
`http.Server{ Addr, Handler }` 未设置 `ReadHeaderTimeout`、`ReadTimeout`、`WriteTimeout`、`IdleTimeout`、`MaxHeaderBytes`。

影响：
如果 health server 暴露到不可信网络，存在慢请求/资源耗尽 DoS 风险。

建议：
补齐 server timeout 与 header 限制；确保健康端口只在内网或容器网络暴露。

## Medium

### M-1 API 返回服务器本地 worktreePath/bundlePath

位置：
- `apps/api/src/snapshots/artifacts.controller.ts:74`
- `apps/api/src/snapshots/artifacts.controller.ts:75`
- `apps/api/src/snapshots/artifacts.controller.ts:108`
- `apps/api/src/snapshots/artifacts.controller.ts:109`

证据：
artifact 详情接口把 `worktreePath`、`bundlePath` 返回给客户端。

影响：
泄露服务器目录结构和内部实现细节，辅助攻击者做路径、部署结构和错误排查推断。

建议：
API 响应移除本地路径字段，仅返回状态、文件树、文件内容或抽象 artifact id。

### M-2 Web 端 `/api/*` 手工设置通配 CORS 头

位置：
- `apps/web/next.config.js:115`
- `apps/web/next.config.js:121`

证据：
Next headers 对 `/api/:path*` 返回 `Access-Control-Allow-Origin: *`，而 API 服务自身也在 `apps/api/src/main.ts` 配置了 CORS 与 credentials。

影响：
代理层和后端 CORS 边界不一致，容易在 cookie 认证、预检、跨域请求中产生误判。当前 `*` 与 credential 场景也不匹配。

建议：
移除 Web 层通配 CORS，统一由 API 或边缘网关基于 allowlist 控制。

### M-3 登录/注册链路缺少一致的速率限制

位置：
- `apps/api/src/auth/auth.controller.ts:51`
- `apps/api/src/auth/auth.controller.ts:76`

证据：
`login` 有 `RateLimitGuard`，`register` 没有使用该 guard，尽管 Swagger 文档写了 429。

影响：
注册接口可被批量滥用，造成垃圾账号、数据库压力和通知/社区污染。

建议：
给 register、refresh、set-cookie 等 public/state-changing endpoint 加速率限制和审计事件。

### M-4 静态上传服务只校验 MIME，不校验文件真实内容

位置：
- `apps/api/src/upload/upload.service.ts:87`
- `apps/api/src/upload/upload.service.ts:114`
- `apps/api/src/main.ts:40`

证据：
上传只检查 `file.mimetype`，本地存储后通过 `/uploads/` 静态公开。

影响：
攻击者可伪造 MIME 上传非预期内容；虽扩展名来自原文件名且限定 image MIME，但缺少 magic bytes/解码校验。

建议：
用图片解码库或 file-type 检查 magic bytes；强制改写扩展名；本地静态响应增加 `Content-Disposition` 和严格 content-type。

## Low / Maintainability

### L-1 Web 单元测试失败

证据：
`pnpm -C apps/web test:run` 失败 1 个测试：`auth-store.test.ts` 期望 `localStorage.getItem('uid') === 'testuser'`，实际为 `null`。

建议：
如果当前设计已不单独持久化 `uid`，更新测试；否则恢复登录时写入 `uid`。

### L-2 API Jest 配置会尝试用 ts-jest 编译生成的 JS

证据：
`pnpm -C apps/api test -- --runInBand` 通过，但输出 `ts-jest` 警告，提示 Prisma generated JS 被 ts-jest 处理。

建议：
收窄 Jest transform 匹配或忽略 generated prisma-client JS。

### L-3 Web 构建配置关闭 ESLint build gate

位置：
- `apps/web/next.config.js:87`
- `apps/web/next.config.js:89`

证据：
`ignoreDuringBuilds: true`。

影响：
构建不会因 lint 问题失败，降低回归发现率。

建议：
短期保留可接受，但 CI 应增加独立 lint gate。

## 已执行验证

- `git status --short --branch`：工作区干净，`master...origin/master`。
- `pnpm -C apps/api type-check`：通过。
- `pnpm -C apps/web type-check`：通过。
- `go test ./...`（apps/worker）：通过，但所有包均为 `[no test files]`。
- `pnpm -C apps/api test -- --runInBand`：9 suites / 40 tests 通过，有 ts-jest 警告。
- `pnpm -C apps/web test:run`：失败，4 个测试文件中 1 个测试失败。
- `pnpm audit --audit-level high`：失败，147 vulnerabilities，4 critical，68 high。

## 推荐治理顺序

1. 升级 Next.js 与高危运行时依赖，直到 `pnpm audit --audit-level high` 不再阻断运行时路径。
2. 重构认证 token 流：refresh token 不进入 JSON 响应、NextAuth session 或客户端 JS。
3. 轮换 Cloudinary 凭据，删除硬编码 secret，跑 secret scanning。
4. 把所有 Git 命令从 shell string 改为参数数组执行，并补 URL allowlist/SSRF 防护。
5. 从 Git 移除 `apps/api/uploads` 用户文件，并补 `.gitignore`、`.dockerignore`。
6. 移除敏感日志和本地路径泄露。
7. 修复 Web 测试与 Jest 警告，补 worker 和关键权限流测试。
