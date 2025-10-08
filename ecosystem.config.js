// PM2 配置文件 - 用于 Railway 部署
console.log('🔍 PM2 Environment Variables Debug:');
console.log('PORT:', process.env.PORT);
console.log('REDIS_URL:', process.env.REDIS_URL?.substring(0, 30), '...');

module.exports = {
  apps: [
    // API 服务 - 先启动，运行在内部端口
    {
      name: 'relax-git-api',
      cwd: './apps/api',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001, // 固定内部端口
        DATABASE_URL: process.env.DATABASE_URL,
        REDIS_URL: process.env.REDIS_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true,
      wait_ready: true,
      listen_timeout: 8000,
    },
    // Web 服务 - 后启动，运行在主端口（Railway 对外暴露）
    {
      name: 'relax-git-web',
      cwd: './apps/web',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000, // Railway 主端口
        NEXT_PUBLIC_API_URL: 'http://localhost:3001', // 指向内部 API 端口
        NEXTAUTH_URL:
          process.env.NEXTAUTH_URL ||
          `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        AUTH_SECRET: process.env.NEXTAUTH_SECRET,
        AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || 'true',
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_file: './logs/web-combined.log',
      time: true,
      wait_ready: true,
      listen_timeout: 15000, // 给 Web 服务更多启动时间
    },
  ],
};
