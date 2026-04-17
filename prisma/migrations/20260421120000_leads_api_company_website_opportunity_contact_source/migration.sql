-- Leads API: company website for dedupe; opportunity contact + source metadata
ALTER TABLE "Company" ADD COLUMN "website" TEXT;

ALTER TABLE "Opportunity" ADD COLUMN "contactId" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN "source" TEXT;

ALTER TABLE "Opportunity"
  ADD CONSTRAINT "Opportunity_contactId_fkey"
  FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Opportunity_contactId_idx" ON "Opportunity"("contactId");
