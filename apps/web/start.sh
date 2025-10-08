#!/bin/bash

# Railway Web 应用启动脚本
echo "🚀 Starting Relax-Git Web Application..."

# 设置环境变量
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-3000}
export NEXT_TELEMETRY_DISABLED=1

# 显示配置信息
echo "📋 Configuration:"
echo "  - NODE_ENV: $NODE_ENV"
echo "  - PORT: $PORT"
echo "  - API_URL: $API_URL"
echo "  - NEXTAUTH_URL: $NEXTAUTH_URL"

# 启动应用
echo "🎯 Starting Next.js application..."
cd /app/apps/web && pnpm start
