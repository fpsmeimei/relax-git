# 多阶段构建 Dockerfile for NestJS API (Railway 优化版)
FROM node:20-alpine AS base
RUN apk add --no-cache git curl
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@8.15.0

# 复制根目录的包管理文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# 依赖阶段
FROM base AS deps
COPY apps/api/package.json ./apps/api/
COPY libs/shared/package.json ./libs/shared/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/libs/shared/node_modules ./libs/shared/node_modules

COPY . .

# 生成 Prisma 客户端
RUN pnpm db:generate

# 构建共享库
RUN pnpm -C libs/shared build

# 构建 API 应用
RUN pnpm -C apps/api build

# 生产阶段
FROM node:20-alpine AS production
RUN apk update && \
    apk add --no-cache git curl && \
    which git && \
    git --version

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@8.15.0

# 复制包文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY libs/shared/package.json ./libs/shared/

# 只安装生产依赖
RUN pnpm install --frozen-lockfile --prod

# 复制构建产物
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/libs/shared/dist ./libs/shared/dist
COPY --from=builder /app/libs/shared/src/generated ./libs/shared/src/generated
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# 创建上传目录和日志目录
RUN mkdir -p apps/api/uploads/repositories
RUN mkdir -p logs

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

# 启动命令
CMD ["pnpm", "-C", "apps/api", "start"]
