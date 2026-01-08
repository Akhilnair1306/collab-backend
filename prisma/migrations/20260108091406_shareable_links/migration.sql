/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `Note` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shareToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Note_shareToken_key" ON "Note"("shareToken");
