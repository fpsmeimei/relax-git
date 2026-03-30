# Relax-Git

Relax-Git 是一个基于 Git
worktree 的协作平台，用于演示评论、通知、成员关系、仓库协作和快照任务的完整链路。

## macOS 本地启动

这个仓库现在只保留 macOS 本地演示路径。默认启动 Web、API、PostgreSQL 和 Redis；Worker 也是必需的，因为它负责导入仓库和处理快照。

### 环境要求

- Node.js 20+
- pnpm 8+
- Docker CLI 和 Docker Compose
- OrbStack 可直接替代 Docker Desktop
- Go 1.22+，仅在需要启动 Worker 时使用

### 启动步骤

#### 1. 只需要执行一次，或在依赖变更后重新执行

在仓库根目录执行：

```bash
pnpm install
pnpm db:generate
pnpm -C libs/shared build
```

#### 2. 每次重启电脑或重新打开项目后都要执行

先启动数据库和缓存：

```bash
pnpm docker:dev
```

如果这是第一次启动，或者你清空过数据库，再执行一次初始化：

```bash
pnpm db:setup
```

然后启动前端和后端：

```bash
pnpm dev
```

最后在单独的终端启动 Worker：

```bash
cd apps/worker
go run .
```

### 访问地址

- Web: http://localhost:3000
- API 文档: http://localhost:3001/api/docs
- 健康检查: http://localhost:3001/health

### 常用命令

- `pnpm docker:dev` - 启动本地 PostgreSQL 和 Redis
- `pnpm docker:down` - 停止本地容器
- `pnpm db:generate` - 生成 Prisma Client
- `pnpm db:setup` - 初始化数据库
- `pnpm db:reset` - 重置数据库
- `pnpm db:studio` - 打开 Prisma Studio
- `pnpm dev` - 启动前端和后端开发服务
- `go run .` - 在 `apps/worker` 下启动 Worker

## 项目结构

- `apps/api` - NestJS 后端
- `apps/web` - Next.js 前端
- `apps/worker` - Go Worker
- `libs/shared` - 共享类型和工具
- `docker` - Docker 相关配置

## 说明

这份 README 只保留 macOS 的启动路径，不再提供 Windows 说明。
