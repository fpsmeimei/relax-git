# 面试问题与答案（涵盖架构/快照/WS/认证/上传/部署）

## 基础问答（简短）

- **[架构]** 为什么单容器全栈？
  - 降低部署复杂度；Next 代理 API/WS 避免跨域与 Cookie 问题；PM2 管多进程即可。
- **[快照]** 为什么做 Base Snapshot？
  - 以分支/commit 为粒度的可复用工件，避免重复计算；会话快照共享同一 worktree，节省磁盘与时间。
- **[WS]** 为什么路径要用 `/socket.io/` 尾随斜杠？
  - 兼容 Engine.IO 握手路径解析，避免 404；Next `beforeFiles` 先行代理。
- **[认证]** 为什么把 JWT 放 Cookie？
  - HttpOnly 更安全；WS 握手可直接读 Cookie；服务端 SSR 也更好处理。
- **[上传]** 为什么统一走 `UploadService`？
  - 配置与安全集中；Cloudinary/S3/本地可切换；避免控制器绕过服务造成不一致。

## 深入问答（详细）

- **[幂等与自愈]** 如何保证 `READY` 但缺 `worktreePath` 时不卡死？
  - API `ArtifactsController`/`UnifiedSnapshotService` 发现不一致会重置为 `QUEUED`
    并重新入队；同时修复 Windows→Linux 路径并回写 DB。
- **[一致性]** Worker 与 API 如何同步状态？
  - Worker 更新 DB 后 `publish(snapshot:status:<id>)`；API WS 网关 `psubscribe` 转发到
    `snapshot:<id>`，前端据此刷新轮询/界面。
- **[安全]** 如何防止路径遍历？
  - 所有文件/目录读取通过 `path.resolve` 与前缀校验，拒绝
    `..`、绝对路径与超出 root 的目标；并限制文件大小 10MB。
- **[扩展性]** 单容器如何演进多服务？
  - 把 Worker/API/Web 拆成独立服务，保留 Redis/DB；Next 的 rewrites 仍可指向 API 域；WS 走独立网关或同 API 进程均可。
- **[可靠性]** 队列为何不选 BullMQ？
  - 学习项目选用轻量 `lpush/brpop` 方案以便 Go/Node 跨语言；若要高级特性可平滑切到 BullMQ/Stream。

## 系统设计场景题

- **[场景]** 海量导入仓库导致磁盘爆炸如何处理？
  - 仓库体积上限；LRU 清理策略；bundle 与 worktree 分层存储；冷热分离到对象存储；限流与队列长度报警。
- **[场景]** 某云厂商偶发 429，快照大量失败？
  - 退避重试、代理池、失败重试上限与死信队列；面向目标仓库做失败熔断与延迟重排。
- **[场景]** WebSocket 连接不稳定？
  - 连接健康心跳、自动重连、降级轮询；端上 withCredentials；服务端连接上限与灰度切换。

## 性能与调优

- `git clone` 加速：浅克隆 + 镜像缓存；只拉需要的 refs。
- worktree 并发数：按 CPU/IO 调整 `WORKER_CONCURRENCY`，避免抖动。
- 代理：按 Git 平台地域就近选择代理；失败监控。

## 3 分钟讲稿模板

1. **一句话定位**：单容器全栈的代码协作平台，核心是“可复用快照 + 实时通知”。
2. **核心链路**：导入 → 入队 → Worker 处理 → DB 写入 → Redis 发布 → WS 转发 → 前端展示。
3. **关键难点**：
   - Git CLI 的空 bundle/权限/代理问题。
   - READY 但缺 `worktreePath` 时不卡死，通过自愈与重试解决。
   - WS 跨域与握手路径坑，尾随斜杠 + beforeFiles 兜底。
4. **成果**：部署一体化、稳定可用、易扩展。

## 代码走查要点（面试官关注）

- `apps/api/src/snapshots/base-snapshot.service.ts`：入队与错误回滚。
- `apps/api/src/snapshots/artifacts.controller.ts`：自愈点位与 REST 边界。
- `apps/api/src/websocket/websocket.gateway.ts`：握手鉴权、房间划分、订阅 Redis。
- `apps/worker/git/operations.go`：`--all`、清理策略、代理注入点。
- `apps/web/next.config.js`：`beforeFiles` 代理 WS；`images.domains` Cloudinary。

---

## 常见深挖追问与真实坑位还原

