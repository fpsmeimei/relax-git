#!/bin/sh

# Railway 启动脚本 - 确保数据库迁移和应用启动

echo "🚀 Starting Relax-Git Application..."

# 调试：打印环境变量
echo "🔍 Environment Variables Debug:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DATABASE_URL: ${DATABASE_URL:0:50}..." 
echo "REDIS_URL: ${REDIS_URL:0:30}..."
echo "JWT_SECRET: ${JWT_SECRET:0:10}..."
echo "CORS_ORIGIN: $CORS_ORIGIN"

# 等待数据库连接
echo "⏳ Waiting for database connection..."
sleep 5

# 运行数据库迁移
echo "🔄 Running database migrations..."
cd /app/apps/api
pnpm prisma db push --accept-data-loss || echo "⚠️ Database migration failed, continuing..."

# 返回根目录
cd /app

# 创建日志目录
mkdir -p logs

# 启动应用
echo "🎯 Starting application with PM2..."
pm2-runtime start ecosystem.config.js
