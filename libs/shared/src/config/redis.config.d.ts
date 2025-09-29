export interface RedisConfig {
  host: string;
  port: number;
  password?: string | undefined;
  db?: number;
  maxRetriesPerRequest?: number;
  retryDelayOnFailover?: number;
  lazyConnect?: boolean;
}
export declare const getRedisConfig: () => RedisConfig;
export declare const getRedisUrl: () => string;
export declare const REDIS_KEYS: {
  readonly SNAPSHOT_QUEUE: 'snapshot:queue';
  readonly SNAPSHOT_STATUS: 'snapshot:status';
  readonly USER_SESSION: 'user:session';
  readonly RATE_LIMIT: 'rate:limit';
  readonly CACHE_PREFIX: 'cache:';
};
//# sourceMappingURL=redis.config.d.ts.map
