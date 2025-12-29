-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "autoApprovedAt" TIMESTAMP(3),
ADD COLUMN     "communityApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "downvotes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "upvotes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "voteCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Vote" (
    "id" SERIAL NOT NULL,
    "submissionId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vote_submissionId_idx" ON "Vote"("submissionId");

-- CreateIndex
CREATE INDEX "Vote_userId_idx" ON "Vote"("userId");

-- CreateIndex
CREATE INDEX "Vote_voteType_idx" ON "Vote"("voteType");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_submissionId_userId_key" ON "Vote"("submissionId", "userId");

-- CreateIndex
CREATE INDEX "Submission_communityApproved_idx" ON "Submission"("communityApproved");

-- CreateIndex
CREATE INDEX "Submission_voteCount_idx" ON "Submission"("voteCount");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
