/*
  Warnings:

  - You are about to drop the `snapshots` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "artifact_status" AS ENUM ('QUEUED', 'PROCESSING', 'READY', 'FAILED');

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_snapshotId_fkey";

-- DropForeignKey
ALTER TABLE "search_history" DROP CONSTRAINT "search_history_snapshotId_fkey";

-- DropForeignKey
ALTER TABLE "snapshots" DROP CONSTRAINT "snapshots_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "snapshots" DROP CONSTRAINT "snapshots_repoId_fkey";

-- DropForeignKey
ALTER TABLE "timeline_events" DROP CONSTRAINT "timeline_events_snapshotId_fkey";

-- AlterTable
ALTER TABLE "base_snapshots" ADD COLUMN     "access_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "repositories" ADD COLUMN     "trendingScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "repository_branches" ADD COLUMN     "current_artifact_id" TEXT;

-- DropTable
DROP TABLE "snapshots";

-- DropEnum
DROP TYPE "snapshot_status";

-- CreateTable
CREATE TABLE "snapshot_artifacts" (
    "id" TEXT NOT NULL,
    "repo_id" TEXT NOT NULL,
    "commit_sha" TEXT NOT NULL,
    "status" "artifact_status" NOT NULL DEFAULT 'QUEUED',
    "worktree_path" TEXT,
    "bundle_path" TEXT,
    "processed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "snapshot_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repository_views_agg" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "uniqueUsers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repository_views_agg_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "snapshot_artifacts_repo_id_idx" ON "snapshot_artifacts"("repo_id");

-- CreateIndex
CREATE INDEX "snapshot_artifacts_commit_sha_idx" ON "snapshot_artifacts"("commit_sha");

-- CreateIndex
CREATE INDEX "snapshot_artifacts_status_idx" ON "snapshot_artifacts"("status");

-- CreateIndex
CREATE INDEX "snapshot_artifacts_created_at_idx" ON "snapshot_artifacts"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "snapshot_artifacts_repo_id_commit_sha_key" ON "snapshot_artifacts"("repo_id", "commit_sha");

-- CreateIndex
CREATE INDEX "repository_views_agg_repoId_idx" ON "repository_views_agg"("repoId");

-- CreateIndex
CREATE INDEX "repository_views_agg_date_idx" ON "repository_views_agg"("date");

-- CreateIndex
CREATE INDEX "repository_views_agg_viewCount_idx" ON "repository_views_agg"("viewCount");

-- CreateIndex
CREATE UNIQUE INDEX "repository_views_agg_repoId_date_key" ON "repository_views_agg"("repoId", "date");

-- CreateIndex
CREATE INDEX "base_snapshots_last_accessed_at_idx" ON "base_snapshots"("last_accessed_at");

-- CreateIndex
CREATE INDEX "base_snapshots_commitSha_idx" ON "base_snapshots"("commitSha");

-- CreateIndex
CREATE INDEX "repository_branches_current_artifact_id_idx" ON "repository_branches"("current_artifact_id");

-- AddForeignKey
ALTER TABLE "repository_branches" ADD CONSTRAINT "repository_branches_current_artifact_id_fkey" FOREIGN KEY ("current_artifact_id") REFERENCES "snapshot_artifacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshot_artifacts" ADD CONSTRAINT "snapshot_artifacts_repo_id_fkey" FOREIGN KEY ("repo_id") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "base_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "base_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "base_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repository_views_agg" ADD CONSTRAINT "repository_views_agg_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
