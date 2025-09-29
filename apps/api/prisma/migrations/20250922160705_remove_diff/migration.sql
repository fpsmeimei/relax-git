-- CreateEnum
CREATE TYPE "public"."user_roles" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "public"."member_roles" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."join_request_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."repository_visibility" AS ENUM ('public_all', 'public_readonly', 'private');

-- CreateEnum
CREATE TYPE "public"."snapshot_status" AS ENUM ('QUEUED', 'PROCESSING', 'READY', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."comment_anchor_types" AS ENUM ('SNAPSHOT', 'COMMIT', 'FILE', 'LINE');

-- CreateEnum
CREATE TYPE "public"."comment_status" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "public"."timeline_event_types" AS ENUM ('REPOSITORY_CREATED', 'SNAPSHOT_CREATED', 'SNAPSHOT_READY', 'SNAPSHOT_EXPIRED', 'COMMENT_CREATED', 'COMMENT_UPDATED', 'COMMENT_RESOLVED', 'USER_JOINED');

-- CreateEnum
CREATE TYPE "public"."search_type" AS ENUM ('CONTENT', 'FILENAME', 'REGEX');

-- CreateEnum
CREATE TYPE "public"."notification_types" AS ENUM ('COMMENT_REPLY');

-- CreateTable
CREATE TABLE "public"."comment_likes" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "public"."user_roles" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."repositories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gitUrl" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "visibility" "public"."repository_visibility" NOT NULL DEFAULT 'private',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repositories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."members" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."member_roles" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."join_requests" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT,
    "status" "public"."join_request_status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "join_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."snapshots" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "commitSha" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "worktree_path" TEXT,
    "bundle_path" TEXT,
    "status" "public"."snapshot_status" NOT NULL DEFAULT 'QUEUED',
    "title" TEXT,
    "description" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "error_message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comments" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "anchorType" "public"."comment_anchor_types" NOT NULL,
    "commitSha" TEXT,
    "filePath" TEXT,
    "lineStart" INTEGER,
    "lineEnd" INTEGER,
    "status" "public"."comment_status" NOT NULL DEFAULT 'PUBLISHED',
    "parentId" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."timeline_events" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "type" "public"."timeline_event_types" NOT NULL,
    "actorId" TEXT NOT NULL,
    "snapshotId" TEXT,
    "commentId" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."search_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "snapshotId" TEXT,
    "query" TEXT NOT NULL,
    "searchType" "public"."search_type" NOT NULL DEFAULT 'CONTENT',
    "resultsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "type" "public"."notification_types" NOT NULL,
    "commentId" TEXT NOT NULL,
    "parentId" TEXT,
    "snapshotId" TEXT,
    "content" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comment_likes_commentId_idx" ON "public"."comment_likes"("commentId");

-- CreateIndex
CREATE INDEX "comment_likes_userId_idx" ON "public"."comment_likes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "comment_likes_commentId_userId_key" ON "public"."comment_likes"("commentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_key" ON "public"."user_sessions"("token");

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "public"."user_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_sessions_expiresAt_idx" ON "public"."user_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "repositories_ownerId_idx" ON "public"."repositories"("ownerId");

-- CreateIndex
CREATE INDEX "repositories_visibility_idx" ON "public"."repositories"("visibility");

-- CreateIndex
CREATE UNIQUE INDEX "repositories_ownerId_name_key" ON "public"."repositories"("ownerId", "name");

-- CreateIndex
CREATE INDEX "members_repoId_idx" ON "public"."members"("repoId");

-- CreateIndex
CREATE INDEX "members_userId_idx" ON "public"."members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "members_repoId_userId_key" ON "public"."members"("repoId", "userId");

-- CreateIndex
CREATE INDEX "join_requests_repoId_idx" ON "public"."join_requests"("repoId");

-- CreateIndex
CREATE INDEX "join_requests_userId_idx" ON "public"."join_requests"("userId");

-- CreateIndex
CREATE INDEX "join_requests_status_idx" ON "public"."join_requests"("status");

-- CreateIndex
CREATE INDEX "snapshots_repoId_idx" ON "public"."snapshots"("repoId");

-- CreateIndex
CREATE INDEX "snapshots_ownerId_idx" ON "public"."snapshots"("ownerId");

-- CreateIndex
CREATE INDEX "snapshots_status_idx" ON "public"."snapshots"("status");

-- CreateIndex
CREATE INDEX "snapshots_expiresAt_idx" ON "public"."snapshots"("expiresAt");

-- CreateIndex
CREATE INDEX "snapshots_commitSha_idx" ON "public"."snapshots"("commitSha");

-- CreateIndex
CREATE INDEX "comments_snapshotId_idx" ON "public"."comments"("snapshotId");

-- CreateIndex
CREATE INDEX "comments_authorId_idx" ON "public"."comments"("authorId");

-- CreateIndex
CREATE INDEX "comments_status_idx" ON "public"."comments"("status");

-- CreateIndex
CREATE INDEX "comments_parentId_idx" ON "public"."comments"("parentId");

-- CreateIndex
CREATE INDEX "comments_commitSha_idx" ON "public"."comments"("commitSha");

-- CreateIndex
CREATE INDEX "comments_filePath_idx" ON "public"."comments"("filePath");

-- CreateIndex
CREATE INDEX "timeline_events_repoId_idx" ON "public"."timeline_events"("repoId");

-- CreateIndex
CREATE INDEX "timeline_events_actorId_idx" ON "public"."timeline_events"("actorId");

-- CreateIndex
CREATE INDEX "timeline_events_type_idx" ON "public"."timeline_events"("type");

-- CreateIndex
CREATE INDEX "timeline_events_createdAt_idx" ON "public"."timeline_events"("createdAt");

-- CreateIndex
CREATE INDEX "timeline_events_snapshotId_idx" ON "public"."timeline_events"("snapshotId");

-- CreateIndex
CREATE INDEX "timeline_events_commentId_idx" ON "public"."timeline_events"("commentId");

-- CreateIndex
CREATE INDEX "search_history_userId_idx" ON "public"."search_history"("userId");

-- CreateIndex
CREATE INDEX "search_history_repositoryId_idx" ON "public"."search_history"("repositoryId");

-- CreateIndex
CREATE INDEX "search_history_createdAt_idx" ON "public"."search_history"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "public"."notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_actorId_idx" ON "public"."notifications"("actorId");

-- CreateIndex
CREATE INDEX "notifications_commentId_idx" ON "public"."notifications"("commentId");

-- CreateIndex
CREATE INDEX "notifications_snapshotId_idx" ON "public"."notifications"("snapshotId");

-- AddForeignKey
ALTER TABLE "public"."comment_likes" ADD CONSTRAINT "comment_likes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comment_likes" ADD CONSTRAINT "comment_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repositories" ADD CONSTRAINT "repositories_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."members" ADD CONSTRAINT "members_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "public"."repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."members" ADD CONSTRAINT "members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."join_requests" ADD CONSTRAINT "join_requests_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "public"."repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."join_requests" ADD CONSTRAINT "join_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."snapshots" ADD CONSTRAINT "snapshots_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "public"."repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."snapshots" ADD CONSTRAINT "snapshots_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "public"."snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."timeline_events" ADD CONSTRAINT "timeline_events_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "public"."repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."timeline_events" ADD CONSTRAINT "timeline_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."timeline_events" ADD CONSTRAINT "timeline_events_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "public"."snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."timeline_events" ADD CONSTRAINT "timeline_events_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."search_history" ADD CONSTRAINT "search_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."search_history" ADD CONSTRAINT "search_history_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "public"."repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."search_history" ADD CONSTRAINT "search_history_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "public"."snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
