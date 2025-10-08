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

# 等待数据库连接（减少等待时间）
echo "⏳ Waiting for database connection..."
sleep 2

# 运行数据库迁移（后台运行，不阻塞启动）
echo "🔄 Running database migrations..."
cd /app/apps/api
npx prisma db push --accept-data-loss > /app/logs/migration.log 2>&1 &

# 返回根目录
cd /app

# 创建日志目录
mkdir -p logs

# 启动应用（分步启动确保端口优先级）
echo "🎯 Starting Web service first..."
pm2 start ecosystem.config.js --only relax-git-web

# 等待 Web 服务完全启动
echo "⏳ Waiting for Web service to fully start..."
sleep 10

# 启动 API 服务
echo "🎯 Starting API service..."
pm2 start ecosystem.config.js --only relax-git-api

# 显示状态并保持前台运行
echo "📋 All services started, switching to no-daemon mode..."
pm2 logs --no-daemon
