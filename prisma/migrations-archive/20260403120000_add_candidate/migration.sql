-- CreateEnum
CREATE TYPE "CandidateAvailabilityStatus" AS ENUM ('AVAILABLE', 'IN_PROCESS', 'ASSIGNED', 'NOT_AVAILABLE');

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "seniority" "VacancySeniority" NOT NULL,
    "skills" TEXT NOT NULL,
    "availabilityStatus" "CandidateAvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "currentCompany" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Candidate_seniority_idx" ON "Candidate"("seniority");

-- CreateIndex
CREATE INDEX "Candidate_availabilityStatus_idx" ON "Candidate"("availabilityStatus");

-- CreateIndex
CREATE INDEX "Candidate_email_idx" ON "Candidate"("email");
