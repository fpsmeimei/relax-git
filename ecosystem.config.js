// PM2 配置文件 - 用于 Railway 部署
console.log('🔍 PM2 Environment Variables Debug:');
console.log('PORT:', process.env.PORT);
console.log('REDIS_URL:', process.env.REDIS_URL?.substring(0, 30), '...');

module.exports = {
  apps: [
    // Web 服务 - 优先启动，占用主端口（Railway 对外暴露）
    {
      name: 'relax-git-web',
      cwd: './apps/web',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000, // 强制使用 Railway 主端口
        NEXT_PUBLIC_API_URL: 'http://localhost:4000', // 指向内部 API 端口
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
    // API 服务 - 后启动，运行在内部端口
    {
      name: 'relax-git-api',
      cwd: './apps/api',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 4000, // 完全不同的内部端口
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
    // Worker 服务 - 独立进程处理快照任务
    {
      name: 'relax-git-worker',
      cwd: './apps/worker',
      script: './relax-git-worker',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
        REDIS_URL: process.env.REDIS_URL,
        GIT_TEMP_DIR: '/tmp/relax-git-repos',
        GIT_BUNDLE_DIR: '/tmp/relax-git-bundles',
        WORKER_WORK_DIR: '/tmp/relax-git-worker',
        WORKER_CONCURRENCY: process.env.WORKER_CONCURRENCY || '2',
        WORKER_QUEUE_NAME: 'snapshot:queue',
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G', // Worker 需要更多内存处理 Git 操作
      error_file: './logs/worker-error.log',
      out_file: './logs/worker-out.log',
      log_file: './logs/worker-combined.log',
      time: true,
      autorestart: true,
      restart_delay: 5000, // Worker 重启延迟
    },
  ],
};
