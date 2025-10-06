/*
  Warnings:

  - A unique constraint covering the columns `[chatMessageId,userId]` on the table `message_visibility` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "message_visibility" DROP CONSTRAINT "message_visibility_messageId_fkey";

-- AlterTable
ALTER TABLE "message_visibility" ADD COLUMN     "chatMessageId" TEXT,
ALTER COLUMN "messageId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "message_visibility_chatMessageId_idx" ON "message_visibility"("chatMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "message_visibility_chatMessageId_userId_key" ON "message_visibility"("chatMessageId", "userId");

-- AddForeignKey
ALTER TABLE "message_visibility" ADD CONSTRAINT "message_visibility_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_visibility" ADD CONSTRAINT "message_visibility_chatMessageId_fkey" FOREIGN KEY ("chatMessageId") REFERENCES "chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
