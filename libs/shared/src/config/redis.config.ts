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
