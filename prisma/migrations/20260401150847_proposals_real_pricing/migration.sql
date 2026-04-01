-- CreateEnum
CREATE TYPE "ProposalFormat" AS ENUM ('SIMPLE', 'DETAILED');

-- CreateEnum
CREATE TYPE "PricingScheme" AS ENUM ('MIXED', 'FULL_IMSS');

-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "format" "ProposalFormat" NOT NULL DEFAULT 'SIMPLE';

-- AlterTable
ALTER TABLE "ProposalPricing" ADD COLUMN     "benefits" DECIMAL(14,2),
ADD COLUMN     "bonuses" DECIMAL(14,2),
ADD COLUMN     "discountPercent" DECIMAL(6,2),
ADD COLUMN     "employerLoadPercent" DECIMAL(6,2),
ADD COLUMN     "finalMonthlyRate" DECIMAL(14,2),
ADD COLUMN     "finalMonthlyRateWithVAT" DECIMAL(14,2),
ADD COLUMN     "grossSalary" DECIMAL(14,2),
ADD COLUMN     "marginPercent" DECIMAL(6,2),
ADD COLUMN     "operatingExpenses" DECIMAL(14,2),
ADD COLUMN     "scheme" "PricingScheme" NOT NULL DEFAULT 'MIXED',
ADD COLUMN     "subtotal" DECIMAL(14,2),
ADD COLUMN     "totalBenefits" DECIMAL(14,2),
ADD COLUMN     "totalEmployerLoad" DECIMAL(14,2),
ADD COLUMN     "totalOperatingExpenses" DECIMAL(14,2),
ALTER COLUMN "clientRate" DROP NOT NULL,
ALTER COLUMN "clientMonthlyAmount" DROP NOT NULL,
ALTER COLUMN "grossMarginAmount" DROP NOT NULL,
ALTER COLUMN "grossMarginPercent" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Proposal_format_idx" ON "Proposal"("format");

-- CreateIndex
CREATE INDEX "ProposalPricing_scheme_idx" ON "ProposalPricing"("scheme");
