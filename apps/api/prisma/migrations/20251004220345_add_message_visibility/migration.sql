-- CreateTable
CREATE TABLE "message_visibility" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "hiddenAt" TIMESTAMP(3),

    CONSTRAINT "message_visibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_visibility_userId_isVisible_idx" ON "message_visibility"("userId", "isVisible");

-- CreateIndex
CREATE INDEX "message_visibility_messageId_idx" ON "message_visibility"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "message_visibility_messageId_userId_key" ON "message_visibility"("messageId", "userId");

-- AddForeignKey
ALTER TABLE "message_visibility" ADD CONSTRAINT "message_visibility_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_visibility" ADD CONSTRAINT "message_visibility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
