/**
 * Prisma 类型映射和扩展
 * 提供类型安全的 Prisma 查询结果类型
 */
import type { Prisma } from '../generated/prisma-client/index';
/**
 * 用户相关类型映射
 */
export type PrismaUser = Prisma.UserGetPayload<Record<string, never>>;
export type PrismaUserWithSessions = Prisma.UserGetPayload<{
  include: {
    sessions: true;
  };
}>;
export type PrismaUserWithRepositories = Prisma.UserGetPayload<{
  include: {
    ownedRepositories: true;
  };
}>;
export type PrismaUserWithSnapshots = Prisma.UserGetPayload<{
  include: {
    snapshots: true;
  };
}>;
export type PrismaUserWithComments = Prisma.UserGetPayload<{
  include: {
    comments: true;
  };
}>;
export type PrismaUserWithAllRelations = Prisma.UserGetPayload<{
  include: {
    sessions: true;
    ownedRepositories: true;
    snapshots: true;
    comments: true;
    timelineEvents: true;
  };
}>;
/**
 * 仓库相关类型映射
 */
export type PrismaRepository = Prisma.RepositoryGetPayload<
  Record<string, never>
>;
export type PrismaRepositoryWithOwner = Prisma.RepositoryGetPayload<{
  include: {
    owner: true;
  };
}>;
export type PrismaRepositoryWithSnapshots = Prisma.RepositoryGetPayload<{
  include: {
    snapshots: true;
  };
}>;
export type PrismaRepositoryWithAllRelations = Prisma.RepositoryGetPayload<{
  include: {
    owner: true;
    snapshots: true;
    timelineEvents: true;
  };
}>;
/**
 * 快照相关类型映射
 */
export type PrismaSnapshot = Prisma.SnapshotGetPayload<Record<string, never>>;
export type PrismaSnapshotWithRepository = Prisma.SnapshotGetPayload<{
  include: {
    repository: true;
  };
}>;
export type PrismaSnapshotWithOwner = Prisma.SnapshotGetPayload<{
  include: {
    owner: true;
  };
}>;
export type PrismaSnapshotWithComments = Prisma.SnapshotGetPayload<{
  include: {
    comments: true;
  };
}>;
export type PrismaSnapshotWithAllRelations = Prisma.SnapshotGetPayload<{
  include: {
    repository: {
      include: {
        owner: true;
      };
    };
    owner: true;
    comments: true;
    timelineEvents: true;
  };
}>;
/**
 * 评论相关类型映射
 */
export type PrismaComment = Prisma.CommentGetPayload<Record<string, never>>;
export type PrismaCommentWithAuthor = Prisma.CommentGetPayload<{
  include: {
    author: true;
  };
}>;
export type PrismaCommentWithSnapshot = Prisma.CommentGetPayload<{
  include: {
    snapshot: true;
  };
}>;
export type PrismaCommentWithReplies = Prisma.CommentGetPayload<{
  include: {
    replies: true;
  };
}>;
export type PrismaCommentWithAllRelations = Prisma.CommentGetPayload<{
  include: {
    snapshot: true;
    author: true;
    parent: true;
    replies: true;
    timelineEvents: true;
  };
}>;
/**
 * 时间线事件相关类型映射
 */
export type PrismaTimelineEvent = Prisma.TimelineEventGetPayload<
  Record<string, never>
>;
export type PrismaTimelineEventWithActor = Prisma.TimelineEventGetPayload<{
  include: {
    actor: true;
  };
}>;
export type PrismaTimelineEventWithRepository = Prisma.TimelineEventGetPayload<{
  include: {
    repository: true;
  };
}>;
export type PrismaTimelineEventWithAllRelations =
  Prisma.TimelineEventGetPayload<{
    include: {
      repository: true;
      actor: true;
      snapshot: true;
      comment: true;
    };
  }>;
/**
 * 用户会话相关类型映射
 */
export type PrismaUserSession = Prisma.UserSessionGetPayload<
  Record<string, never>
>;
export type PrismaUserSessionWithUser = Prisma.UserSessionGetPayload<{
  include: {
    user: true;
  };
}>;
/**
 * 用户查询参数类型
 */
