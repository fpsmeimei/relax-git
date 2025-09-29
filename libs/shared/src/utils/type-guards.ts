/**
 * 类型守卫和类型转换工具
 * 提供类型安全的数据验证和转换功能
 */

import type {
  BaseSnapshotStatus,
  CommentAnchorType,
  CommentStatus,
  RepositoryVisibility,
  TimelineEventType,
  UserRole,
} from '../generated/prisma-client';

import type {
  PrismaComment,
  PrismaRepository,
  PrismaSnapshot,
  PrismaUser,
} from '../types/prisma-types';

// ===== 基础类型守卫 =====

/**
 * 检查值是否为字符串
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * 检查值是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 检查值是否为布尔值
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 检查值是否为日期
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * 检查值是否为有效的日期字符串
 */
export function isDateString(value: unknown): value is string {
  return isString(value) && !isNaN(Date.parse(value));
}

/**
 * 检查值是否为对象
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 检查值是否为数组
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

// ===== 枚举类型守卫 =====

/**
 * 检查值是否为有效的用户角色
 */
export function isUserRole(value: unknown): value is UserRole {
  return isString(value) && ['USER', 'ADMIN', 'MODERATOR'].includes(value);
}

/**
 * 检查值是否为有效的仓库可见性
 */
export function isRepositoryVisibility(
  value: unknown
): value is RepositoryVisibility {
  return isString(value) && ['PUBLIC', 'PRIVATE', 'INTERNAL'].includes(value);
}

/**
 * 检查值是否为有效的快照状态
 */
export function isSnapshotStatus(value: unknown): value is BaseSnapshotStatus {
  return (
    isString(value) &&
    ['QUEUED', 'PROCESSING', 'READY', 'FAILED'].includes(value)
  );
}

/**
 * 检查值是否为有效的评论锚点类型
 */
export function isCommentAnchorType(
  value: unknown
): value is CommentAnchorType {
  return (
    isString(value) && ['SNAPSHOT', 'COMMIT', 'FILE', 'LINE'].includes(value)
  );
}

/**
 * 检查值是否为有效的评论状态
 */
export function isCommentStatus(value: unknown): value is CommentStatus {
  return isString(value) && ['DRAFT', 'PUBLISHED', 'HIDDEN'].includes(value);
}

/**
 * 检查值是否为有效的时间线事件类型
 */
export function isTimelineEventType(
  value: unknown
): value is TimelineEventType {
  return (
    isString(value) &&
    [
      'REPOSITORY_CREATED',
      'SNAPSHOT_CREATED',
      'SNAPSHOT_READY',
      'SNAPSHOT_EXPIRED',
      'COMMENT_CREATED',
      'COMMENT_UPDATED',
      'COMMENT_RESOLVED',
      'USER_JOINED',
    ].includes(value)
  );
}

// ===== Prisma 模型类型守卫 =====

/**
 * 检查对象是否为有效的用户
 */
export function isPrismaUser(value: unknown): value is PrismaUser {
  if (!isObject(value)) return false;

  const user = value;
  return (
    isString(user['id']) &&
    isString(user['email']) &&
    isString(user['username']) &&
    isString(user['password']) &&
    isUserRole(user['role']) &&
    isBoolean(user['isActive']) &&
    isDate(user['createdAt']) &&
    isDate(user['updatedAt']) &&
    (user['avatar'] === null || isString(user['avatar']))
  );
}

/**
 * 检查对象是否为有效的仓库
 */
export function isPrismaRepository(value: unknown): value is PrismaRepository {
  if (!isObject(value)) return false;

  const repo = value;
  return (
    isString(repo['id']) &&
    isString(repo['name']) &&
    isString(repo['gitUrl']) &&
    isString(repo['ownerId']) &&
    isString(repo['defaultBranch']) &&
    isRepositoryVisibility(repo['visibility']) &&
    isBoolean(repo['isActive']) &&
    isDate(repo['createdAt']) &&
    isDate(repo['updatedAt']) &&
    (repo['description'] === null || isString(repo['description'])) &&
    (repo['lastSyncAt'] === null || isDate(repo['lastSyncAt']))
  );
}

/**
 * 检查对象是否为有效的快照
 */
export function isPrismaSnapshot(value: unknown): value is PrismaSnapshot {
  if (!isObject(value)) return false;

  const snapshot = value;
  return (
    isString(snapshot['id']) &&
    isString(snapshot['repoId']) &&
    isString(snapshot['ownerId']) &&
    isString(snapshot['commitSha']) &&
    isString(snapshot['branchName']) &&
    isSnapshotStatus(snapshot['status']) &&
    isDate(snapshot['expiresAt']) &&
    isDate(snapshot['createdAt']) &&
    isDate(snapshot['updatedAt']) &&
    (snapshot['title'] === null || isString(snapshot['title'])) &&
    (snapshot['description'] === null || isString(snapshot['description'])) &&
    (snapshot['worktreePath'] === null || isString(snapshot['worktreePath'])) &&
    (snapshot['bundlePath'] === null || isString(snapshot['bundlePath'])) &&
    (snapshot['processedAt'] === null || isDate(snapshot['processedAt'])) &&
    (snapshot['errorMessage'] === null || isString(snapshot['errorMessage']))
  );
}

