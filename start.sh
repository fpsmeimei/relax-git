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

# 启动应用（无守护进程模式，Railway 需要前台进程）
echo "🎯 Starting application with PM2..."
echo "📋 PM2 will start API first (port 3001), then Web (port $PORT)"
pm2 start ecosystem.config.js --no-daemon
