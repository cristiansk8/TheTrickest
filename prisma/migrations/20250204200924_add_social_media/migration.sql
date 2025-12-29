/*
  Warnings:

  - You are about to drop the column `handle` on the `SocialMedia` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `SocialMedia` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `SocialMedia` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "SocialMedia" DROP CONSTRAINT "SocialMedia_userId_fkey";

-- DropIndex
DROP INDEX "SocialMedia_userId_platform_key";

-- AlterTable
ALTER TABLE "SocialMedia" DROP COLUMN "handle",
DROP COLUMN "platform",
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "tiktok" TEXT,
ADD COLUMN     "twitter" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SocialMedia_userId_key" ON "SocialMedia"("userId");

-- AddForeignKey
ALTER TABLE "SocialMedia" ADD CONSTRAINT "SocialMedia_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
