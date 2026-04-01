-- Structured matching v1: single explanation field replaces boolean + notes columns.
ALTER TABLE "CandidateVacancyMatch" DROP COLUMN IF EXISTS "seniorityMatch";
ALTER TABLE "CandidateVacancyMatch" DROP COLUMN IF EXISTS "availabilityMatch";
ALTER TABLE "CandidateVacancyMatch" DROP COLUMN IF EXISTS "skillsMatchNotes";

ALTER TABLE "CandidateVacancyMatch" ADD COLUMN "explanation" TEXT NOT NULL DEFAULT '';

ALTER TABLE "CandidateVacancyMatch" ALTER COLUMN "explanation" DROP DEFAULT;
