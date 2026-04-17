-- ProposalStatus: replace enum (map ACCEPTED→WON, REJECTED→LOST) and add commercial tracking columns.

CREATE TYPE "ProposalStatus_new" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'IN_NEGOTIATION', 'WON', 'LOST');

ALTER TABLE "Proposal" ADD COLUMN "sentAt" TIMESTAMP(3),
ADD COLUMN "lastFollowUpAt" TIMESTAMP(3),
ADD COLUMN "followUpCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Proposal" ADD COLUMN "status_new" "ProposalStatus_new";

UPDATE "Proposal" SET "status_new" = CASE "status"::text
  WHEN 'DRAFT' THEN 'DRAFT'::"ProposalStatus_new"
  WHEN 'SENT' THEN 'SENT'::"ProposalStatus_new"
  WHEN 'ACCEPTED' THEN 'WON'::"ProposalStatus_new"
  WHEN 'REJECTED' THEN 'LOST'::"ProposalStatus_new"
  ELSE 'DRAFT'::"ProposalStatus_new"
END;

ALTER TABLE "Proposal" DROP COLUMN "status";

ALTER TABLE "Proposal" RENAME COLUMN "status_new" TO "status";

ALTER TABLE "Proposal" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "Proposal" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"ProposalStatus_new";

DROP TYPE "ProposalStatus";

ALTER TYPE "ProposalStatus_new" RENAME TO "ProposalStatus";

ALTER TABLE "Proposal" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"ProposalStatus";
