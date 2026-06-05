# Relax-Git

Relax-Git 是一个面向毕业设计演示的开发者代码社交平台。

当前版本的目标不是上线公网，而是保证在 macOS 本地稳定运行，并能顺畅演示这条主链路：

`社区发现仓库 -> 浏览仓库详情 -> 进入代码快照 -> 评论互动 -> 私信连接 -> 控制台查看平台状态`

## 本地演示环境

这个仓库现在只保留 macOS 本地演示路径。

本地需要运行 5 个部分：

1. `web`：前端页面与控制台入口
2. `api`：业务接口、认证、社区数据、控制台聚合
3. `worker`：仓库导入、快照任务、健康检查
4. `postgres`：业务数据
5. `redis`：缓存与队列

## 环境要求

- Node.js 20+
- pnpm 8+
- Docker CLI + Docker Compose
- OrbStack 可替代 Docker Desktop
- Go 1.22+

## 最短启动路径

### 1. 首次准备

只需要执行一次，或在依赖变更后重新执行：

```bash
pnpm install
pnpm db:generate
pnpm -C libs/shared build
```

如果本地还没有 `.env`，先从示例文件复制：

```bash
cp .env.example .env
```

### 2. 启动数据库和缓存

```bash
pnpm docker:dev
```

第一次启动、重置数据库后，补一次初始化：

```bash
pnpm db:setup
```

### 3. 启动 Web 和 API

```bash
pnpm dev
```

### 4. 启动 Worker

在另一个终端执行：

```bash
cd apps/worker
go run .
```

如果 Worker 配置有变更，可以先参考：

- [apps/worker/README.md](/Users/fpsmeimei/Projects/relax-git/apps/worker/README.md)
- [apps/worker/config.example.yaml](/Users/fpsmeimei/Projects/relax-git/apps/worker/config.example.yaml)

## 本地访问地址

- Web：首页/社区：[http://localhost:3000](http://localhost:3000)
- API 文档：[http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- API 健康检查：[http://localhost:3001/api/health](http://localhost:3001/api/health)
- Worker 健康检查：[http://localhost:3002/health](http://localhost:3002/health)
- 管理控制台：[http://localhost:3000/console](http://localhost:3000/console)

## 答辩彩排建议顺序

建议按这个顺序做本地彩排：

1. 打开首页或社区页，确认前台可以访问
2. 登录你手动创建的真实本地账号，确认用户态页面正常
3. 进入社区仓库详情，演示仓库发现与浏览
4. 进入快照/评论链路，演示代码讨论能力
5. 进入消息中心，演示私信与社交连接
6. 使用管理员账号进入 `/console`，演示平台概览、内容动态和系统状态

## 账号准备原则

本地演示只允许使用你手动创建的真实本地数据。

不再提供：

1. 预置演示账号
2. 自动登录快捷入口
3. 运行时示例数据或 mock 数据

如果需要演示管理员能力，请使用你手动创建并授权为管理员的本地账号登录 `/console`。

## 演示前检查清单

正式答辩前至少确认这些点：

1. `pnpm docker:dev` 后 PostgreSQL 与 Redis 正常启动
2. `pnpm dev` 后 Web 与 API 正常启动
3. `go run .` 后 Worker 正常启动
4. API `http://localhost:3001/api/health` 返回正常
5. Worker `http://localhost:3002/health` 返回正常
6. 管理员账号可以进入 `/console`
7. 社区、快照、评论、私信、控制台至少各有一条真实本地数据

## 常用命令

- `pnpm docker:dev`：启动 PostgreSQL 和 Redis
- `pnpm docker:down`：停止本地容器
- `pnpm db:generate`：生成 Prisma Client
- `pnpm db:setup`：初始化数据库
- `pnpm db:reset`：重置数据库
- `pnpm db:studio`：打开 Prisma Studio
- `pnpm dev`：启动 Web 和 API
- `pnpm health-check`：运行仓库级健康检查脚本
- `go run .`：在 `apps/worker` 下启动 Worker

## 项目结构

- `apps/web`：Next.js 前端
- `apps/api`：NestJS API
- `apps/worker`：Go Worker
- `libs/shared`：共享类型与 Prisma 生成产物
- `docker`：本地 PostgreSQL 初始化与容器配置
- `specs/graduation-streamline-plan`：当前毕业设计收口与开发指引

## 说明

这份 README 只保留 macOS 本地演示路径，不再展开 Windows 和 VPS 部署说明。
