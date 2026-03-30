# Relax-Git 全栈应用 Dockerfile
# 适用于 Railway 部署的多阶段构建

# ============================================
# Base Stage - 基础环境
# ============================================
FROM node:20-alpine AS base

# 安装 pnpm
RUN npm install -g pnpm@8.15.0

# 设置工作目录
WORKDIR /app

# 复制 package.json 文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# ============================================
# Dependencies Stage - 安装依赖
# ============================================
FROM base AS deps

# 复制所有 package.json 文件
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY libs/shared/package.json ./libs/shared/

# 安装依赖（包括 devDependencies，构建时需要）
RUN pnpm install --frozen-lockfile

# ============================================
# Go Builder Stage - 构建 Worker
# ============================================
FROM golang:1.22-alpine AS go-builder

# 安装必要的包
RUN apk add --no-cache git make

# 设置工作目录
WORKDIR /app/worker

# 复制 Worker 源代码
COPY apps/worker/ .

# 下载依赖
RUN go mod download

# 构建 Worker 应用
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags "-X main.version=docker -X main.commit=docker -X main.date=$(date -u +%Y-%m-%dT%H:%M:%SZ)" -o relax-git-worker .

# 构建诊断工具
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o diagnose ./cmd/diagnose

# ============================================
# Builder Stage - 构建应用
# ============================================
FROM base AS builder

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/libs/shared/node_modules ./libs/shared/node_modules

# 复制源代码
COPY . .

# 强制缓存失效 - 确保 API 代码重新编译
RUN echo "Build timestamp: $(date)" > /tmp/build-timestamp

# 生成 Prisma 客户端
RUN pnpm db:generate

# 构建共享库
RUN pnpm -C libs/shared build

# 手动复制 Prisma 客户端到 shared 库的 dist 目录
RUN mkdir -p libs/shared/dist/generated && cp -r libs/shared/src/generated/prisma-client libs/shared/dist/generated/

# 构建 API 服务
RUN pnpm -C apps/api build

# 构建 Web 应用
RUN pnpm -C apps/web build

# ============================================
# API Runner Stage - API 服务运行环境
# ============================================
FROM node:20-alpine AS api-runner

# 安装 pnpm
RUN npm install -g pnpm@8.15.0

WORKDIR /app

# 复制 package.json 文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY libs/shared/package.json ./libs/shared/

# 只安装生产依赖
RUN pnpm install --frozen-lockfile --prod

# 复制构建产物
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/libs/shared/dist ./libs/shared/dist
COPY --from=builder /app/libs/shared/src/generated ./libs/shared/src/generated

# 复制 Prisma schema（运行时需要）
COPY apps/api/prisma ./apps/api/prisma

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 暴露端口
EXPOSE 3001

# 启动 API 服务
CMD ["pnpm", "-C", "apps/api", "start"]

# ============================================
# Web Runner Stage - Web 应用运行环境
# ============================================
FROM node:20-alpine AS web-runner

# 安装 pnpm
RUN npm install -g pnpm@8.15.0

WORKDIR /app

# 复制 package.json 文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY libs/shared/package.json ./libs/shared/

# 只安装生产依赖
RUN pnpm install --frozen-lockfile --prod

# 复制构建产物
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/libs/shared/dist ./libs/shared/dist

# 复制 Next.js 配置
COPY apps/web/next.config.js ./apps/web/
COPY apps/web/package.json ./apps/web/

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动 Web 应用
CMD ["pnpm", "-C", "apps/web", "start"]

# ============================================
# Full Stack Stage - 全栈应用（Railway 默认）
# ============================================
FROM node:20-alpine AS fullstack

# 安装系统依赖和工具（包括 Git）
RUN apk update && \
    apk add --no-cache openssl curl python3 make g++ git && \
    which git && \
    git --version

# 安装 pnpm 和 PM2
RUN npm install -g pnpm@8.15.0 pm2

WORKDIR /app

# 复制 package.json 文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY libs/shared/package.json ./libs/shared/

# 安装生产依赖（跳过 prepare 脚本避免 husky 错误）
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# 复制构建阶段的已编译 bcrypt 模块
COPY --from=builder /app/node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt/lib ./node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt/lib

# 复制构建产物
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/libs/shared/dist ./libs/shared/dist
COPY --from=builder /app/libs/shared/src/generated ./libs/shared/src/generated

# 确保 Prisma 客户端在正确位置
COPY --from=builder /app/libs/shared/src/generated/prisma-client ./libs/shared/dist/generated/prisma-client

# 复制 Worker 二进制文件
COPY --from=go-builder /app/worker/relax-git-worker ./apps/worker/relax-git-worker
COPY --from=go-builder /app/worker/diagnose ./apps/worker/diagnose

# 复制 Worker 配置文件
COPY apps/worker/config.production.yaml ./apps/worker/config.yaml

# 复制配置文件
COPY apps/api/prisma ./apps/api/prisma
COPY apps/web/next.config.js ./apps/web/

# 创建日志目录
RUN mkdir -p logs

# 设置默认环境变量（可被 Railway 覆盖）
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3000

# 使用内联启动命令，避免依赖仓库根目录的旧启动脚本
CMD ["sh", "-c", "pm2 start pnpm --name relax-git-api --cwd /app/apps/api -- start && pm2 start pnpm --name relax-git-web --cwd /app/apps/web -- start && pm2 start /app/apps/worker/relax-git-worker --name relax-git-worker --interpreter none && pm2 logs --no-daemon"]
