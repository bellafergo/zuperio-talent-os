import type { WeeklyLogStatus as PrismaWeeklyLogStatus } from "@/generated/prisma/enums";

import type { WeeklyLogListRowUi, WeeklyLogStatusUi } from "./types";

const prismaStatusToUi: Record<PrismaWeeklyLogStatus, WeeklyLogStatusUi> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  RETURNED: "Returned",
};

function formatDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatWeekLabel(start: Date, end: Date): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${fmt.format(start)} → ${fmt.format(end)}`;
}

function parseDecimal(
  value: { toNumber?: () => number } | number | string | null | undefined,
): number | null {
  if (value == null) return null;
  if (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof (value as { toNumber: () => number }).toNumber === "function"
  ) {
    const n = (value as { toNumber: () => number }).toNumber();
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export type WeeklyLogWithPlacement = {
  id: string;
  placementId: string;
  weekStart: Date;
  weekEnd: Date;
  status: PrismaWeeklyLogStatus;
  hoursTotal: { toNumber?: () => number } | number | string | null;
  reminderLastSentAt: Date | null;
  reminderCount: number;
  summary: string | null;
  achievements: string | null;
  blockers: string | null;
  placement: {
    candidate: { firstName: string; lastName: string };
    company: { name: string };
    vacancy: { title: string };
  };
};

function candidateName(c: WeeklyLogWithPlacement["placement"]["candidate"]): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

function formatReminderSentAt(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function overdueMeta(row: Pick<WeeklyLogWithPlacement, "weekEnd" | "status">): {
  isOverdue: boolean;
  overdueReason: string | null;
} {
  // Simple rule:
  // - Overdue only for DRAFT or RETURNED
  // - Deadline = weekEnd + 2 days (grace)
  const graceDays = 2;
  if (row.status !== "DRAFT" && row.status !== "RETURNED") {
    return { isOverdue: false, overdueReason: null };
  }
  const deadline = new Date(row.weekEnd);
  deadline.setUTCDate(deadline.getUTCDate() + graceDays);
  const now = new Date();
  if (now.getTime() <= deadline.getTime()) {
    return { isOverdue: false, overdueReason: null };
  }
  return {
    isOverdue: true,
    overdueReason: `Past deadline (week end + ${graceDays}d).`,
  };
}

export function mapWeeklyLogToListRowUi(
  row: WeeklyLogWithPlacement,
): WeeklyLogListRowUi {
  const overdue = overdueMeta(row);
  return {
    id: row.id,
    placementId: row.placementId,
    candidateName: candidateName(row.placement.candidate),
    companyName: row.placement.company.name,
    vacancyTitle: row.placement.vacancy.title,
    weekLabel: formatWeekLabel(row.weekStart, row.weekEnd),
    weekStartValue: formatDateInput(row.weekStart),
    weekEndValue: formatDateInput(row.weekEnd),
    status: prismaStatusToUi[row.status],
    statusValue: row.status,
    hoursTotalAmount: parseDecimal(row.hoursTotal),
    summary: row.summary?.trim() || null,
    achievements: row.achievements?.trim() || null,
    blockers: row.blockers?.trim() || null,
    isOverdue: overdue.isOverdue,
    overdueReason: overdue.overdueReason,
    reminderLastSentAtLabel: row.reminderLastSentAt
      ? formatReminderSentAt(row.reminderLastSentAt)
      : null,
    reminderCount: row.reminderCount ?? 0,
  };
}

