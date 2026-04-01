-- CreateEnum
CREATE TYPE "VacancySeniority" AS ENUM ('INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'PRINCIPAL');

-- CreateEnum
CREATE TYPE "VacancyStatus" AS ENUM ('DRAFT', 'OPEN', 'ON_HOLD', 'SOURCING', 'INTERVIEWING', 'FILLED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Vacancy" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "seniority" "VacancySeniority" NOT NULL,
    "status" "VacancyStatus" NOT NULL DEFAULT 'OPEN',
    "targetRate" DECIMAL(14,2),
    "currency" TEXT DEFAULT 'EUR',
    "opportunityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vacancy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vacancy_opportunityId_idx" ON "Vacancy"("opportunityId");

-- CreateIndex
CREATE INDEX "Vacancy_status_idx" ON "Vacancy"("status");

-- CreateIndex
CREATE INDEX "Vacancy_seniority_idx" ON "Vacancy"("seniority");

-- AddForeignKey
ALTER TABLE "Vacancy" ADD CONSTRAINT "Vacancy_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
