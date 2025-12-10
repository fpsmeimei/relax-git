# Worker 要点（说人话版 + 详细版）

## 说人话版

- **职责**：盯 Redis 队列拿任务 → `git clone → worktree → bundle`
  → 写回数据库 → 通过 Redis 发布状态，前端实时更新。
- **为什么用 Go**：并发 + I/O + 调 git CLI 更合适，避免阻塞 Node 服务。
- **关键修复**：
  - `git bundle create --all` 避免空 bundle。
  - PG 写入显式 `::base_snapshot_status`，状态不再错写。
  - 启动时清理残留临时目录，防脏数据影响后续任务。

## 详细版

### 处理流程（快照）

1. API `BaseSnapshotService.enqueueBaseSnapshotTask()` 将任务 `lpush snapshot:queue`。
2. Worker `RedisQueue.Consume()` 用 `BRPOP` 阻塞取出任务。
3. `Processor.processTask()`：先置 `PROCESSING` → 调用 `GitOperations.ProcessSnapshot()`。
4. `GitOperations`：
   - `cloneRepository()` 支持任务/全局代理（HTTP(S)\_PROXY）。
   - `createWorktree()` 产出 `worktree-<taskID>-output`，已存在先强制清理（含
     `git worktree remove --force`）。
   - `createBundle()` 使用 `git bundle create <file> --all`。
5. `PostgresDB.UpdateBaseSnapshotPaths()` 写 `worktree_path/bundle_path` 并置 `READY`（或
   `FAILED`）。
6. `RedisQueue.PublishStatus("snapshot:status:<id>")`，API WS 网关订阅并转发到房间 `snapshot:<id>`。

### 关键代码与文件

- `apps/worker/worker/processor.go`
  - 并发控制：`semaphore + WaitGroup`，优雅停止。
  - 健康检查：启动时检查 Redis/DB；同时消费 `search:queue`（搜索旁路）。
- `apps/worker/git/operations.go`
  - 启动清理残留（`cleanupOnStartup()`）。
  - 仓库体积检查，过大直接失败（保护资源）。
  - 创建 worktree 前先尝试移除旧同名路径，避免冲突。
  - Bundle 改为 `--all`，修复“空 bundle”问题。
- `apps/worker/database/postgres.go`
  - `UpdateBaseSnapshotStatus()`：`status = $1::base_snapshot_status`。
  - `UpdateBaseSnapshotPaths()`：同时置 `processedAt = NOW()`，写后读校验日志。
- `apps/worker/queue/redis.go`
  - `BRPOP` 阻塞消费、错误重试延迟、发布状态与状态缓存（TTL）。
- `apps/worker/main.go`
  - Cobra CLI、健康 HTTP（:3002）、开机诊断执行 `/app/diagnose`。

### 路径与环境

- 临时目录：`/tmp/relax-git-repos`（worktree）与 `/tmp/relax-git-bundles`（bundle）。
- Git 全局配置需在运行用户下设置（非 root）：`user.name`、`user.email`、`init.defaultBranch`。
- 代理：任务级优先（`task.ProxyConfig`）→ 配置文件回退（`config.Git.HTTPProxy/HTTPSProxy`）。

### 失败与自愈策略

- 处理失败：置 `FAILED`，记录 `errorMessage`。
- READY 但缺路径：API 端检测到后会重置为 `QUEUED` 并重新入队（`ensureArtifact()` 或 `retry`）。
- 路径指向 Windows 盘符：API 端自动修复到 Linux 路径并回写 DB。

### 常见坑与排查

- **空 bundle**：确保 `git bundle create --all`；日志会输出 bundle 路径。
- **Git 未配置**：必须在目标用户下 `git config --global`；切换用户后配置会丢。
- **临时目录残留**：启动清理；若多次失败，手动排查 `worktree-*-output` 是否可读写。
- **仓库过大**：体积阈值命中直接失败，避免磁盘爆炸。

### 健康与监控

- 健康 HTTP：:3002 输出 Worker 版本与活跃协程计数（实现位于 `health` 包）。
- 日志：零日志（`rs/zerolog`），统一结构化字段，便于云端检索。

## 基础理解（从队列到就绪）

- **[队列语义]** API 侧 `lpush snapshot:queue`，Worker 侧 `BRPOP`
  阻塞消费，提供“至少一次”投递语义。失败可能重复处理，因此需要以 `artifactId`
  做幂等（重复写 READY 也应安全）。
- **[状态机]** `QUEUED → PROCESSING → READY/FAILED`：
  - 进入处理：`UpdateBaseSnapshotStatus(id, PROCESSING)`（SQL 中显式
    `::base_snapshot_status`，避免枚举类型错写）。
  - 成功：`UpdateBaseSnapshotPaths(id, worktreePath, bundlePath, READY)` 并置 `processedAt=NOW()`。
  - 失败：写 `FAILED` 与 `errorMessage`。
- **[Git 操作]** `clone → worktree → bundle`：
  - worktree 目录名包含 taskID，避免冲突，创建前尝试移除旧路径。
  - bundle 使用 `git bundle create <file> --all`，避免 HEAD 为空导致的“空 bundle”。
  - 支持任务/全局代理（`HTTPS_PROXY/HTTP_PROXY`）。
- **[发布订阅]** 更新 DB 后 `PublishStatus('snapshot:status:<id>')`；API 的 `websocket.gateway.ts`
  `psubscribe('snapshot:status:*')` 并转发到房间 `snapshot:<id>`，前端据此刷新。
- **[与 API 的自愈协作]**
  若 READY 但路径缺失或 Windows 路径写入：API 端发现后可重置为 QUEUED 并重新入队，或直接修正路径为 Linux 风格并回写 DB。
- **[并发与限流]** `WORKER_CONCURRENCY`
  控制并发；当 I/O 瓶颈或磁盘 IOPS 飙升时应优先减并发与退避重试，而非盲目加速。

### 动手实验

```bash
# 观察队列长度（示例：ioredis/redis-cli 皆可）
redis-cli LLEN snapshot:queue

# 手工发布一次状态（便于前端连通性自测）
redis-cli PUBLISH snapshot:status:<id> '{"id":"<id>","status":"READY"}'
```

### 易混点澄清

- **至少一次 vs 恰好一次**：`BRPOP` 无法保证“恰好一次”，幂等由业务侧（artifactId）保障。
- **HEAD vs --all**：企业/镜像仓库常见 HEAD 不可靠，使用 `--all` 更稳。
- **Git 配置位置**：必须在运行用户下设置全局配置（非 root），否则切换用户后配置失效。
