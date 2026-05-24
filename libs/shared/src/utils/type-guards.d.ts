/**
 * 类型守卫和类型转换工具
 * 提供类型安全的数据验证和转换功能
 */
import type {
  CommentAnchorType,
  CommentStatus,
  RepositoryVisibility,
  SnapshotStatus,
  TimelineEventType,
  UserRole,
} from '../generated/prisma-client/index';
import type {
  PrismaComment,
  PrismaRepository,
  PrismaSnapshot,
  PrismaUser,
} from '../types/prisma-types';
/**
 * 检查值是否为字符串
 */
export declare function isString(value: unknown): value is string;
/**
 * 检查值是否为数字
 */
export declare function isNumber(value: unknown): value is number;
/**
 * 检查值是否为布尔值
 */
export declare function isBoolean(value: unknown): value is boolean;
/**
 * 检查值是否为日期
 */
export declare function isDate(value: unknown): value is Date;
/**
 * 检查值是否为有效的日期字符串
 */
export declare function isDateString(value: unknown): value is string;
/**
 * 检查值是否为对象
 */
export declare function isObject(
  value: unknown
): value is Record<string, unknown>;
/**
 * 检查值是否为数组
 */
export declare function isArray(value: unknown): value is unknown[];
/**
 * 检查值是否为有效的用户角色
 */
export declare function isUserRole(value: unknown): value is UserRole;
/**
 * 检查值是否为有效的仓库可见性
 */
export declare function isRepositoryVisibility(
  value: unknown
): value is RepositoryVisibility;
/**
 * 检查值是否为有效的快照状态
 */
export declare function isSnapshotStatus(
  value: unknown
): value is SnapshotStatus;
/**
 * 检查值是否为有效的评论锚点类型
 */
export declare function isCommentAnchorType(
  value: unknown
): value is CommentAnchorType;
/**
 * 检查值是否为有效的评论状态
 */
export declare function isCommentStatus(value: unknown): value is CommentStatus;
/**
 * 检查值是否为有效的时间线事件类型
 */
export declare function isTimelineEventType(
  value: unknown
): value is TimelineEventType;
/**
 * 检查对象是否为有效的用户
 */
export declare function isPrismaUser(value: unknown): value is PrismaUser;
/**
 * 检查对象是否为有效的仓库
 */
export declare function isPrismaRepository(
  value: unknown
): value is PrismaRepository;
/**
 * 检查对象是否为有效的快照
 */
export declare function isPrismaSnapshot(
  value: unknown
): value is PrismaSnapshot;
/**
 * 检查对象是否为有效的评论
 */
export declare function isPrismaComment(value: unknown): value is PrismaComment;
/**
 * 安全地转换为用户类型
 */
export declare function toPrismaUser(data: unknown): PrismaUser;
/**
 * 安全地转换为仓库类型
 */
export declare function toPrismaRepository(data: unknown): PrismaRepository;
/**
 * 安全地转换为快照类型
 */
export declare function toPrismaSnapshot(data: unknown): PrismaSnapshot;
/**
 * 安全地转换为评论类型
 */
export declare function toPrismaComment(data: unknown): PrismaComment;
/**
 * 检查数组中的所有元素是否都是有效的用户
 */
export declare function isPrismaUserArray(
  value: unknown
): value is PrismaUser[];
/**
 * 检查数组中的所有元素是否都是有效的仓库
 */
export declare function isPrismaRepositoryArray(
  value: unknown
): value is PrismaRepository[];
/**
 * 检查数组中的所有元素是否都是有效的快照
 */
export declare function isPrismaSnapshotArray(
  value: unknown
): value is PrismaSnapshot[];
/**
 * 检查数组中的所有元素是否都是有效的评论
 */
export declare function isPrismaCommentArray(
  value: unknown
): value is PrismaComment[];
/**
 * 检查对象是否为有效的分页结果
 */
export declare function isPaginatedResult<T>(
  value: unknown,
  itemGuard: (item: unknown) => item is T
): value is {
  items: T[];
  total: number;
  page: number;
  limit: number;
};
/**
 * 安全地解析 JSON 字符串
 */
export declare function safeJsonParse<T>(json: string, fallback: T): T;
/**
 * 安全地转换日期
 */
export declare function toSafeDate(value: unknown): Date | null;
/**
 * 安全地转换为字符串
 */
export declare function toSafeString(value: unknown): string | null;
/**
 * 安全地转换为数字
 */
export declare function toSafeNumber(value: unknown): number | null;
//# sourceMappingURL=type-guards.d.ts.map
