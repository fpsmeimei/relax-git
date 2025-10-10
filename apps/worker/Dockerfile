# 多阶段构建 Dockerfile

# 构建阶段
FROM golang:1.22-alpine AS builder

# 安装必要的包
RUN apk add --no-cache git make

# 设置工作目录
WORKDIR /app

# 复制 go mod 文件
COPY go.mod go.sum ./

# 下载依赖
RUN go mod download

# 复制源代码
COPY . .

# 构建应用
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags "-X main.version=docker -X main.commit=docker -X main.date=$(date -u +%Y-%m-%dT%H:%M:%SZ)" -o bin/relax-git-worker-linux .

# 构建诊断工具
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o bin/diagnose-linux ./cmd/diagnose

# 运行阶段
FROM alpine:latest

# 安装必要的包
RUN apk add --no-cache \
    git \
    ca-certificates \
    tzdata \
    curl

# 创建非 root 用户
RUN addgroup -g 1001 -S relax-git && \
    adduser -u 1001 -S relax-git -G relax-git

# 设置工作目录
WORKDIR /app

# 从构建阶段复制二进制文件
COPY --from=builder /app/bin/relax-git-worker-linux /app/relax-git-worker
COPY --from=builder /app/bin/diagnose-linux /app/diagnose

# 复制生产配置文件
COPY --from=builder /app/config.production.yaml /app/config.yaml

# 设置权限
RUN chown -R relax-git:relax-git /app

# 切换到非 root 用户
USER relax-git

# 暴露端口
EXPOSE 3002

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3002/health || exit 1

# 启动应用
CMD ["/app/relax-git-worker"]
