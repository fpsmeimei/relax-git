#!/bin/sh

# Railway 启动脚本 - 确保数据库迁移和应用启动

echo "🚀 Starting Relax-Git Application..."

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
