-- AlterTable: add CV file upload fields to Candidate
ALTER TABLE "Candidate" ADD COLUMN "cvFileKey" TEXT,
ADD COLUMN "cvFileName" TEXT,
ADD COLUMN "cvUploadedAt" TIMESTAMP(3);
