# Relax-Git 学习项目

> 基于 Git worktree 的代码协作平台学习项目

## 🎓 项目介绍

Relax-Git 是面向代码的社交互动平台，聚焦评论、通知、成员关系与社区氛围。这是一个**应届生学习项目**，用于实践现代Web开发的技术栈和架构设计。

### 核心功能

- **代码浏览**: 基于 Git worktree 的代码快照浏览
- **锚点评论**: 支持文件行级、提交级、快照级评论
- **实时时间线**: 基于 WebSocket 的事件推送
- **用户管理**: 用户注册、登录、权限控制
- **仓库管理**: 代码仓库导入和管理

## 🚀 快速开始

### 环境要求

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose
- Go >= 1.22（用于 Worker 服务）

### 1. 准备工作（首次运行）

**在同一个终端执行以下命令：**

```bash
# 克隆项目后，进入项目目录（zsh 终端使用 Unix 路径格式）
cd /f/relax-git

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
JWT_SECRET=your-super-secret-jwt-key
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
> - `CORS_ORIGIN=*` 为最宽松配置，允许任意来源访问（适合开发环境）
> - Git 代理配置仅在**导入 GitHub 仓库**时使用，用于拉取远程代码
> - 如果不需要导入 GitHub 仓库，可以不配置代理
> - 代理地址需要根据你的实际代理工具端口调整（如 Clash、V2Ray 等）

**前端 Web 环境变量**（`apps/web/.env.local`）：

```env
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

> **注意**：
>
> - `NEXT_PUBLIC_API_URL=/api` 使用 Next.js 代理模式，前端请求通过 rewrites 转发到后端
> - 这与 Git 代理无关，Git 代理仅用于后端导入 GitHub 仓库

### 3. 启动服务

#### 方式一：快速启动（推荐）

**终端 1 - 启动基础服务和前后端**

```bash
cd /f/relax-git

# 1. 启动 Docker（数据库和 Redis）
pnpm docker:dev
# 等待看到: ✔ Container relax-git-postgres Running

# 2. 同时启动前后端（使用 Turbo）
pnpm dev
# 这会同时启动 API 和 Web 服务
# 等待看到两个服务都启动成功
```

**终端 2 - 启动 Worker 服务**

```bash
cd /f/relax-git/apps/worker
go run .
# 等待看到: Worker started successfully
```

> **提示**：
>
> - 前三步（Docker + 前后端）可以在同一个终端顺序执行，只有 Worker 需要新开终端
> - **后续启动**：只需执行 `pnpm docker:dev` → `pnpm dev`，然后新终端启动 Worker

#### 方式二：分别启动（调试时使用）

需要启动 4 个服务，建议使用 4 个终端窗口（适配 zsh 终端）：

**终端 1 - Docker 服务**

```bash
cd /f/relax-git  # 确保在项目根目录
pnpm docker:dev
# 等待看到: ✔ Container relax-git-postgres  Running
```

**终端 2 - 后端 API**

```bash
cd /f/relax-git  # 确保在项目根目录
pnpm -C apps/api dev
# 等待看到: 🚀 Relax-Git API Server is running on http://localhost:3001
```

**终端 3 - 前端 Web**

```bash
cd /f/relax-git  # 确保在项目根目录
pnpm -C apps/web dev
# 等待看到: ✓ Ready in X.Xs
```

**终端 4 - Worker 服务**

```bash
cd /f/relax-git/apps/worker  # 注意：使用 Unix 路径格式，不是 Windows 路径
go run .
# 等待看到: Worker started successfully
```

### 4. 访问应用

- **Web 前端**: http://localhost:3000
- **API 文档**: http://localhost:3001/api/docs
- **API 健康检查**: http://localhost:3001/health

### 5. 验证启动成功

各服务启动成功标志：

| 服务   | 成功标志                                            |
| ------ | --------------------------------------------------- |
| Docker | `✔ Container relax-git-postgres  Running`          |
| API    | `🚀 API Server is running on http://localhost:3001` |
| Web    | `✓ Ready in X.Xs`                                   |
| Worker | `Worker started successfully`                       |

