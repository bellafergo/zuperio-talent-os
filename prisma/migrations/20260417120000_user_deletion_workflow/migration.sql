-- Two-director administrative removal workflow (soft delete; row kept for audit).
ALTER TABLE "User" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "deletionRequestedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "deletionRequestedById" TEXT;
ALTER TABLE "User" ADD COLUMN "deletionApprovedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "deletionApprovedById" TEXT;

CREATE INDEX "User_isDeleted_idx" ON "User"("isDeleted");

ALTER TABLE "User" ADD CONSTRAINT "User_deletionRequestedById_fkey" FOREIGN KEY ("deletionRequestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_deletionApprovedById_fkey" FOREIGN KEY ("deletionApprovedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
