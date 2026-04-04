-- Make opportunityId optional on Vacancy and add direct companyId FK

-- 1. Add companyId as nullable first (will backfill before setting NOT NULL)
ALTER TABLE "Vacancy" ADD COLUMN "companyId" TEXT;

-- 2. Backfill companyId from the linked opportunity
UPDATE "Vacancy" v
SET "companyId" = o."companyId"
FROM "Opportunity" o
WHERE v."opportunityId" = o."id";

-- 3. Set NOT NULL (all existing rows now have a companyId via backfill)
ALTER TABLE "Vacancy" ALTER COLUMN "companyId" SET NOT NULL;

-- 4. Add FK from Vacancy.companyId → Company.id (CASCADE delete)
ALTER TABLE "Vacancy" ADD CONSTRAINT "Vacancy_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Index on companyId
CREATE INDEX "Vacancy_companyId_idx" ON "Vacancy"("companyId");

-- 6. Make opportunityId nullable
ALTER TABLE "Vacancy" ALTER COLUMN "opportunityId" DROP NOT NULL;

-- 7. Drop the existing CASCADE FK on opportunityId and recreate as SET NULL
ALTER TABLE "Vacancy" DROP CONSTRAINT "Vacancy_opportunityId_fkey";
ALTER TABLE "Vacancy" ADD CONSTRAINT "Vacancy_opportunityId_fkey"
  FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
