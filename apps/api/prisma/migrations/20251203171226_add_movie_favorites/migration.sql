-- CreateTable
CREATE TABLE "movie_favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "englishName" TEXT,
    "year" TEXT,
    "rating" TEXT,
    "director" TEXT,
    "posterUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movie_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "movie_favorites_userId_createdAt_idx" ON "movie_favorites"("userId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "movie_favorites_userId_title_key" ON "movie_favorites"("userId", "title");

-- AddForeignKey
ALTER TABLE "movie_favorites" ADD CONSTRAINT "movie_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