- **[WS 握手 404]** 为什么一定要把 Socket.IO 代理放在 `beforeFiles` 且目标使用尾随斜杠？
  - `apps/web/next.config.js` 中 `beforeFiles` 先于其它重写生效，保证 `/api/socket.io` 不被后续
    `/api/:path((?!auth).*)` 误代理。
  - 目标端使用 `${API_URL}/socket.io/`（注意尾随
    `/`）是为兼容 Engine.IO 握手路径解析，否则容易 404。
- **[READY 但缺 worktreePath]** 前端卡转圈如何“自愈”？
  - `apps/api/src/snapshots/artifacts.controller.ts` 的 `getArtifactStatus/getTree/getFile()`：检测
    `processedAt && worktreePath && status !== READY` 时直接写回 READY，避免阻塞 UI。
  - `apps/api/src/snapshots/services/unified-snapshot.service.ts`：`autoFixWindowsPath()` 将
    `C:\temp\...` 修复为 `/tmp/...` 并回写 DB；必要时调用 `BaseSnapshotService.ensureArtifact()`
    重新入队（内部用 `enqueueBaseSnapshotTask()`）。
- **[Cloudinary 开关]** 为何要显式把 `'true'` 解析成布尔？
  - `apps/api/src/upload/upload.service.ts` 将 `CLOUDINARY_ENABLED` 从字符串安全解析为布尔，避免生产
    `.env` 写法导致逻辑误判；并输出启动日志，便于排障。
- **[Git 空 bundle]** 为什么用 `--all` 而不是 `HEAD`？
  - 有些仓库 HEAD 不指向任何 ref（或镜像不完整）会导致空 bundle；`git bundle create <file> --all`
    更稳。
- **[Cookie 鉴权]** 为什么 WS 握手优先 Cookie 而非仅 Header？
  - `apps/api/src/auth/strategies/jwt.strategy.ts` 与
    `websocket.gateway.ts`：SSR/WS 同源部署下 Cookie 传递最稳，减少跨域场景对 Header/LocalStorage 的依赖与风险。
- **[订阅模型]** 为什么用 `psubscribe('snapshot:status:*')`？
  - 主题数量随快照增长，用模式订阅避免逐条管理；事件转发到房间
    `snapshot:<id>`，前端无需关心 Redis 细节。

## 端到端验证与排障命令

```bash
# 健康检查（Railway）
curl -sS https://<domain>/api/health | jq

# 快照状态
curl -sS -b cookies.txt -c cookies.txt \
  https://<domain>/api/artifacts/<id>/status | jq

# 文件树 / 文件内容
curl -sS -b cookies.txt -c cookies.txt \
  --get 'https://<domain>/api/artifacts/<id>/tree' --data-urlencode 'path=' | jq
curl -sS -b cookies.txt -c cookies.txt \
  --get 'https://<domain>/api/artifacts/<id>/file' --data-urlencode 'path=README.md' | jq

# 触发重试（需要仓库 OWNER/ADMIN）
curl -X POST -sS -b cookies.txt -c cookies.txt \
  https://<domain>/api/artifacts/<id>/retry | jq
```

```ts
// 前端临时连测（控制台）
import { io } from 'socket.io-client';
const socket = io('/api/socket.io', { withCredentials: true });
socket.on('connect', () => console.log('ws connected', socket.id));
socket.on('snapshot:status-changed', m => console.log('status', m));
```

## SLI/SLO 与可观测

- **[SLI]** 快照 TTR（Time-to-READY）、队列长度/滞留时间、WS 握手成功率、API 5xx 比例、上传成功率。
- **[SLO]** 80% 快照在 60s 内 READY；WS 握手成功率 ≥ 99%；API 5xx ≤ 0.5%。
- **[日志定位]**
  - API：`[UnifiedSnapshotService]`、`[ArtifactsController]`、`[UploadService]` 关键日志。
  - Worker：`UpdateBaseSnapshotStatus/Paths` 写后读校验、`git bundle create --all` 路径与大小输出。

## 容量规划与性能

- **[磁盘]** worktree
  ≈ 仓库大小；bundle 取决于 refs 数与差异。定期清理过期快照与临时目录（Worker 启动自清理）。
- **[并发]** `WORKER_CONCURRENCY` 按 CPU/IO 调整；网络/磁盘瓶颈时优先限流而非盲目加并发。
- **[代理]** 面向目标托管平台选择就近代理；失败/延迟监控与熔断。

## 安全审计清单（快速过）

