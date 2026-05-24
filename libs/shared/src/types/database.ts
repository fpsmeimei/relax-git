// 数据库相关类型定义
// 基于 Prisma Schema 生成的类型

// 重新导出 Prisma 类型
export type {
  BaseSnapshot,
  Comment,
  Repository,
  TimelineEvent,
  User,
  UserSession,
} from '../generated/prisma-client/index';

export {
  BaseSnapshotStatus,
  CommentAnchorType,
  CommentStatus,
  RepositoryVisibility,
  TimelineEventType,
  UserRole,
} from '../generated/prisma-client/index';

// 导入类型用于接口定义
import type {
  BaseSnapshot,
  Comment,
  Repository,
  TimelineEvent,
  User,
  UserSession,
} from '../generated/prisma-client/index';

import {
  BaseSnapshotStatus,
  CommentAnchorType,
  CommentStatus,
  RepositoryVisibility,
  TimelineEventType,
  UserRole,
} from '../generated/prisma-client/index';

// 扩展类型定义
export interface UserWithRelations extends User {
  ownedRepositories?: Repository[];
  snapshots?: BaseSnapshot[];
  comments?: Comment[];
  timelineEvents?: TimelineEvent[];
  sessions?: UserSession[];
}

export interface RepositoryWithRelations extends Repository {
  owner?: User;
  snapshots?: BaseSnapshot[];
  timelineEvents?: TimelineEvent[];
}

export interface SnapshotWithRelations extends BaseSnapshot {
  repository?: Repository;
  owner?: User;
  comments?: Comment[];
  timelineEvents?: TimelineEvent[];
}

export interface CommentWithRelations extends Comment {
  snapshot?: BaseSnapshot;
  author?: User;
  parent?: Comment;
  replies?: Comment[];
  timelineEvents?: TimelineEvent[];
}

export interface TimelineEventWithRelations extends TimelineEvent {
  repository?: Repository;
  actor?: User;
  snapshot?: BaseSnapshot;
  comment?: Comment;
}

// 创建和更新类型
export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  avatar?: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  email?: string;
  username?: string;
  avatar?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface CreateRepositoryInput {
  name: string;
  gitUrl: string;
  ownerId: string;
  defaultBranch?: string;
  visibility?: RepositoryVisibility;
  description?: string;
}

export interface UpdateRepositoryInput {
  name?: string;
  gitUrl?: string;
  defaultBranch?: string;
  visibility?: RepositoryVisibility;
  description?: string;
  isActive?: boolean;
}

export interface CreateSnapshotInput {
  repoId: string;
  ownerId: string;
  commitSha: string;
  branchName: string;
  title?: string;
  description?: string;
  expiresAt: Date;
}

export interface UpdateSnapshotInput {
  status?: BaseSnapshotStatus;
  worktreePath?: string;
  bundlePath?: string;
  title?: string;
  description?: string;
  processedAt?: Date;
  errorMessage?: string;
}

export interface CreateCommentInput {
  snapshotId: string;
  authorId: string;
  content: string;
  anchorType: CommentAnchorType;
  commitSha?: string;
  filePath?: string;
  lineStart?: number;
  lineEnd?: number;
  parentId?: string;
}

export interface UpdateCommentInput {
  content?: string;
  status?: CommentStatus;
  isResolved?: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface CreateTimelineEventInput {
  repoId: string;
  type: TimelineEventType;
  actorId: string;
  snapshotId?: string;
  commentId?: string;
  payload: Record<string, unknown>;
}

// 查询过滤器类型
export interface UserFilter {
  email?: string;
  username?: string;
  role?: UserRole;
  isActive?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface RepositoryFilter {
  ownerId?: string;
  visibility?: RepositoryVisibility;
  isActive?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface SnapshotFilter {
  repoId?: string;
  ownerId?: string;
  status?: BaseSnapshotStatus;
  commitSha?: string;
  branchName?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  expiresAfter?: Date;
  expiresBefore?: Date;
}

export interface CommentFilter {
  snapshotId?: string;
  authorId?: string;
  anchorType?: CommentAnchorType;
  status?: CommentStatus;
  isResolved?: boolean;
  filePath?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface TimelineEventFilter {
  repoId?: string;
  actorId?: string;
  type?: TimelineEventType;
  snapshotId?: string;
  commentId?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

// 分页类型
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
