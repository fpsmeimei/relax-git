# 🚀 Relax-Git 部署指南

让你的 Relax-Git 应用上线，供他人访问使用。

## 📋 部署方案对比

| 方案                 | 成本       | 难度     | 适用场景         |
| -------------------- | ---------- | -------- | ---------------- |
| **Vercel + Railway** | 免费起步   | ⭐⭐     | 个人项目、小团队 |
| **VPS 部署**         | ¥50-100/月 | ⭐⭐⭐   | 中小企业         |
| **云原生**           | ¥200+/月   | ⭐⭐⭐⭐ | 大型项目         |

## 🌟 推荐方案：Vercel + Railway

### 第一步：准备代码仓库

1. **推送代码到 GitHub**

```bash
git add .
git commit -m "feat: 准备部署配置"
git push origin main
```

### 第二步：部署后端到 Railway

1. 访问 [Railway.app](https://railway.app)
2. 使用 GitHub 账号登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择你的 relax-git 仓库
5. 添加环境变量：

```env
# 数据库会自动创建，复制 DATABASE_URL
DATABASE_URL=postgresql://...

# Redis 服务
REDIS_URL=redis://...

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key

# CORS 配置
CORS_ORIGIN=https://your-app.vercel.app

# 端口
PORT=3001
```

6. 部署完成后，复制 Railway 提供的 API 地址

### 第三步：部署前端到 Vercel

1. 访问 [Vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project" → 选择 relax-git 仓库
4. 配置构建设置：
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`

5. 添加环境变量：

```env
# API 地址（使用 Railway 提供的地址）
NEXT_PUBLIC_API_URL=https://your-api.railway.app/api
NEXT_PUBLIC_SOCKET_URL=https://your-api.railway.app

# 应用地址（Vercel 会自动提供）
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# NextAuth 配置
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

6. 点击 "Deploy" 开始部署

### 第四步：配置自定义域名（可选）

1. **在 Vercel 中配置域名**
   - 进入项目设置 → Domains
   - 添加你的域名（如 `relax-git.com`）
   - 按提示配置 DNS 记录

2. **更新 Railway 环境变量**

```env
CORS_ORIGIN=https://relax-git.com
```

## 🖥️ VPS 部署方案

### 服务器要求

- **配置**: 2核4G内存，40G硬盘
- **系统**: Ubuntu 20.04+ / CentOS 8+
- **软件**: Docker, Docker Compose

### 一键部署脚本

```bash
# 1. 克隆代码
git clone https://github.com/your-username/relax-git.git
cd relax-git

# 2. 运行部署脚本
chmod +x deploy/deploy.sh
./deploy/deploy.sh production your-domain.com
```

### 手动部署步骤

1. **安装 Docker**

```bash
curl -fsSL https://get.docker.com | sh
sudo systemctl start docker
sudo systemctl enable docker
```

2. **配置环境变量**

```bash
cp .env.example .env.production
# 编辑 .env.production，填入你的配置
```

3. **启动服务**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

4. **配置 Nginx（可选）**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔧 部署后配置

### 1. 配置 HTTPS

**使用 Let's Encrypt（免费）**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 2. 设置监控

**使用 PM2 监控**

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### 3. 配置备份

**数据库备份脚本**

```bash
#!/bin/bash
# backup.sh
docker exec relax-git-postgres-prod pg_dump -U postgres relax_git > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 📊 性能优化

### CDN 配置

- 使用 Cloudflare 加速静态资源
- 配置图片压缩和缓存

### 数据库优化

- 配置 PostgreSQL 连接池
- 设置合适的索引

### 缓存策略

- Redis 缓存热点数据
- 浏览器缓存静态资源

## 🔍 SEO 优化

### 1. 更新 meta 信息

```typescript
// apps/web/src/app/layout.tsx
export const metadata: Metadata = {
  title: 'Relax-Git - 现代化 Git 协作平台',
  description: '基于 Git worktree 的现代化协作平台，提供实时协作、快照管理和智能代码评论功能',
  keywords: ['Git', '协作', '代码评论', '版本控制', '团队开发'],
  // ...
};
```

### 2. 添加 sitemap

```xml
<!-- public/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://your-domain.com</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- 更多页面... -->
</urlset>
```

### 3. 配置 robots.txt

```txt
# public/robots.txt
User-agent: *
Allow: /
Sitemap: https://your-domain.com/sitemap.xml
```

## 🚨 安全配置

### 1. 环境变量安全

- 使用强密码
- 定期轮换密钥
- 不要在代码中硬编码敏感信息

### 2. 网络安全

- 配置防火墙
- 启用 HTTPS
- 设置 CORS 白名单

### 3. 数据库安全

- 限制数据库访问权限
- 定期备份数据
- 监控异常访问

## 📈 监控和维护

### 日志监控

```bash
# 查看应用日志
docker-compose logs -f api
docker-compose logs -f worker

# 查看系统资源
htop
df -h
```

### 性能监控

- 使用 New Relic 或 DataDog
- 监控 API 响应时间
- 跟踪用户行为数据

## 🆘 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 DATABASE_URL 配置
   - 确认数据库服务状态

2. **API 请求失败**
   - 检查 CORS 配置
   - 确认 API 服务运行状态

3. **前端页面空白**
   - 检查环境变量配置
   - 查看浏览器控制台错误

### 紧急恢复

```bash
# 快速重启所有服务
docker-compose -f docker-compose.prod.yml restart

# 恢复数据库备份
docker exec -i relax-git-postgres-prod psql -U postgres relax_git < backup.sql
```

## 📞 技术支持

如果在部署过程中遇到问题：

1. 查看项目 Issues
2. 参考官方文档
3. 联系技术支持

---

🎉 **恭喜！你的 Relax-Git 应用现在可以让全世界的用户访问了！**