- **鉴权**：全局 `JwtAuthGuard`；WS 握手校验 + 每用户连接上限（`websocket.gateway.ts`）。
- **输入**：`unified-snapshot.service.ts` 的路径净化与大小限制（10MB）。
- **Cookie**：HttpOnly + 同源代理（Next rewrites）保证凭证传递与隔离。
- **速率**：登录/上传/导入限频；队列长度报警。

## 可演进方向

- 多服务拆分（Web/API/Worker 独立扩缩），保留 Redis/DB；WS 可接入独立网关。
- 快照对象存储化：worktree 本地 + bundle/封面走 S3/Cloudinary，长远降本。
- 预热与缓存：热门仓库/分支预生成快照，前端 tree/file 缓存。

## 行为与权衡类题

- **一次典型故障复盘**：
  - 现象：浏览代码卡转圈；API `status=QUEUED`。
  - 根因：Worker HEAD 打包空 bundle + 状态写入枚举类型未显式 cast；API/WS/Redis 配置不一致。
  - 修复：Worker `--all` + `::base_snapshot_status`、API 自愈与重入队、Next
    rewrites/WS 路径修正、环境诊断工具补齐。
- **技术取舍**：
  - 队列：轻量 `lpush/brpop`（跨语言简洁） vs BullMQ（功能齐全）。
  - 上传：Cloudinary（免运维、开箱 CDN） vs S3（可控、成本可优化）。
  - 凭证：Cookie（HttpOnly、安全） vs LocalStorage（易用但风险高）。

## 现场速答清单（One-liners）

- 快照 READY 但缺路径？“API 自愈+Windows 路径修复+必要时重入队，前端不中断。”
- WS 404？“把代理放 beforeFiles，目标 `/socket.io/` 带尾随斜杠。”
- Cloudinary 不生效？“检查 `CLOUDINARY_ENABLED` 字符串转布尔与三项密钥，并看启动日志。”
- 队列暴涨？“限并发、限速、退避重试、死信与告警，热门仓库做预热。”

---

## 专项问答（更贴近真实面试）

- **[Next.js]** `beforeFiles`、`afterFiles` 与 `fallback` 的实际差异？
  - `beforeFiles` 先匹配，适合高优先级代理（如 `/api/socket.io`）。`afterFiles`
    再匹配，适合通配 API 代理（如 `/api/:path((?!auth).*)`）。本项目未用 `fallback`（保留空）。
- **[NextAuth@5]** Credentials 登录如何保证 SSR 与 WS 同步生效？
  - 通过 Next rewrites 代理后端 `/auth/login`，后端写入 HttpOnly
    Cookie；SSR/WS 均走同源域名，自然携带 Cookie。
- **[Middleware]** `matcher` 如何避免误拦截静态资源？
  - 使用负向前瞻排除
    `_next/static|_next/image|favicon|robots|.(svg|png|jpg|gif|webp|ico|css|js)`，参考
    `apps/web/src/middleware.ts`。
- **[CORS/预检]** 既然同源代理了，为何还在 `headers()` 返回 CORS？
  - 主要面向直接访问 API 的场景与本地调试；生产建议严格白名单，避免 `*`。
- **[NestJS]** Fastify 的好处与注意事项？
  - 更高吞吐与更低开销；需使用 `@fastify/*` 插件（multipart/static/cookie），与 Express 插件不通用。
- **[Prisma]** 如何避免长事务与连接池耗尽？
  - 事务仅包裹必要读写；合理 `pool.max`；热点表加索引；禁止阻塞 I/O（如网络调用）置于事务内。
- **[Redis 队列]** BRPOP 的至少一次语义与幂等？
  - 消费失败可能重复投递；通过 artifactId 做幂等防重；失败回退与重试延迟、死信队列可选。
- **[Worker 并发]** 如何设定 `WORKER_CONCURRENCY`？
  - 以 CPU\*2 与 I/O 瓶颈权衡起步；观察 TTR、失败率、磁盘 IOPS 曲线动态调参。
- **[Git 代理]** 企业网络下如何配置？
  - 任务级优先（读取任务场景变量），回退配置文件代理；为 `git` 子进程注入
    `HTTPS_PROXY`/`HTTP_PROXY`。
- **[上传安全]** 仅靠 `mimetype` 校验够吗？
  - 需配合白名单、大小限制、扩展名匹配与（必要时）内容嗅探；Cloudinary 默认会做格式处理与 CDN 缓存。