export type UserWhereInput = Prisma.UserWhereInput;
export type UserOrderByInput = Prisma.UserOrderByWithRelationInput;
export type UserSelectInput = Prisma.UserSelect;
export type UserIncludeInput = Prisma.UserInclude;
/**
 * 仓库查询参数类型
 */
export type RepositoryWhereInput = Prisma.RepositoryWhereInput;
export type RepositoryOrderByInput = Prisma.RepositoryOrderByWithRelationInput;
export type RepositorySelectInput = Prisma.RepositorySelect;
export type RepositoryIncludeInput = Prisma.RepositoryInclude;
/**
 * 快照查询参数类型
 */
export type SnapshotWhereInput = Prisma.SnapshotWhereInput;
export type SnapshotOrderByInput = Prisma.SnapshotOrderByWithRelationInput;
export type SnapshotSelectInput = Prisma.SnapshotSelect;
export type SnapshotIncludeInput = Prisma.SnapshotInclude;
/**
 * 评论查询参数类型
 */
export type CommentWhereInput = Prisma.CommentWhereInput;
export type CommentOrderByInput = Prisma.CommentOrderByWithRelationInput;
export type CommentSelectInput = Prisma.CommentSelect;
export type CommentIncludeInput = Prisma.CommentInclude;
/**
 * 时间线事件查询参数类型
 */
export type TimelineEventWhereInput = Prisma.TimelineEventWhereInput;
export type TimelineEventOrderByInput =
  Prisma.TimelineEventOrderByWithRelationInput;
export type TimelineEventSelectInput = Prisma.TimelineEventSelect;
export type TimelineEventIncludeInput = Prisma.TimelineEventInclude;
/**
 * 用户会话查询参数类型
 */
export type UserSessionWhereInput = Prisma.UserSessionWhereInput;
export type UserSessionOrderByInput =
  Prisma.UserSessionOrderByWithRelationInput;
export type UserSessionSelectInput = Prisma.UserSessionSelect;
export type UserSessionIncludeInput = Prisma.UserSessionInclude;
/**
 * 创建输入类型
 */
export type UserCreateInput = Prisma.UserCreateInput;
export type RepositoryCreateInput = Prisma.RepositoryCreateInput;
export type SnapshotCreateInput = Prisma.SnapshotCreateInput;
export type CommentCreateInput = Prisma.CommentCreateInput;
export type TimelineEventCreateInput = Prisma.TimelineEventCreateInput;
export type UserSessionCreateInput = Prisma.UserSessionCreateInput;
/**
 * 更新输入类型
 */
export type UserUpdateInput = Prisma.UserUpdateInput;
export type RepositoryUpdateInput = Prisma.RepositoryUpdateInput;
export type SnapshotUpdateInput = Prisma.SnapshotUpdateInput;
export type CommentUpdateInput = Prisma.CommentUpdateInput;
export type TimelineEventUpdateInput = Prisma.TimelineEventUpdateInput;
export type UserSessionUpdateInput = Prisma.UserSessionUpdateInput;
/**
 * 聚合查询结果类型
 */
export type UserAggregateResult = Prisma.GetUserAggregateType<{
  _count: true;
}>;
export type RepositoryAggregateResult = Prisma.GetRepositoryAggregateType<{
  _count: true;
}>;
export type SnapshotAggregateResult = Prisma.GetSnapshotAggregateType<{
  _count: true;
}>;
export type CommentAggregateResult = Prisma.GetCommentAggregateType<{
  _count: true;
}>;
/**
 * 分组查询结果类型
 */
export type UserGroupByResult = Prisma.UserGroupByOutputType;
export type RepositoryGroupByResult = Prisma.RepositoryGroupByOutputType;
export type SnapshotGroupByResult = Prisma.SnapshotGroupByOutputType;
export type CommentGroupByResult = Prisma.CommentGroupByOutputType;
export type TimelineEventGroupByResult = Prisma.TimelineEventGroupByOutputType;
//# sourceMappingURL=prisma-types.d.ts.map
