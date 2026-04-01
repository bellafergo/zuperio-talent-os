-- CreateEnum
CREATE TYPE "MatchRecommendation" AS ENUM ('STRONG_MATCH', 'PARTIAL_MATCH', 'LOW_MATCH');

-- AlterTable
ALTER TABLE "Vacancy" ADD COLUMN "skills" TEXT,
ADD COLUMN "roleSummary" TEXT;

-- CreateTable
CREATE TABLE "CandidateVacancyMatch" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "vacancyId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "seniorityMatch" BOOLEAN NOT NULL,
    "availabilityMatch" BOOLEAN NOT NULL,
    "skillsMatchNotes" TEXT,
    "recommendation" "MatchRecommendation" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateVacancyMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateVacancyMatch_candidateId_vacancyId_key" ON "CandidateVacancyMatch"("candidateId", "vacancyId");

-- CreateIndex
CREATE INDEX "CandidateVacancyMatch_vacancyId_idx" ON "CandidateVacancyMatch"("vacancyId");

-- CreateIndex
CREATE INDEX "CandidateVacancyMatch_candidateId_idx" ON "CandidateVacancyMatch"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateVacancyMatch_score_idx" ON "CandidateVacancyMatch"("score");

-- AddForeignKey
ALTER TABLE "CandidateVacancyMatch" ADD CONSTRAINT "CandidateVacancyMatch_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateVacancyMatch" ADD CONSTRAINT "CandidateVacancyMatch_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
