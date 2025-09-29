-- AlterTable
ALTER TABLE "repositories" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "stars" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "repository_likes" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repository_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repository_collections" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repository_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repository_views" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repository_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "repository_likes_repoId_idx" ON "repository_likes"("repoId");

-- CreateIndex
CREATE INDEX "repository_likes_userId_idx" ON "repository_likes"("userId");

-- CreateIndex
CREATE INDEX "repository_likes_createdAt_idx" ON "repository_likes"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "repository_likes_repoId_userId_key" ON "repository_likes"("repoId", "userId");

-- CreateIndex
CREATE INDEX "repository_collections_repoId_idx" ON "repository_collections"("repoId");

-- CreateIndex
CREATE INDEX "repository_collections_userId_idx" ON "repository_collections"("userId");

-- CreateIndex
CREATE INDEX "repository_collections_createdAt_idx" ON "repository_collections"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "repository_collections_repoId_userId_key" ON "repository_collections"("repoId", "userId");

-- CreateIndex
CREATE INDEX "repository_views_repoId_idx" ON "repository_views"("repoId");

-- CreateIndex
CREATE INDEX "repository_views_userId_idx" ON "repository_views"("userId");

-- CreateIndex
CREATE INDEX "repository_views_viewedAt_idx" ON "repository_views"("viewedAt");

-- CreateIndex
CREATE INDEX "repository_views_ipAddress_idx" ON "repository_views"("ipAddress");

-- AddForeignKey
ALTER TABLE "repository_likes" ADD CONSTRAINT "repository_likes_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repository_likes" ADD CONSTRAINT "repository_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repository_collections" ADD CONSTRAINT "repository_collections_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repository_collections" ADD CONSTRAINT "repository_collections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repository_views" ADD CONSTRAINT "repository_views_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repository_views" ADD CONSTRAINT "repository_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
