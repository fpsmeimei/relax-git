# Relax-Git Worker

高性能 Git Worktree 操作服务，负责处理快照创建任务。

## 功能特性

- 🚀 **高性能**: Go 1.22+ 并发处理，支持配置并发数
- 📦 **队列消费**: Redis 队列消费，支持阻塞式任务获取
- 🔄 **Git Worktree**: 完整的 Git worktree 操作支持
- 💾 **Bundle 持久化**: Git bundle 创建用于快照持久化
- 🏥 **健康检查**: HTTP 健康检查端点
- 📊 **状态管理**: 实时状态更新到数据库和 Redis
- 🛡️ **错误处理**: 完善的错误处理和重试机制

## 架构设计

```
[Redis Queue] --> [Worker Pool] --> [Git Operations] --> [Database]
      |                                    |
      v                                    v
[Status Updates] <-------------- [Bundle Storage]
```

## 快速开始

### 环境要求

- Go 1.22+
- Git 2.0+
- Redis 6.0+
- PostgreSQL 12+

### 配置

1. 复制配置文件：

```bash
cp config.example.yaml config.yaml
```

2. 修改配置文件中的数据库和 Redis 连接信息

### 构建和运行

#### Linux/Mac 环境

```bash
# 安装依赖
make deps

# 构建
make build

# 运行
./bin/relax-git-worker

# 或者直接运行
make run
```

#### Windows 环境

```powershell
# 安装依赖
go mod download
go mod tidy

# 构建
go build -o bin/relax-git-worker.exe .

# 运行
.\bin\relax-git-worker.exe

# 或者直接运行
go run .
```

### Docker 运行

```bash
# 构建镜像
make docker-build

# 运行容器
docker run -d \
  --name relax-git-worker \
  -e REDIS_HOST=redis \
  -e DB_HOST=postgres \
  -e DB_PASSWORD=password \
  -p 3002:3002 \
  relax-git-worker:latest
```

## 环境变量

| 变量名               | 默认值                 | 说明                 |
| -------------------- | ---------------------- | -------------------- |
| `REDIS_HOST`         | localhost              | Redis 主机地址       |
| `REDIS_PORT`         | 6379                   | Redis 端口           |
| `REDIS_PASSWORD`     | ""                     | Redis 密码           |
| `REDIS_DB`           | 0                      | Redis 数据库编号     |
| `DB_HOST`            | localhost              | 数据库主机地址       |
| `DB_PORT`            | 5432                   | 数据库端口           |
| `DB_USER`            | postgres               | 数据库用户名         |
| `DB_PASSWORD`        | ""                     | 数据库密码           |
| `DB_NAME`            | relax_git              | 数据库名称           |
| `WORKER_CONCURRENCY` | 3                      | 并发处理数量         |
| `WORKER_QUEUE_NAME`  | snapshot:queue         | 队列名称             |
| `GIT_TEMP_DIR`       | /tmp/relax-git-repos   | Git 临时目录         |
| `GIT_BUNDLE_DIR`     | /tmp/relax-git-bundles | Bundle 存储目录      |
| `GIT_MAX_REPO_SIZE`  | 1073741824             | 最大仓库大小（字节） |
| `LOG_LEVEL`          | info                   | 日志级别             |

## API 端点

### 健康检查

- `GET /health` - 完整健康检查
- `GET /ready` - 就绪检查
- `GET /version` - 版本信息

### 健康检查响应示例

```json
{
  "status": "healthy",
  "timestamp": "2025-08-12T15:30:00Z",
  "version": "0.1.0",
  "uptime": "1h30m45s"
}
```

## 任务处理流程

1. **队列消费**: 从 Redis 队列获取快照任务
2. **状态更新**: 更新快照状态为 `PROCESSING`
3. **仓库克隆**: 克隆 Git 仓库到临时目录
4. **大小检查**: 验证仓库大小不超过限制
5. **Worktree 创建**: 创建指定提交的 worktree
6. **Bundle 生成**: 创建 Git bundle 用于持久化
7. **状态完成**: 更新状态为 `READY` 并保存路径信息
8. **清理**: 清理临时文件

## 监控和日志

- 结构化日志输出（JSON 格式）
- 支持多种日志级别
- 健康检查端点用于监控
- 详细的错误信息和堆栈跟踪

## 开发

### 项目结构

```
apps/worker/
├── config/          # 配置管理
├── database/        # 数据库操作
├── git/            # Git 操作
├── health/         # 健康检查
├── queue/          # 队列操作
├── types/          # 类型定义
├── worker/         # 核心处理逻辑
├── main.go         # 主程序入口
├── Dockerfile      # Docker 构建文件
├── Makefile        # 构建脚本
└── README.md       # 文档
```

### 开发命令

```bash
# 格式化代码
make fmt

# 代码检查
make vet

# 运行测试
make test

# 生成覆盖率报告
make test-coverage

# 代码检查（需要安装 golangci-lint）
make lint
```
