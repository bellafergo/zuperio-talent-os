-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN "commercialClosedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Proposal_commercialClosedAt_idx" ON "Proposal"("commercialClosedAt");
