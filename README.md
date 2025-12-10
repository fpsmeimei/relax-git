# Relax-Git

Relax-Git 是面向代码的社交互动平台，聚焦评论、通知、成员关系与社区氛围。用于实践现代Web开发的技术栈和架构设计。

## 🚀 快速开始

> ⚠️ **安全提醒**: 首次部署前，请阅读 [安全指南](./docs/SECURITY.md) 并完成安全配置检查清单。

### 环境要求

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose
- Go >= 1.22（可选：用于 Worker 示例服务）

### 1. 准备工作（首次运行）

**在同一个终端执行以下命令：**

```powershell
# 克隆项目后，进入项目目录
cd f:\relax-git

# 安装项目依赖
pnpm install

# 构建共享类型库（首次运行必须）
pnpm -C libs/shared build

# 启动数据库和缓存服务（Docker）
pnpm docker:dev

# 初始化数据库（首次运行必须）
pnpm db:setup
```

> **提示**：这些命令可以在同一个终端顺序执行，无需开多个终端

### 2. 环境配置

**后端 API 环境变量**（`apps/api/.env.local`）：

```env
API_PORT=3001
CORS_ORIGIN=*
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/relax_git_dev
REDIS_URL=redis://localhost:6379

# Git 代理配置（仅在导入 GitHub 仓库时需要，可选）
GIT_HTTP_PROXY=http://127.0.0.1:7899
GIT_HTTPS_PROXY=http://127.0.0.1:7899
GIT_REMOTE_TIMEOUT_MS=180000
GIT_REMOTE_HEAD_TIMEOUT_MS=90000
```

> **注意**：
>
> - ⚠️ **`CORS_ORIGIN=*` 仅用于开发环境**，生产环境必须指定具体域名
> - Git 代理配置仅在**导入 GitHub 仓库**时使用，用于拉取远程代码
> - 如果不需要导入 GitHub 仓库，可以不配置代理
> - 代理地址需要根据你的实际代理工具端口调整（如 Clash、V2Ray 等）

**前端 Web 环境变量**（`apps/web/.env.local`）：

```env
NEXT_PUBLIC_API_URL=/api
```

> **注意**：
>
> - `NEXT_PUBLIC_API_URL=/api` 使用 Next.js 代理模式，前端请求通过 rewrites 转发到后端
> - WebSocket 同样通过同源路径 `/api/socket.io` 代理到后端，无需配置 `NEXT_PUBLIC_WS_URL`
> - 这与 Git 代理无关，Git 代理仅用于后端导入 GitHub 仓库

### 3. 启动服务

#### 🔍 启动前检查（推荐）

**在项目根目录执行**：

```powershell
cd f:\relax-git

# 检查端口占用（3000=前端, 3001=后端）
netstat -ano | Select-String "3000|3001"

# 如果有输出，说明端口被占用，清理 Node.js 进程：
# 方法 1：使用管理员权限的 PowerShell（推荐）
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 方法 2：使用 taskkill（如果上面的命令权限不足）
taskkill /F /IM node.exe

# 验证端口已释放
netstat -ano | Select-String "3000|3001"
# 应该没有输出
```

> **提示**：
>
> - ⚠️ 如果遇到"拒绝访问"错误，请**以管理员身份运行 PowerShell**
> - 清理进程会终止所有 Node.js 进程，请先保存工作
> - 如果只想终止特定进程，用 `Stop-Process -Id <进程ID> -Force`

#### 🚀 一键启动脚本（推荐）

**方式一：双击启动（最简单）**

直接双击项目根目录的：

```
启动所有服务.bat
```

**方式二：命令行启动**

在项目根目录执行：

```powershell
.\start-all.ps1
```

脚本会自动：

1. 在独立终端启动 Docker 服务
2. 在独立终端启动后端 API
3. 在独立终端启动前端 Web

**提示**：

- 每个服务在独立窗口运行，方便查看日志
- 关闭对应终端窗口即可停止服务
- 或在各窗口按 `Ctrl+C` 停止

---

#### 完整启动步骤（手动）

> **提示**：分别启动前，同样建议先执行"启动前检查"清理端口

需要启动 3 个核心服务（Docker、API、Web）；如需 Worker，可再启动第 4 个（可选）：

**终端 1 - Docker 服务**

```powershell
cd f:\relax-git  # 确保在项目根目录
pnpm docker:dev
# 等待看到: ✔ Container relax-git-postgres  Running
```

**终端 2 - 后端 API**

