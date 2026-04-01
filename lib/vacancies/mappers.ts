import type {
  VacancySeniority as PrismaVacancySeniority,
  VacancyStatus as PrismaVacancyStatus,
} from "@/generated/prisma/enums";

import type {
  VacancyListRow,
  VacancySeniorityUi,
  VacancyStatusUi,
} from "./types";

const prismaStatusToUi: Record<PrismaVacancyStatus, VacancyStatusUi> = {
  DRAFT: "Draft",
  OPEN: "Open",
  ON_HOLD: "On hold",
  SOURCING: "Sourcing",
  INTERVIEWING: "Interviewing",
  FILLED: "Filled",
  CANCELLED: "Cancelled",
};

const prismaSeniorityToUi: Record<PrismaVacancySeniority, VacancySeniorityUi> =
  {
    INTERN: "Intern",
    JUNIOR: "Junior",
    MID: "Mid",
    SENIOR: "Senior",
    LEAD: "Lead",
    PRINCIPAL: "Principal",
  };

function parseDecimal(
  value: { toNumber?: () => number } | number | string | null | undefined,
): number | null {
  if (value == null) return null;
  if (
    typeof value === "object" &&
    "toNumber" in value &&
    typeof value.toNumber === "function"
  ) {
    const n = value.toNumber();
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function formatTargetRate(amount: number | null, currency: string) {
  if (amount == null || Number.isNaN(amount)) return "—";
  try {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
    return `${formatted} / hr`;
  } catch {
    return `${amount.toLocaleString("en-US")} ${currency} / hr`;
  }
}

function formatUpdatedAt(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export type VacancyWithRelations = {
  id: string;
  title: string;
  seniority: PrismaVacancySeniority;
  status: PrismaVacancyStatus;
  targetRate: { toNumber?: () => number } | number | string | null;
  currency: string | null;
  updatedAt: Date;
  opportunity: {
    id: string;
    title: string;
    company: { id: string; name: string };
  };
};

export function mapVacancyToListRow(row: VacancyWithRelations): VacancyListRow {
  const currency = row.currency?.trim() || "EUR";
  const amount = parseDecimal(row.targetRate);
  return {
    id: row.id,
    title: row.title,
    companyId: row.opportunity.company.id,
    companyName: row.opportunity.company.name,
    opportunityId: row.opportunity.id,
    opportunityTitle: row.opportunity.title,
    seniority: prismaSeniorityToUi[row.seniority],
    status: prismaStatusToUi[row.status],
    targetRateLabel: formatTargetRate(amount, currency),
    targetRateAmount: amount,
    currency,
    updatedAtLabel: formatUpdatedAt(row.updatedAt),
  };
}
