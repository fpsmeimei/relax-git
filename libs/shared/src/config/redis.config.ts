// Redis 配置

export interface RedisConfig {
  host: string;
  port: number;
  password?: string | undefined;
  db?: number;
  maxRetriesPerRequest?: number;
  retryDelayOnFailover?: number;
  lazyConnect?: boolean;
}

export const getRedisConfig = (): RedisConfig => {
  // 如果有 REDIS_URL，优先使用
  const redisUrl = process.env['REDIS_URL'];
  console.log('🔍 Redis Config Debug:');
  console.log('REDIS_URL:', redisUrl);

  if (redisUrl) {
    try {
      const url = new URL(redisUrl);
      const config = {
        host: url.hostname,
        port: parseInt(url.port || '6379', 10),
        password: url.password || undefined,
        db: parseInt(url.pathname.slice(1) || '0', 10),
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        lazyConnect: true,
      };
      console.log('Parsed Redis config:', {
        host: config.host,
        port: config.port,
      });
      return config;
    } catch (error) {
      console.warn('Invalid REDIS_URL, falling back to individual env vars');
    }
  }

  // 回退到单独的环境变量
  return {
    host: process.env['REDIS_HOST'] ?? 'localhost',
    port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
    password: process.env['REDIS_PASSWORD'] ?? undefined,
    db: parseInt(process.env['REDIS_DB'] ?? '0', 10),
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    lazyConnect: true,
  };
};

export const getRedisUrl = (): string => {
  const config = getRedisConfig();
  const auth = config.password ? `:${config.password}@` : '';
  return `redis://${auth}${config.host}:${config.port}/${config.db}`;
};

export const REDIS_KEYS = {
  SNAPSHOT_QUEUE: 'snapshot:queue',
  SNAPSHOT_STATUS: 'snapshot:status',
  USER_SESSION: 'user:session',
  RATE_LIMIT: 'rate:limit',
  CACHE_PREFIX: 'cache:',
} as const;
