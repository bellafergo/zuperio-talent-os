-- Persist monthly bonuses total (mirrors totalBenefits; same as input when single line item).
ALTER TABLE "ProposalPricing" ADD COLUMN "totalBonuses" DECIMAL(14,2);
