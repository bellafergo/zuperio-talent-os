-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SALES', 'RECRUITER', 'DIRECTOR');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'RECRUITER',
ADD COLUMN "passwordHash" TEXT;