- **[安全基线]** 目录遍历、XSS、CSRF 如何管控？
  - 路径净化 + 大小限制；前端输出转义；登录与高危操作走同源 Cookie 并结合 CSRF
    Token（NextAuth 自带防护机制，不跨域时风险更低）。

## 测试与质量保障

- **单元测试**：
  - `unified-snapshot.service.ts`：路径净化、超大文件、Windows→Linux 修复分支。
  - `upload.service.ts`：Cloudinary/S3/Local 分支与异常打桩。
- **集成/E2E**：
  - `artifacts.controller.ts`：导入→入队→READY→tree/file 全链路；利用 Redis/DB 测试容器或 testcontainers。
- **契约测试**：
  - Web 与 API 的 `/api/artifacts/*` schema 对齐（zod/openapi）。
- **回归清单**：
  - WS 握手、快照 READY、自愈触发、上传与图片展示、认证跳转、权限拦截。

## CI/CD 与变更管理

- **蓝绿/灰度**：先在影子环境验证 `/api/health`、`/api/docs`、WS 握手，再切流。
- **回滚**：镜像与数据库 schema 需兼容；避免向后不兼容迁移；必要时 `feature flag`。

## 数据库与索引策略

- 为 `base_snapshots(repoId, branchId)`、`session_snapshot(userId, baseSnapshotId, status)`
  建联合索引。
- 读多写少场景下，利用覆盖索引减少回表；谨慎使用 `LIKE '%xxx'`。
- 大事务拆小；避免在事务中做外部 I/O（如 Redis/HTTP）。

## 可观测性与监控

- **日志**：API（Nest Logger）与 Worker（zerolog）统一结构化字段，如
  `snapshotId`、`repoId`、`commitSha`、`durationMs`。
- **指标**：TTR/队列长度/WS 连接数/上传成功率/5xx；阈值报警（Slack/Email）。
- **追踪**：可引入 OpenTelemetry（HTTP/WS/Redis/DB），但需评估开销。

## 压测与容量规划

- **快照链路压测**：按仓库大小、并发导入数、网络限速维度分层压测；关注磁盘 IOPS、Redis RTT、DB TPS。
- **WS 压测**：连接上限策略与广播风暴；逐步扩大房间数与消息频率。

## 跨区域与多环境

- 同构部署于多个区域：Redis/DB 延迟与一致性挑战；建议读本地写主或引入事件总线。
- 多环境（dev/staging/prod）使用不同 `NEXTAUTH_URL/CORS_ORIGIN` 与资源前缀，防止串域。

## 白板/现场任务清单（供练习）

- 设计“仓库导入限流 + 排队可视化”的 API 与前端页面。
- 编写一个“清理过期 worktree”任务（API 定时或 Worker 周期），附安全删除策略。
- 为 `getTree/getFile` 增加缓存层（ETag/Last-Modified 或 Redis 缓存），并评估一致性风险。
- 在不中断用户的情况下，将 Cloudinary 切换为 S3（含回滚方案）。

## 基础理解提示卡（速记）

- **[同源代理]** Next `rewrites` 让 `/api/*` 与 `/api/socket.io`
  指向 API；Cookie(SSR/WS) 可直接用；WS 目标需 `/socket.io/`。
- **[快照心智模型]** `ensureArtifact()` → `lpush snapshot:queue` → Worker `BRPOP` →
  `git clone/worktree/bundle --all` → DB 写 `READY+worktreePath` → 发布 `snapshot:status:<id>`
  → 前端拉 `tree/file` 渲染。
- **[自愈]** `processedAt && worktreePath && status !== READY` → API 写回 READY；Windows 路径 →
  Linux 路径修复并回写 DB；必要时重入队。
- **[上传]** 统一走 `UploadService`：Cloudinary(优先) → S3 → 本地；`CLOUDINARY_ENABLED`
  是字符串需转布尔；`images.domains` 包含 `res.cloudinary.com`。
- **[鉴权]** 全局 `JwtAuthGuard`；`JwtStrategy` 优先 Cookie；WS 握手同理；每用户连接上限防滥用。
- **[Redis 语义]** 队列“至少一次”，用 artifactId 幂等；发布订阅用
  `psubscribe('snapshot:status:*')`。
- **[部署]** 单容器三进程（web/api/worker）；对外只暴露 3000；`/api/health`
  健康；`NEXT_PUBLIC_API_URL` 设 `http://localhost:4000`。
