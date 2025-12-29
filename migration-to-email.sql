-- Migration: Revert from username to email as primary identifier
-- This migration updates all foreign key relationships to use email instead of username

-- IMPORTANT: Run this BEFORE deploying the code changes to production

BEGIN;

-- Step 1: Update existing submissions to use email instead of username
-- First, we need to update the userId field in submissions
UPDATE "Submission" s
SET "userId" = u.email
FROM "User" u
WHERE s."userId" = u.username;

-- Step 2: Update evaluatedBy field in submissions
UPDATE "Submission" s
SET "evaluatedBy" = u.email
FROM "User" u
WHERE s."evaluatedBy" = u.username
AND s."evaluatedBy" IS NOT NULL;

-- Step 3: Update votes to use email
UPDATE "Vote" v
SET "userId" = u.email
FROM "User" u
WHERE v."userId" = u.username;

-- Step 4: Update follows to use email
UPDATE "Follow" f
SET "followerId" = u.email
FROM "User" u
WHERE f."followerId" = u.username;

UPDATE "Follow" f
SET "followingId" = u.email
FROM "User" u
WHERE f."followingId" = u.username;

-- Step 5: Drop and recreate foreign key constraints
-- Submissions -> User
ALTER TABLE "Submission" DROP CONSTRAINT IF EXISTS "Submission_userId_fkey";
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"(email) ON DELETE CASCADE;

ALTER TABLE "Submission" DROP CONSTRAINT IF EXISTS "Submission_evaluatedBy_fkey";
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_evaluatedBy_fkey"
  FOREIGN KEY ("evaluatedBy") REFERENCES "User"(email) ON DELETE SET NULL;

-- Votes -> User
ALTER TABLE "Vote" DROP CONSTRAINT IF EXISTS "Vote_userId_fkey";
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"(email) ON DELETE CASCADE;

-- Follows -> User
ALTER TABLE "Follow" DROP CONSTRAINT IF EXISTS "Follow_followerId_fkey";
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey"
  FOREIGN KEY ("followerId") REFERENCES "User"(email) ON DELETE CASCADE;

ALTER TABLE "Follow" DROP CONSTRAINT IF EXISTS "Follow_followingId_fkey";
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey"
  FOREIGN KEY ("followingId") REFERENCES "User"(email) ON DELETE CASCADE;

COMMIT;

-- Verification queries (run these after migration to verify)
-- SELECT COUNT(*) FROM "Submission" WHERE "userId" NOT LIKE '%@%';
-- SELECT COUNT(*) FROM "Vote" WHERE "userId" NOT LIKE '%@%';
-- SELECT COUNT(*) FROM "Follow" WHERE "followerId" NOT LIKE '%@%' OR "followingId" NOT LIKE '%@%';
