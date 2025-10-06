# 多阶段构建 Dockerfile for NestJS API
FROM node:20-alpine AS base
RUN apk add --no-cache git
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制根目录的包管理文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder
COPY . .
WORKDIR /app/apps/api

# 生成 Prisma 客户端
RUN pnpm prisma generate

# 构建应用
RUN pnpm build

# 生产阶段
FROM node:20-alpine AS production
RUN apk add --no-cache git

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制包文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# 只安装生产依赖
RUN pnpm install --frozen-lockfile --prod

# 复制构建产物
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

WORKDIR /app/apps/api

# 创建上传目录
RUN mkdir -p uploads/repositories

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# 启动命令
CMD ["pnpm", "start:prod"]
