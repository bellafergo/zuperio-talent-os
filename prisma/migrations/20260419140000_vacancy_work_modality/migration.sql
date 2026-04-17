-- Add optional workModality field to Vacancy (same pattern as Candidate.workModality)
ALTER TABLE "Vacancy" ADD COLUMN "workModality" TEXT;
