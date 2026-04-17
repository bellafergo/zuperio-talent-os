-- Add optional contactId to Vacancy linking to the primary contact for this role
ALTER TABLE "Vacancy" ADD COLUMN "contactId" TEXT;
ALTER TABLE "Vacancy" ADD CONSTRAINT "Vacancy_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Vacancy_contactId_idx" ON "Vacancy"("contactId");
