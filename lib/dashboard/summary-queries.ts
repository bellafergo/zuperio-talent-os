import { prisma } from "@/lib/prisma";

/** Opportunity stages that are still in progress (not closed). */
const ACTIVE_OPPORTUNITY_STAGES = [
  "PROSPECTING",
  "QUALIFICATION",
  "PROPOSAL",
  "NEGOTIATION",
] as const;

/** Vacancy statuses that can still receive candidates. */
const ACTIVE_VACANCY_STATUSES = [
  "OPEN",
  "SOURCING",
  "INTERVIEWING",
  "ON_HOLD",
] as const;

/** WeeklyLog statuses that require action (not yet approved). */
const PENDING_LOG_STATUSES = ["DRAFT", "SUBMITTED"] as const;

export type HomeSummaryMetrics = {
  activeOpportunities: number;
  openVacancies: number;
  activePlacements: number;
  pendingLogs: number;
};

export async function getHomeSummaryMetrics(): Promise<HomeSummaryMetrics> {
  const [activeOpportunities, openVacancies, activePlacements, pendingLogs] =
    await Promise.all([
      prisma.opportunity.count({
        where: { stage: { in: [...ACTIVE_OPPORTUNITY_STAGES] } },
      }),
      prisma.vacancy.count({
        where: { status: { in: [...ACTIVE_VACANCY_STATUSES] } },
      }),
      prisma.placement.count({
        where: { status: "ACTIVE" },
      }),
      prisma.weeklyLog.count({
        where: { status: { in: [...PENDING_LOG_STATUSES] } },
      }),
    ]);

  return { activeOpportunities, openVacancies, activePlacements, pendingLogs };
}
