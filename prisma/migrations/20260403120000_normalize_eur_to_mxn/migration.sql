-- One-time normalization: legacy demo EUR → MXN (supported set: MXN, USD).
UPDATE "Opportunity" SET currency = 'MXN' WHERE currency = 'EUR';
UPDATE "Vacancy" SET currency = 'MXN' WHERE currency = 'EUR';
UPDATE "Proposal" SET currency = 'MXN' WHERE currency = 'EUR';
