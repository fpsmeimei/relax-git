-- CreateEnum
CREATE TYPE "base_snapshot_status" AS ENUM ('QUEUED', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "session_snapshot_status" AS ENUM ('CREATING', 'READY', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "chat_type" AS ENUM ('DIRECT', 'GROUP');

-- CreateEnum
CREATE TYPE "chat_member_roles" AS ENUM ('ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "repository_branches" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "commitSha" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repository_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base_snapshots" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "commitSha" TEXT NOT NULL,
    "worktree_path" TEXT,
    "bundle_path" TEXT,
    "status" "base_snapshot_status" NOT NULL DEFAULT 'QUEUED',
    "error_message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "base_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_snapshots" (
    "id" TEXT NOT NULL,
    "baseSnapshotId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "worktree_path" TEXT,
    "status" "session_snapshot_status" NOT NULL DEFAULT 'CREATING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "last_accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error_message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "type" "chat_type" NOT NULL,
    "name" TEXT,
    "directKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_members" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "chat_member_roles" NOT NULL DEFAULT 'MEMBER',
    "lastReadAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "repository_branches_repoId_idx" ON "repository_branches"("repoId");

-- CreateIndex
CREATE UNIQUE INDEX "repository_branches_repoId_name_key" ON "repository_branches"("repoId", "name");

-- CreateIndex
CREATE INDEX "base_snapshots_repoId_idx" ON "base_snapshots"("repoId");

-- CreateIndex
CREATE INDEX "base_snapshots_branchId_idx" ON "base_snapshots"("branchId");

-- CreateIndex
CREATE INDEX "base_snapshots_status_idx" ON "base_snapshots"("status");

-- CreateIndex
CREATE UNIQUE INDEX "base_snapshots_repoId_branchId_key" ON "base_snapshots"("repoId", "branchId");

-- CreateIndex
CREATE INDEX "session_snapshots_baseSnapshotId_idx" ON "session_snapshots"("baseSnapshotId");

-- CreateIndex
CREATE INDEX "session_snapshots_userId_idx" ON "session_snapshots"("userId");

-- CreateIndex
CREATE INDEX "session_snapshots_expiresAt_idx" ON "session_snapshots"("expiresAt");

-- CreateIndex
CREATE INDEX "session_snapshots_last_accessed_at_idx" ON "session_snapshots"("last_accessed_at");

-- CreateIndex
CREATE UNIQUE INDEX "chats_directKey_key" ON "chats"("directKey");

-- CreateIndex
CREATE INDEX "chat_members_chatId_idx" ON "chat_members"("chatId");

-- CreateIndex
CREATE INDEX "chat_members_userId_idx" ON "chat_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_members_chatId_userId_key" ON "chat_members"("chatId", "userId");

-- CreateIndex
CREATE INDEX "messages_chatId_createdAt_idx" ON "messages"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- AddForeignKey
ALTER TABLE "repository_branches" ADD CONSTRAINT "repository_branches_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base_snapshots" ADD CONSTRAINT "base_snapshots_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base_snapshots" ADD CONSTRAINT "base_snapshots_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "repository_branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_snapshots" ADD CONSTRAINT "session_snapshots_baseSnapshotId_fkey" FOREIGN KEY ("baseSnapshotId") REFERENCES "base_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_snapshots" ADD CONSTRAINT "session_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
