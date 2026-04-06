-- CreateEnum (DO/EXCEPTION: idempotent for databases where type was partially created)
DO $$ BEGIN
  CREATE TYPE "JobBoardProvider" AS ENUM ('OCC', 'COMPUTRABAJO', 'LINKEDIN', 'MANUAL', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ExternalVacancyPublicationStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'SYNCING', 'PAUSED', 'FAILED', 'REMOVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ExternalApplicationStatus" AS ENUM ('RECEIVED', 'PENDING_MAPPING', 'VACANCY_MAPPED', 'CANDIDATE_LINKED', 'PROMOTED_TO_PIPELINE', 'FAILED', 'DISCARDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- DropIndex (IF EXISTS: index is created by a later migration; safe no-op on clean databases)
DROP INDEX IF EXISTS "User_isDeleted_idx";

-- CreateTable
CREATE TABLE "ExternalVacancyPublication" (
    "id" TEXT NOT NULL,
    "vacancyId" TEXT NOT NULL,
    "provider" "JobBoardProvider" NOT NULL,
    "externalVacancyRef" TEXT,
    "status" "ExternalVacancyPublicationStatus" NOT NULL DEFAULT 'PENDING',
    "publishedAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "metadata" JSONB,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalVacancyPublication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalApplication" (
    "id" TEXT NOT NULL,
    "provider" "JobBoardProvider" NOT NULL,
    "externalApplicationId" TEXT NOT NULL,
    "externalVacancyRef" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "sourcePayload" JSONB,
    "vacancyId" TEXT,
    "candidateId" TEXT,
    "vacancyApplicationId" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ExternalApplicationStatus" NOT NULL DEFAULT 'RECEIVED',
    "processingNotes" TEXT,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExternalVacancyPublication_vacancyId_idx" ON "ExternalVacancyPublication"("vacancyId");

-- CreateIndex
CREATE INDEX "ExternalVacancyPublication_provider_idx" ON "ExternalVacancyPublication"("provider");

-- CreateIndex
CREATE INDEX "ExternalVacancyPublication_status_idx" ON "ExternalVacancyPublication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalApplication_vacancyApplicationId_key" ON "ExternalApplication"("vacancyApplicationId");

-- CreateIndex
CREATE INDEX "ExternalApplication_vacancyId_idx" ON "ExternalApplication"("vacancyId");

-- CreateIndex
CREATE INDEX "ExternalApplication_candidateId_idx" ON "ExternalApplication"("candidateId");

-- CreateIndex
CREATE INDEX "ExternalApplication_status_idx" ON "ExternalApplication"("status");

-- CreateIndex
CREATE INDEX "ExternalApplication_receivedAt_idx" ON "ExternalApplication"("receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalApplication_provider_externalApplicationId_key" ON "ExternalApplication"("provider", "externalApplicationId");

-- CreateIndex
CREATE INDEX "Proposal_status_idx" ON "Proposal"("status");

-- AddForeignKey
ALTER TABLE "ExternalVacancyPublication" ADD CONSTRAINT "ExternalVacancyPublication_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalApplication" ADD CONSTRAINT "ExternalApplication_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalApplication" ADD CONSTRAINT "ExternalApplication_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalApplication" ADD CONSTRAINT "ExternalApplication_vacancyApplicationId_fkey" FOREIGN KEY ("vacancyApplicationId") REFERENCES "VacancyApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
