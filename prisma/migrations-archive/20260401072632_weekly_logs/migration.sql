-- CreateEnum
CREATE TYPE "WeeklyLogStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'RETURNED');

-- CreateTable
CREATE TABLE "WeeklyLog" (
    "id" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "summary" TEXT,
    "achievements" TEXT,
    "blockers" TEXT,
    "hoursTotal" DECIMAL(6,2),
    "status" "WeeklyLogStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeeklyLog_placementId_idx" ON "WeeklyLog"("placementId");

-- CreateIndex
CREATE INDEX "WeeklyLog_weekStart_idx" ON "WeeklyLog"("weekStart");

-- CreateIndex
CREATE INDEX "WeeklyLog_status_idx" ON "WeeklyLog"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyLog_placementId_weekStart_key" ON "WeeklyLog"("placementId", "weekStart");

-- AddForeignKey
ALTER TABLE "WeeklyLog" ADD CONSTRAINT "WeeklyLog_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "Placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
