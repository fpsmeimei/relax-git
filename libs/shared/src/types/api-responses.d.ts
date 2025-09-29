/**
 * API 响应类型定义
 * 统一的 API 响应格式和类型安全
 */
/**
 * 标准 API 响应格式
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}
/**
 * 成功响应
 */
export interface SuccessResponse<T = unknown> extends ApiResponse<T> {
  success: true;
  data: T;
  error?: never;
}
/**
 * 错误响应
 */
export interface ErrorResponse extends ApiResponse<never> {
  success: false;
  data?: never;
  error: string;
  details?: Record<string, unknown>;
}
/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
/**
 * 分页查询参数
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
/**
 * 搜索查询参数
 */
export interface SearchQuery extends PaginationQuery {
  search?: string;
  filters?: Record<string, unknown>;
}
/**
 * 用户响应数据
 */
export interface UserResponse {
  id: string;
  email: string;
  username: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
/**
 * 用户详情响应（包含关联数据）
 */
export interface UserDetailResponse extends UserResponse {
  repositoriesCount: number;
  snapshotsCount: number;
  commentsCount: number;
  lastLoginAt?: string;
}
/**
 * 用户列表响应
 */
export type UsersListResponse = PaginatedResponse<UserResponse>;
/**
 * 用户统计响应
 */
export interface UserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  usersByRole: Record<string, number>;
  newUsersThisMonth: number;
  lastUpdated: string;
}
/**
 * 仓库响应数据
 */
export interface RepositoryResponse {
  id: string;
  name: string;
  gitUrl: string;
  ownerId: string;
  defaultBranch: string;
  visibility: string;
  description?: string;
  isActive: boolean;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    username: string;
    email: string;
  };
}
/**
 * 仓库详情响应
 */
export interface RepositoryDetailResponse extends RepositoryResponse {
  snapshotsCount: number;
  activeSnapshotsCount: number;
  lastSnapshotAt?: string;
  collaboratorsCount: number;
}
/**
 * 仓库列表响应
 */
export type RepositoriesListResponse = PaginatedResponse<RepositoryResponse>;
/**
 * 快照响应数据
 */
export interface SnapshotResponse {
  id: string;
  repoId: string;
  ownerId: string;
  commitSha: string;
  branchName: string;
  status: string;
  title?: string;
  description?: string;
  worktreePath?: string;
  bundlePath?: string;
  expiresAt: string;
  processedAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  repository?: {
    id: string;
    name: string;
    gitUrl: string;
    ownerId: string;
    defaultBranch: string;
    visibility: string;
    description?: string;
  };
  owner?: {
    id: string;
    username: string;
    email: string;
  };
}
/**
 * 快照创建响应
 */
export interface SnapshotCreateResponse {
  id: string;
  status: string;
  estimatedTime: number;
  queuePosition?: number;
}
/**
 * 快照列表响应
 */
export type SnapshotsListResponse = PaginatedResponse<SnapshotResponse>;
/**
 * 快照统计响应
 */
export interface SnapshotStatsResponse {
  totalSnapshots: number;
  activeSnapshots: number;
  snapshotsByStatus: Record<string, number>;
  averageProcessingTime: number;
  lastUpdated: string;
}
/**
 * 评论响应数据
 */
export interface CommentResponse {
  id: string;
  snapshotId: string;
  authorId: string;
  content: string;
  anchorType: string;
  commitSha?: string;
  filePath?: string;
  lineStart?: number;
  lineEnd?: number;
  status: string;
  parentId?: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  repliesCount?: number;
}
/**
 * 评论列表响应
 */
export type CommentsListResponse = PaginatedResponse<CommentResponse>;
/**
 * 时间线事件响应数据
 */
export interface TimelineEventResponse {
  id: string;
  repoId: string;
  type: string;
  actorId: string;
  snapshotId?: string;
  commentId?: string;
  payload: Record<string, unknown>;
  createdAt: string;
  actor?: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  repository?: {
    id: string;
    name: string;
  };
}
/**
 * 时间线事件列表响应
 */
export type TimelineEventsListResponse =
  PaginatedResponse<TimelineEventResponse>;
/**
 * 登录响应
 */
export interface AuthLoginResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}
/**
 * 注册响应
 */
export interface AuthRegisterResponse {
  user: UserResponse;
  message: string;
}
/**
 * 令牌刷新响应
 */
export interface AuthRefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}
/**
 * 健康检查响应
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: {
      status: 'connected' | 'disconnected' | 'error';
      responseTime?: number;
      error?: string;
    };
    redis: {
      status: 'connected' | 'disconnected' | 'error';
      responseTime?: number;
      error?: string;
    };
    worker: {
      status: 'running' | 'stopped' | 'error';
      queueSize?: number;
      error?: string;
    };
  };
  metrics?: {
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
}
/**
 * API 错误代码
 */
export declare enum ApiErrorCode {
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  REPOSITORY_NOT_FOUND = 'REPOSITORY_NOT_FOUND',
  SNAPSHOT_NOT_FOUND = 'SNAPSHOT_NOT_FOUND',
  COMMENT_NOT_FOUND = 'COMMENT_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  REPOSITORY_ACCESS_DENIED = 'REPOSITORY_ACCESS_DENIED',
  SNAPSHOT_ACCESS_DENIED = 'SNAPSHOT_ACCESS_DENIED',
  SNAPSHOT_LIMIT_EXCEEDED = 'SNAPSHOT_LIMIT_EXCEEDED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  STORAGE_LIMIT_EXCEEDED = 'STORAGE_LIMIT_EXCEEDED',
}
/**
 * 详细错误信息
 */
export interface ApiErrorDetail {
  code: ApiErrorCode;
  message: string;
  field?: string;
  value?: unknown;
  constraints?: string[];
}
//# sourceMappingURL=api-responses.d.ts.map
