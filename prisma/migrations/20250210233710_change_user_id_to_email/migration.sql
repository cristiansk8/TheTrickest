-- DropForeignKey
ALTER TABLE "SocialMedia" DROP CONSTRAINT "SocialMedia_userId_fkey";

-- AlterTable
ALTER TABLE "SocialMedia" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "SocialMedia" ADD CONSTRAINT "SocialMedia_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
