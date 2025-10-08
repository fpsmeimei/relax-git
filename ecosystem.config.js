// PM2 配置文件 - 用于 Railway 部署
console.log('🔍 PM2 Environment Variables Debug:');
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50), '...');
console.log('REDIS_URL:', process.env.REDIS_URL?.substring(0, 30), '...');

module.exports = {
  apps: [
    {
      name: 'relax-git-api',
      cwd: './apps/api',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || process.env.API_PORT || 3001,
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
    },
    // Web 服务 - 运行在内部端口 8080
    {
      name: 'relax-git-web',
      cwd: './apps/web',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 8080, // 内部端口
        NEXT_PUBLIC_API_URL: '/api', // 通过 API 代理
        NEXTAUTH_URL:
          process.env.NEXTAUTH_URL ||
          `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        AUTH_SECRET: process.env.NEXTAUTH_SECRET,
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_file: './logs/web-combined.log',
      time: true,
    },
  ],
};
