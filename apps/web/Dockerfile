# 多阶段构建 Dockerfile for Next.js Web App (Railway 优化版)
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@8.15.0

# 复制根目录的包管理文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# 依赖阶段
FROM base AS deps
COPY apps/web/package.json ./apps/web/
COPY libs/shared/package.json ./libs/shared/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/libs/shared/node_modules ./libs/shared/node_modules

COPY . .

# 构建共享库
RUN pnpm -C libs/shared build

# 构建 Web 应用
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm -C apps/web build

# 生产阶段
FROM node:20-alpine AS production
RUN apk add --no-cache curl

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@8.15.0

# 复制包文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY libs/shared/package.json ./libs/shared/

# 只安装生产依赖
RUN pnpm install --frozen-lockfile --prod

# 复制构建产物
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.js ./apps/web/
COPY --from=builder /app/libs/shared/dist ./libs/shared/dist

# 创建 nextjs 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 设置正确的权限
USER nextjs

# 创建日志目录
RUN mkdir -p logs

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/api/health || exit 1

# 启动命令
CMD ["pnpm", "-C", "apps/web", "start"]