/**
 * 检查对象是否为有效的评论
 */
export function isPrismaComment(value: unknown): value is PrismaComment {
  if (!isObject(value)) return false;

  const comment = value;
  return (
    isString(comment['id']) &&
    isString(comment['snapshotId']) &&
    isString(comment['authorId']) &&
    isString(comment['content']) &&
    isCommentAnchorType(comment['anchorType']) &&
    isCommentStatus(comment['status']) &&
    isBoolean(comment['isResolved']) &&
    isDate(comment['createdAt']) &&
    isDate(comment['updatedAt']) &&
    (comment['commitSha'] === null || isString(comment['commitSha'])) &&
    (comment['filePath'] === null || isString(comment['filePath'])) &&
    (comment['lineStart'] === null || isNumber(comment['lineStart'])) &&
    (comment['lineEnd'] === null || isNumber(comment['lineEnd'])) &&
    (comment['parentId'] === null || isString(comment['parentId'])) &&
    (comment['resolvedAt'] === null || isDate(comment['resolvedAt'])) &&
    (comment['resolvedBy'] === null || isString(comment['resolvedBy']))
  );
}

// ===== 类型转换工具 =====

/**
 * 安全地转换为用户类型
 */
export function toPrismaUser(data: unknown): PrismaUser {
  if (!isPrismaUser(data)) {
    throw new Error('Invalid user data');
  }
  return data;
}

/**
 * 安全地转换为仓库类型
 */
export function toPrismaRepository(data: unknown): PrismaRepository {
  if (!isPrismaRepository(data)) {
    throw new Error('Invalid repository data');
  }
  return data;
}

/**
 * 安全地转换为快照类型
 */
export function toPrismaSnapshot(data: unknown): PrismaSnapshot {
  if (!isPrismaSnapshot(data)) {
    throw new Error('Invalid snapshot data');
  }
  return data;
}

/**
 * 安全地转换为评论类型
 */
export function toPrismaComment(data: unknown): PrismaComment {
  if (!isPrismaComment(data)) {
    throw new Error('Invalid comment data');
  }
  return data;
}

// ===== 数组类型守卫和转换 =====

/**
 * 检查数组中的所有元素是否都是有效的用户
 */
export function isPrismaUserArray(value: unknown): value is PrismaUser[] {
  return isArray(value) && value.every(isPrismaUser);
}

/**
 * 检查数组中的所有元素是否都是有效的仓库
 */
export function isPrismaRepositoryArray(
  value: unknown
): value is PrismaRepository[] {
  return isArray(value) && value.every(isPrismaRepository);
}

/**
 * 检查数组中的所有元素是否都是有效的快照
 */
export function isPrismaSnapshotArray(
  value: unknown
): value is PrismaSnapshot[] {
  return isArray(value) && value.every(isPrismaSnapshot);
}

/**
 * 检查数组中的所有元素是否都是有效的评论
 */
export function isPrismaCommentArray(value: unknown): value is PrismaComment[] {
  return isArray(value) && value.every(isPrismaComment);
}

// ===== 分页结果类型守卫 =====

/**
 * 检查对象是否为有效的分页结果
 */
export function isPaginatedResult<T>(
  value: unknown,
  itemGuard: (item: unknown) => item is T
): value is { items: T[]; total: number; page: number; limit: number } {
  if (!isObject(value)) return false;

  const result = value;
  return (
    isArray(result['items']) &&
    result['items'].every(itemGuard) &&
    isNumber(result['total']) &&
    isNumber(result['page']) &&
    isNumber(result['limit'])
  );
}

// ===== 工具函数 =====

/**
 * 安全地解析 JSON 字符串
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    const parsed: unknown = JSON.parse(json);
    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * 安全地转换日期
 */
export function toSafeDate(value: unknown): Date | null {
  if (isDate(value)) return value;
  if (isDateString(value)) return new Date(value);
  return null;
}

/**
 * 安全地转换为字符串
 */
export function toSafeString(value: unknown): string | null {
  if (isString(value)) return value;
  if (value === null || value === undefined) return null;
  return String(value);
}

/**
 * 安全地转换为数字
 */
export function toSafeNumber(value: unknown): number | null {
  if (isNumber(value)) return value;
  if (isString(value)) {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }
  return null;
}
