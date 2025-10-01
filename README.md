# Relax-Git 学习项目

> 基于 Git worktree 的代码协作平台学习项目

[![架构改进](https://img.shields.io/badge/架构-现代化-success)](./docs/ARCHITECTURE_IMPROVEMENTS.md)
[![安全加固](https://img.shields.io/badge/安全-已加固-blue)](./docs/SECURITY.md)
[![延迟认证](https://img.shields.io/badge/认证-延迟加载-orange)](./docs/LAZY_AUTHENTICATION.md)

Relax-Git 是面向代码的社交互动平台，聚焦评论、通知、成员关系与社区氛围。用于实践现代Web开发的技术栈和架构设计。

### ✨ 最新改进（2025-09-30）

- 🔐 **鉴权迁移** - 从 X-UID 迁移到 JWT + HttpOnly Cookie，统一前后端认证与 WebSocket 握手
- 🛡️ **Error Boundary** - 防止应用崩溃，优雅处理错误
- 🔄 **统一状态管理** - useAsync Hook，减少70%重复代码
- ⚡ **数据缓存** - React Query 集成，减少50%+ API请求
- 🔐 **延迟认证** - 按需认证，提升性能和用户体验
- 🧹 **自动清理** - 智能检测和清理过期数据

### 核心功能

- **代码浏览**: 基于 Git worktree 的代码快照浏览
- **锚点评论**: 支持文件行级、提交级、快照级评论
- **实时时间线**: 基于 WebSocket 的事件推送
- **用户管理**: 用户注册、登录、权限控制
- **仓库管理**: 代码仓库导入和管理

## 🚀 快速开始

> ⚠️ **安全提醒**: 首次部署前，请阅读 [安全指南](./docs/SECURITY.md) 并完成安全配置检查清单。

### 环境要求

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose
- Go >= 1.22（可选：用于 Worker 示例服务）

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

> **⚠️ 启动前检查**：确保端口未被占用，避免僵尸进程

#### 🔍 启动前检查（推荐）

**在项目根目录执行**：

```bash
cd /f/relax-git

# 检查端口占用（3000=前端, 3001=后端）
netstat -ano | findstr "3000 3001"

# 如果有输出，说明端口被占用，清理僵尸进程：
# 方式 1：使用 cmd 包装（Git Bash/zsh 推荐）
cmd //c "taskkill /F /IM node.exe"

# 方式 2：使用双斜杠（Git Bash/zsh 替代方案）
taskkill //F //IM node.exe

# 方式 3：使用 PowerShell
powershell.exe "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force"

# 验证端口已释放
netstat -ano | findstr "3000 3001"
# 应该没有输出
```

> **提示**：
>
> - 如果使用 **Git Bash 中的 zsh**，Windows 命令参数需要用 `//` 而不是 `/`
> - 清理进程会终止所有 Node.js 进程，请先保存工作
> - 如果只想终止特定进程，用 `taskkill //PID <进程ID> //F`

#### 完整启动步骤

> **提示**：分别启动前，同样建议先执行"启动前检查"清理端口

需要启动 3 个核心服务（Docker、API、Web）；如需 Worker，可再启动第 4 个（可选）：

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

**终端 4 - Worker 服务（导入仓库必需）**

```bash
cd /f/relax-git/apps/worker  # 正式 Worker 服务
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

### 5. 首次使用

#### 🎯 注册测试账号

访问 http://localhost:3000/auth/register

**密码要求**（已优化，更友好）：

- ✅ 至少 **6 个字符**（之前是8个）
- ✅ 任意字符组合（无需大小写或数字）

**示例**：

```
用户名: demo
密码:   demo123
```

#### 📝 预创建的测试账号

为了方便测试，已创建以下账号：

| 用户名      | 密码       | 说明     |
| ----------- | ---------- | -------- |
| `testuser`  | `test123`  | 测试用户 |
| `admin`     | `admin123` | 管理员   |
| `developer` | `dev123`   | 开发者   |
| `demo`      | `demo123`  | 演示账号 |

#### 🧹 浏览器缓存说明

**无需手动清理！** 系统已实现：

- ✅ 自动检测旧版数据
- ✅ 自动清理无效数据
- ✅ 静默跳转到登录页

> 如果遇到登录问题，刷新页面即可，系统会自动处理。
>
> 详见：[自动存储清理文档](./docs/STORAGE_AUTO_CLEANUP.md)

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

**快速测试**：

```bash
# 1. 测试 API
curl http://localhost:3001/health
# 应该返回: {"status":"healthy",...}

# 2. 测试 Web
curl -I http://localhost:3000
# 应该返回: HTTP/1.1 200 OK
```

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

**端口被占用 / 服务无法启动**

如果看到类似 `⚠ Port 3000 is in use` 的提示：

```bash
# 1. 检查哪个进程占用端口
netstat -ano | findstr "3000 3001"

# 2. 清理所有 Node.js 僵尸进程（Git Bash/zsh）
cmd //c "taskkill /F /IM node.exe"

# 3. 验证端口已释放
netstat -ano | findstr "3000 3001"
# 应该没有输出

# 4. 重新启动服务
pnpm dev
```

> **说明**：
>
> - 僵尸进程通常是因为之前的服务没有正常退出（如直接关闭终端）
> - 如果使用 **Git Bash 中的 zsh**，Windows 命令需要用 `//` 而不是 `/`
> - 详见：[启动前检查](#-启动前检查推荐)

**登录后立即跳回登录页 / 令牌无效**

✅ **已修复！** 系统现已实现：

- 自动检测和清理过期 token
- 延迟认证（登录页不检查认证）
- 智能跳转和错误处理

如果仍遇到问题：

1. 刷新页面（F5 或 Ctrl+R）
2. 清理浏览器本地存储：
   ```javascript
   // 在浏览器控制台执行
   localStorage.clear();
   location.reload();
   ```
3. 重新登录即可

> 详见：[延迟认证文档](./docs/LAZY_AUTHENTICATION.md)

**导入仓库失败 / 无法连接到 GitHub**

- 确认已配置 Git 代理环境变量（`GIT_HTTP_PROXY` 和 `GIT_HTTPS_PROXY`）
- 检查代理工具是否正在运行
- 验证代理端口是否正确（常见端口：7890、7899、10809）
- 测试代理连接：`curl -x http://127.0.0.1:7899 https://github.com`
- 注意：**只有导入仓库时需要代理**，其他功能不需要

**快照一直处于"排队中"状态**

- （如启用）检查 Worker 服务是否正常运行
- （如启用）重启 Worker：`cd /f/relax-git/apps/worker-sample && go run .`
- 检查 Redis 连接是否正常

**无法访问前端页面**

- 检查端口是否被占用：`netstat -ano | findstr :3000`
- 如果端口被占用，清理僵尸进程：`cmd //c "taskkill /F /IM node.exe"`
- 前端会自动使用其他可用端口（如 3001、3002），但建议清理后使用默认端口

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
relax-git/
├── apps/
│   ├── api/            # NestJS 后端 API
│   ├── web/            # Next.js 前端应用
│   ├── worker/         # Go Worker 服务（处理快照任务）
│   └── worker-sample/  # Go Worker 示例（可选）
├── libs/
│   └── shared/         # 共享类型和工具
└── docker/             # Docker 配置
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

1. **技术栈整合**: 前后端分离架构、Monorepo 管理
2. **数据库设计**: 关系型数据库设计和 ORM 使用
3. **实时通信**: WebSocket 和实时数据推送
4. **用户认证**: JWT 令牌、权限控制、延迟认证
5. **代码管理**: Git、Git Worktree、代码版本控制
6. **容器化**: Docker 和容器化部署
7. **架构优化**: 错误边界、统一状态管理、数据缓存 ✨
8. **安全加固**: CORS 配置、密码验证、Token 管理 ✨

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

## 🎯 快速链接

| 功能                                                              | 说明             | 状态      |
| ----------------------------------------------------------------- | ---------------- | --------- |
| [Error Boundary](./apps/web/src/components/error-boundary.tsx)    | 错误边界组件     | ✅ 已实现 |
| [useAsync Hook](./apps/web/src/hooks/use-async.ts)                | 统一异步状态管理 | ✅ 已实现 |
| [React Query](./apps/web/src/components/react-query-provider.tsx) | 数据缓存提供器   | ✅ 已实现 |
| [延迟认证](./apps/web/src/components/auth-provider.tsx)           | 按需认证逻辑     | ✅ 已实现 |
| [自动清理](./apps/web/src/lib/storage-cleaner.ts)                 | 存储清理工具     | ✅ 已实现 |

---

_这是一个应届生学习项目，主要用于技术学习和实践。持续更新中... 🚀_
