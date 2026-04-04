import type {
  VacancySeniority as PrismaVacancySeniority,
  VacancyStatus as PrismaVacancyStatus,
} from "@/generated/prisma/enums";

import { DEFAULT_CURRENCY, formatMoney } from "@/lib/currency";

import type {
  VacancyListRow,
  VacancySeniorityUi,
  VacancyStatusUi,
} from "./types";

const prismaStatusToUi: Record<PrismaVacancyStatus, VacancyStatusUi> = {
  DRAFT: "Borrador",
  OPEN: "Abierta",
  ON_HOLD: "En pausa",
  SOURCING: "Sourcing",
  INTERVIEWING: "En entrevistas",
  FILLED: "Cubiertas",
  CANCELLED: "Cancelada",
};

export const prismaSeniorityToUi: Record<
  PrismaVacancySeniority,
  VacancySeniorityUi
> = {
  INTERN: "Interno",
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
  const formatted = formatMoney(amount, currency?.trim() || DEFAULT_CURRENCY, 0);
  return `${formatted} / h`;
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
  skills: string | null;
  roleSummary: string | null;
  workModality: string | null;
  updatedAt: Date;
  companyId: string;
  company: { id: string; name: string };
  opportunity: {
    id: string;
    title: string;
  } | null;
};

export function mapVacancyToListRow(row: VacancyWithRelations): VacancyListRow {
  const currency = row.currency?.trim() || DEFAULT_CURRENCY;
  const amount = parseDecimal(row.targetRate);
  const skillsLine = row.skills?.trim() || null;
  const roleSummaryLine = row.roleSummary?.trim() || null;
  return {
    id: row.id,
    title: row.title,
    companyId: row.company.id,
    companyName: row.company.name,
    opportunityId: row.opportunity?.id ?? null,
    opportunityTitle: row.opportunity?.title ?? null,
    seniority: prismaSeniorityToUi[row.seniority],
    status: prismaStatusToUi[row.status],
    seniorityValue: row.seniority,
    statusValue: row.status,
    targetRateLabel: formatTargetRate(amount, currency),
    targetRateAmount: amount,
    currency,
    skillsLine,
    roleSummaryLine,
    workModality: row.workModality?.trim() || null,
    updatedAtLabel: formatUpdatedAt(row.updatedAt),
  };
}
