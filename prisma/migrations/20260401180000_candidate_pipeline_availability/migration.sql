-- CreateEnum
CREATE TYPE "CandidatePipelineIntent" AS ENUM ('OPEN_VACANCY', 'NO_VACANCY', 'TALENT_POOL');

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "availabilityStartDate" TIMESTAMP(3),
ADD COLUMN     "pipelineIntent" "CandidatePipelineIntent" NOT NULL DEFAULT 'NO_VACANCY',
ADD COLUMN     "pipelineVacancyId" TEXT;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_pipelineVacancyId_fkey" FOREIGN KEY ("pipelineVacancyId") REFERENCES "Vacancy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Candidate_pipelineVacancyId_idx" ON "Candidate"("pipelineVacancyId");
