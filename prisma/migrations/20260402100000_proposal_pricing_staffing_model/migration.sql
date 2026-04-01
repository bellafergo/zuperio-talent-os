-- Optional IMSS gross factor, VAT %, and pre-discount client rate (transparency).

ALTER TABLE "ProposalPricing" ADD COLUMN "fullImssGrossFactor" DECIMAL(8,4);
ALTER TABLE "ProposalPricing" ADD COLUMN "vatPercent" DECIMAL(6,2);
ALTER TABLE "ProposalPricing" ADD COLUMN "baseMonthlyRateBeforeDiscount" DECIMAL(14,2);
