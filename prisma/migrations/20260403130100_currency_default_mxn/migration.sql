-- Align DB defaults with product rule: MXN default (new rows); USD allowed per row.
ALTER TABLE "Opportunity" ALTER COLUMN "currency" SET DEFAULT 'MXN';
ALTER TABLE "Vacancy" ALTER COLUMN "currency" SET DEFAULT 'MXN';
ALTER TABLE "Proposal" ALTER COLUMN "currency" SET DEFAULT 'MXN';
