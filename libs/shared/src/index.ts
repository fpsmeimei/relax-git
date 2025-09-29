// Relax-Git 共享类型和工具库入口文件

// Prisma 客户端导出（保持不从根导出，统一从子路径导入）
// 注意：在 apps/api 中，所有 Prisma 枚举与类型请从
// '@relax-git/shared/generated/prisma-client' 导入。
// 这里不再从根导出以避免误用与包体积膨胀。
// export * from './generated/prisma-client';

// 重新导出数据库类型，确保API应用能正确导入
export * from './types/database';

// 类型定义导出
export * from './types/api';
export * from './types/common';
export * from './types/database';
// export * from './types/prisma-types'; // 暂时禁用，等待真实 Prisma 客户端生成

// API响应类型（避免冲突，使用命名导出）
export type {
  ApiErrorCode,
  ApiErrorDetail,
  AuthRefreshResponse,
  AuthRegisterResponse,
  CommentResponse,
  CommentsListResponse,
  ErrorResponse,
  HealthCheckResponse,
  PaginationQuery,
  RepositoriesListResponse,
  RepositoryDetailResponse,
  SearchQuery,
  SnapshotCreateResponse,
  SnapshotResponse,
  SnapshotStatsResponse,
  SnapshotsListResponse,
  ApiResponse as StandardApiResponse,
  AuthLoginResponse as StandardAuthLoginResponse,
  PaginatedResponse as StandardPaginatedResponse,
  RepositoryResponse as StandardRepositoryResponse,
  SuccessResponse,
  TimelineEventResponse,
  TimelineEventsListResponse,
  UserDetailResponse,
  UserResponse,
  UserStatsResponse,
  UsersListResponse,
} from './types/api-responses';

// 配置导出
export * from './config/database.config';

// 内联导出 Redis 配置与常量（避免对 dist/config 物理文件的依赖）
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

export const REDIS_KEYS = {
  SNAPSHOT_QUEUE: 'snapshot:queue',
  SNAPSHOT_STATUS: 'snapshot:status',
  USER_SESSION: 'user:session',
  RATE_LIMIT: 'rate:limit',
  CACHE_PREFIX: 'cache:',
} as const;

// 工具函数导出
export * from './utils/type-guards';
export * from './utils/validation';

// 直接导出关键常量，避免对子路径产物的依赖（用于 API 快速接入）
export const SNAPSHOT_CONFIG = {
  MAX_CONCURRENT: 20,
  DEFAULT_TTL_DAYS: 7,
  MAX_SIZE_MB: 1024,
  CREATION_TIMEOUT_SECONDS: 30,
} as const;