## 📋 使用指南

### 导入演示仓库

> **重要**：导入 GitHub 仓库需要配置 Git 代理（见上方环境配置），否则可能无法访问 GitHub

1. 访问 http://localhost:3000
2. 注册并登录账户
3. 点击"导入仓库"按钮
4. 填写仓库信息：
   ```
   Git 仓库 URL: https://github.com/fpsmeimei/simpleblog-for-realx-git.git
   仓库名称: simpleblog-demo
   默认分支: develop
   仓库描述: SimpleBlog 演示项目
   ```
5. 点击"导入仓库"按钮
6. 导入成功后，点击分支的"浏览代码"按钮
7. 系统会自动创建快照，可以浏览文件树和代码内容

**导入失败排查**：

- 检查 Git 代理配置是否正确
- 确认代理工具（Clash/V2Ray）正在运行
- 查看 API 日志中的错误信息
- 尝试在终端测试代理：`curl -x http://127.0.0.1:7899 https://github.com`

### 常见问题

**登录后立即跳回登录页 / 令牌无效**

- 确认环境变量配置正确：
  - 后端：`CORS_ORIGIN=*`
  - 前端：`NEXT_PUBLIC_API_URL=/api`
- 清理浏览器缓存和 localStorage
- 重启前后端服务

**导入仓库失败 / 无法连接到 GitHub**

- 确认已配置 Git 代理环境变量（`GIT_HTTP_PROXY` 和 `GIT_HTTPS_PROXY`）
- 检查代理工具是否正在运行
- 验证代理端口是否正确（常见端口：7890、7899、10809）
- 测试代理连接：`curl -x http://127.0.0.1:7899 https://github.com`
- 注意：**只有导入仓库时需要代理**，其他功能不需要

**快照一直处于"排队中"状态**

- 检查 Worker 服务是否正常运行
- 重启 Worker：`cd /f/relax-git/apps/worker && go run .`
- 检查 Redis 连接是否正常

**无法访问前端页面**

- 检查端口是否被占用：`netstat -ano | findstr :3000`
- 前端会自动使用其他可用端口

**API 返回 500 错误**

- 检查数据库连接是否正常
- 重启 Docker：`pnpm docker:dev`
- 检查数据库是否已初始化：`pnpm db:setup`

**API 返回 401 未授权错误**

- 检查是否已添加 `@Public()` 装饰器到登录/注册接口
- 确认 JWT 守卫配置正确
- 查看 API 日志确认错误详情

**类型错误 / 找不到模块**

- 重新构建共享类型库：`pnpm -C libs/shared build`
- 重新安装依赖：`pnpm install`

**zsh 终端路径问题**

- 使用 Unix 路径格式：`/f/relax-git` 而不是 `f:\relax-git`
- 如果路径错误，使用 `pwd` 查看当前目录
- 项目根目录应该是：`/f/relax-git`

## 🛠️ 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **后端**: Node.js + NestJS + TypeScript
- **Worker**: Go 1.22+ + Redis Queue
- **数据库**: PostgreSQL 16 + Redis 7
- **容器**: Docker

## 📁 项目结构

```
relax-git/
├── apps/
│   ├── api/          # NestJS 后端 API
│   ├── web/          # Next.js 前端应用
│   └── worker/       # Go Worker 服务
├── libs/
│   └── shared/       # 共享类型和工具
└── docker/           # Docker 配置
```

## 🗄️ 数据库管理

```bash
# 初始化数据库（首次运行）
pnpm db:setup

# 重置数据库（清空所有数据）
pnpm db:reset

# 打开 Prisma Studio（数据库可视化工具）
pnpm db:studio
```

## 📚 学习收获

通过这个学习项目，我实践了：

1. **技术栈整合**: 前后端分离架构
2. **数据库设计**: 关系型数据库设计和ORM使用
3. **实时通信**: WebSocket 和实时数据推送
4. **用户认证**: JWT 令牌和权限控制
5. **代码管理**: Git 和代码版本控制
6. **容器化**: Docker 和容器化部署

---

_这是一个应届生学习项目，主要用于技术学习和实践。_
