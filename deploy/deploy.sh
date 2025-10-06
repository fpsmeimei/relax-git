#!/bin/bash

# Relax-Git 一键部署脚本
# 使用方法: ./deploy.sh [环境] [域名]
# 示例: ./deploy.sh production your-domain.com

set -e

ENVIRONMENT=${1:-production}
DOMAIN=${2:-localhost}

echo "🚀 开始部署 Relax-Git 到 $ENVIRONMENT 环境"
echo "📡 域名: $DOMAIN"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 创建环境变量文件
echo "📝 创建环境变量配置..."
cat > .env.production << EOF
# 数据库配置
POSTGRES_DB=relax_git
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$(openssl rand -base64 32)
POSTGRES_PORT=5432

# Redis 配置
REDIS_PASSWORD=$(openssl rand -base64 32)
REDIS_PORT=6379

# API 配置
JWT_SECRET=$(openssl rand -base64 64)
CORS_ORIGIN=https://$DOMAIN
API_PORT=3001

# 前端配置
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
NEXT_PUBLIC_SOCKET_URL=https://$DOMAIN

# NextAuth 配置
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://$DOMAIN
EOF

echo "✅ 环境变量配置完成"

# 构建和启动服务
echo "🔨 构建 Docker 镜像..."
docker-compose -f docker-compose.prod.yml --env-file .env.production build

echo "🚀 启动服务..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 运行数据库迁移
echo "📊 运行数据库迁移..."
docker-compose -f docker-compose.prod.yml --env-file .env.production exec api pnpm prisma migrate deploy

echo "✅ 部署完成！"
echo ""
echo "🌐 访问地址:"
echo "   前端: https://$DOMAIN"
echo "   API:  https://$DOMAIN/api"
echo ""
echo "📊 监控命令:"
echo "   查看日志: docker-compose -f docker-compose.prod.yml logs -f"
echo "   查看状态: docker-compose -f docker-compose.prod.yml ps"
echo "   停止服务: docker-compose -f docker-compose.prod.yml down"
echo ""
echo "🔐 重要提醒:"
echo "   请妥善保管 .env.production 文件中的密码"
echo "   建议配置 SSL 证书以启用 HTTPS"
