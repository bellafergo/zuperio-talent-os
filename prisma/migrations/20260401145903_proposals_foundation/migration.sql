-- CreateEnum
CREATE TYPE "ProposalType" AS ENUM ('STAFF_AUG');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "vacancyId" TEXT,
    "candidateId" TEXT,
    "type" "ProposalType" NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "validityDays" INTEGER NOT NULL DEFAULT 14,
    "executiveSummary" TEXT,
    "profileSummary" TEXT,
    "scopeNotes" TEXT,
    "commercialNotes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalPricing" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "monthlyHours" INTEGER NOT NULL,
    "candidateNetSalary" DECIMAL(14,2),
    "employerCost" DECIMAL(14,2),
    "internalCost" DECIMAL(14,2),
    "clientRate" DECIMAL(14,2) NOT NULL,
    "clientMonthlyAmount" DECIMAL(14,2) NOT NULL,
    "grossMarginAmount" DECIMAL(14,2) NOT NULL,
    "grossMarginPercent" DECIMAL(6,2) NOT NULL,
    "estimatedDurationMonths" INTEGER NOT NULL DEFAULT 6,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalPricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Proposal_companyId_idx" ON "Proposal"("companyId");

-- CreateIndex
CREATE INDEX "Proposal_opportunityId_idx" ON "Proposal"("opportunityId");

-- CreateIndex
CREATE INDEX "Proposal_vacancyId_idx" ON "Proposal"("vacancyId");

-- CreateIndex
CREATE INDEX "Proposal_candidateId_idx" ON "Proposal"("candidateId");

-- CreateIndex
CREATE INDEX "Proposal_status_idx" ON "Proposal"("status");

-- CreateIndex
CREATE INDEX "Proposal_type_idx" ON "Proposal"("type");

-- CreateIndex
CREATE INDEX "Proposal_createdById_idx" ON "Proposal"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "ProposalPricing_proposalId_key" ON "ProposalPricing"("proposalId");

-- CreateIndex
CREATE INDEX "ProposalPricing_proposalId_idx" ON "ProposalPricing"("proposalId");

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalPricing" ADD CONSTRAINT "ProposalPricing_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
