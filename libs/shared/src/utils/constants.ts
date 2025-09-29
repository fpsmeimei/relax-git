// 项目常量定义

export const APP_CONFIG = {
  NAME: 'Relax-Git',
  VERSION: '0.1.0',
  DESCRIPTION: '基于 Git worktree 的现代化协作平台',
} as const;

export const API_CONFIG = {
  PREFIX: '/api/v1',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
} as const;

export const SNAPSHOT_CONFIG = {
  MAX_CONCURRENT: 3,
  DEFAULT_TTL_DAYS: 7,
  MAX_SIZE_MB: 1024,
  CREATION_TIMEOUT_SECONDS: 30,
} as const;

export const REALTIME_CONFIG = {
  MAX_EVENT_DELAY_MS: 500,
  HEARTBEAT_INTERVAL_MS: 30000,
  RECONNECT_ATTEMPTS: 5,
} as const;

export const PERFORMANCE_TARGETS = {
  SNAPSHOT_CREATION_MAX_SECONDS: 3,
  EVENT_PUSH_MAX_MS: 500,
  API_AVAILABILITY_PERCENT: 99.9,
  FUNCTION_PASS_RATE_PERCENT: 95,
} as const;