```powershell
cd f:\relax-git  # 确保在项目根目录
pnpm -C apps/api dev
# 等待看到: 🚀 Relax-Git API Server is running on http://localhost:3001
```

**终端 3 - 前端 Web**

```powershell
cd f:\relax-git  # 确保在项目根目录
pnpm -C apps/web dev
# 等待看到: ✓ Ready in X.Xs
```

**终端 4 - Worker 服务（导入仓库必需）**

```powershell
cd f:\relax-git\apps\worker  # 正式 Worker 服务
go run .
# 等待看到: Relax-Git Worker started successfully
```

> **可选**：`apps/worker-sample/` 仅作为示例 Worker，正常导入仓库时请使用
> `apps/worker/`。更多配置（如队列、数据库）参见 `apps/worker/README.md`。

### 4. 访问应用

| 服务                        | 地址                           | 说明           |
| --------------------------- | ------------------------------ | -------------- |
| 🌐 **Web 前端**             | http://localhost:3000          | 主应用界面     |
| 📚 **API 文档**             | http://localhost:3001/api/docs | Swagger UI     |
| ❤️ **健康检查**             | http://localhost:3001/health   | 服务状态       |
| 🛠️ **React Query DevTools** | 内嵌在页面（开发环境）         | 数据缓存可视化 |

### 6. 验证启动成功

**核心服务（必需）**：

| 服务      | 端口 | 成功标志                                         | 状态 |
| --------- | ---- | ------------------------------------------------ | ---- |
| 🐳 Docker | -    | `✔ Container relax-git-postgres Running`        | ✅   |
| 🚀 API    | 3001 | `API Server is running on http://localhost:3001` | ✅   |
| 🌐 Web    | 3000 | `✓ Ready in X.Xs`                                | ✅   |

**可选服务**：

| 服务      | 端口 | 成功标志                      | 何时需要            |
| --------- | ---- | ----------------------------- | ------------------- |
| 🔧 Worker | -    | `Worker started successfully` | 导入仓库/创建快照时 |

```


## 🛠️ 技术栈

### 前端

- **框架**: Next.js 15 + React 19 + TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand + Immer + TanStack Query
- **请求库**: Axios
- **实时通信**: Socket.IO Client
- **错误处理**: Error Boundary ✨

### 后端

- **框架**: NestJS + Fastify
- **语言**: TypeScript
- **ORM**: Prisma
- **认证**: JWT + Passport + bcrypt
- **API文档**: Swagger
- **实时通信**: Socket.IO

### Worker

- **语言**: Go 1.22+
- **队列**: Redis Queue
- **Git 操作**: Git Worktree

### 基础设施

- **数据库**: PostgreSQL 16 + Redis 7
- **容器**: Docker + Docker Compose
- **包管理**: pnpm + Turborepo

## 📁 项目结构

```

relax-git/ ├── apps/ │ ├── api/ # NestJS 后端 API │ ├── web/ # Next.js 前端应用 │ ├── worker/ # Go
Worker 服务（处理快照任务）│ └── worker-sample/ # Go Worker 示例（可选）├── libs/ │ └──
shared/ # 共享类型和工具 └── docker/ # Docker 配置

````

## 🗄️ 数据库管理

```bash
# 初始化数据库（首次运行）
pnpm db:setup

# 重置数据库（清空所有数据）
pnpm db:reset

# 打开 Prisma Studio（数据库可视化工具）
pnpm db:studio
````

## 📖 文档

### 核心文档

- [🏗️ 架构改进计划](./docs/ARCHITECTURE_IMPROVEMENTS.md) - 现代化架构设计
- [🔐 安全指南](./docs/SECURITY.md) - 部署前安全检查清单
- [⚡ 延迟认证](./docs/LAZY_AUTHENTICATION.md) - 按需认证策略
- [🧹 自动存储清理](./docs/AUTO_STORAGE_CLEANUP.md) - Token 自动清理机制

### 实施文档

- [✅ 实施完成总结](./docs/IMPLEMENTATION_COMPLETE.md) - 三项关键改进
- [🔄 重构示例](./docs/REFACTOR_EXAMPLE.md) - useAsync Hook 使用示例
- [🚨 紧急修复总结](./docs/EMERGENCY_FIX_SUMMARY.md) - 安全修复记录

### 工具脚本

- `tools/scripts/generate-secrets.js` - 生成安全 JWT 密钥
- `tools/scripts/clear-browser-storage.js` - 清理浏览器缓存指南
- `tools/scripts/db-setup.js` - 数据库初始化脚本
