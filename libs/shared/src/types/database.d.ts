export type {
  Comment,
  Repository,
  Snapshot,
  TimelineEvent,
  User,
  UserSession,
} from '../generated/prisma-client/index';
export {
  CommentAnchorType,
  CommentStatus,
  RepositoryVisibility,
  SnapshotStatus,
  TimelineEventType,
  UserRole,
} from '../generated/prisma-client/index';
import type {
  Comment,
  Repository,
  Snapshot,
  TimelineEvent,
  User,
  UserSession,
} from '../generated/prisma-client/index';
import {
  CommentAnchorType,
  CommentStatus,
  RepositoryVisibility,
  SnapshotStatus,
  TimelineEventType,
  UserRole,
} from '../generated/prisma-client/index';
export interface UserWithRelations extends User {
  ownedRepositories?: Repository[];
  snapshots?: Snapshot[];
  comments?: Comment[];
  timelineEvents?: TimelineEvent[];
  sessions?: UserSession[];
}
export interface RepositoryWithRelations extends Repository {
  owner?: User;
  snapshots?: Snapshot[];
  timelineEvents?: TimelineEvent[];
}
export interface SnapshotWithRelations extends Snapshot {
  repository?: Repository;
  owner?: User;
  comments?: Comment[];
  timelineEvents?: TimelineEvent[];
}
export interface CommentWithRelations extends Comment {
  snapshot?: Snapshot;
  author?: User;
  parent?: Comment;
  replies?: Comment[];
  timelineEvents?: TimelineEvent[];
}
export interface TimelineEventWithRelations extends TimelineEvent {
  repository?: Repository;
  actor?: User;
  snapshot?: Snapshot;
  comment?: Comment;
}
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
  status?: SnapshotStatus;
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
  status?: SnapshotStatus;
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
//# sourceMappingURL=database.d.ts.map
