-- CreateEnum
CREATE TYPE "VacancyApplicationStage" AS ENUM ('NEW', 'PRE_SCREEN', 'INTERNAL_INTERVIEW', 'CLIENT_INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "VacancyApplicationStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateTable
CREATE TABLE "VacancyApplication" (
    "id" TEXT NOT NULL,
    "vacancyId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "stage" "VacancyApplicationStage" NOT NULL,
    "status" "VacancyApplicationStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VacancyApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VacancyApplication_vacancyId_idx" ON "VacancyApplication"("vacancyId");

-- CreateIndex
CREATE INDEX "VacancyApplication_candidateId_idx" ON "VacancyApplication"("candidateId");

-- CreateIndex
CREATE INDEX "VacancyApplication_stage_idx" ON "VacancyApplication"("stage");

-- CreateIndex
CREATE INDEX "VacancyApplication_status_idx" ON "VacancyApplication"("status");

-- At most one ACTIVE application per (vacancy, candidate); CLOSED history can repeat after re-open flows.
CREATE UNIQUE INDEX "VacancyApplication_one_active_per_vacancy_candidate_idx" ON "VacancyApplication"("vacancyId", "candidateId") WHERE "status" = 'ACTIVE';

-- AddForeignKey
ALTER TABLE "VacancyApplication" ADD CONSTRAINT "VacancyApplication_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VacancyApplication" ADD CONSTRAINT "VacancyApplication_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
