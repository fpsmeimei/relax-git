-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "repoId" TEXT,
ALTER COLUMN "commentId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "notifications_repoId_idx" ON "notifications"("repoId");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
