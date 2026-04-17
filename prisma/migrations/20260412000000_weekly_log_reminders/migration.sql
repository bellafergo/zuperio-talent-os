-- AlterTable
ALTER TABLE "WeeklyLog" ADD COLUMN     "reminderCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reminderLastSentAt" TIMESTAMP(3);
