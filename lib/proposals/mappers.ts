import type {
  ProposalStatus as PrismaProposalStatus,
  ProposalType as PrismaProposalType,
} from "@/generated/prisma/enums";

import type { ProposalDetailUi, ProposalListRowUi, ProposalStatusUi, ProposalTypeUi } from "./types";

const prismaStatusToUi: Record<PrismaProposalStatus, ProposalStatusUi> = {
  DRAFT: "Draft",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

const prismaTypeToUi: Record<PrismaProposalType, ProposalTypeUi> = {
  STAFF_AUG: "Staff augmentation",
};

function parseDecimal(value: any): number | null {
  if (value == null) return null;
  if (typeof value === "object" && value !== null && typeof value.toNumber === "function") {
    const n = value.toNumber();
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatMoney(amount: number | null, currency: string): string {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("en-US")} ${currency}`;
  }
}

function formatPercent(pct: number | null): string {
  if (pct == null) return "—";
  return `${pct.toFixed(1)}%`;
}

function formatUpdatedAt(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export type ProposalWithRelations = {
  id: string;
  companyId: string;
  company: { id: string; name: string };
  opportunityId: string | null;
  opportunity: { id: string; title: string } | null;
  vacancyId: string | null;
  vacancy: { id: string; title: string } | null;
  candidateId: string | null;
  candidate: { id: string; firstName: string; lastName: string } | null;
  type: PrismaProposalType;
  status: PrismaProposalStatus;
  currency: string;
  validityDays: number;
  executiveSummary: string | null;
  profileSummary: string | null;
  scopeNotes: string | null;
  commercialNotes: string | null;
  pricing: {
    monthlyHours: number;
    candidateNetSalary: any;
    employerCost: any;
    internalCost: any;
    clientRate: any;
    clientMonthlyAmount: any;
    grossMarginAmount: any;
    grossMarginPercent: any;
    estimatedDurationMonths: number;
  } | null;
  updatedAt: Date;
};

function candidateName(row: ProposalWithRelations): string {
  if (!row.candidate) return "—";
  return `${row.candidate.firstName} ${row.candidate.lastName}`.trim();
}

export function mapProposalToListRowUi(row: ProposalWithRelations): ProposalListRowUi {
  const currency = row.currency?.trim() || "EUR";
  const clientMonthly = parseDecimal(row.pricing?.clientMonthlyAmount) ?? null;
  const marginPct = parseDecimal(row.pricing?.grossMarginPercent) ?? null;

  return {
    id: row.id,
    companyId: row.companyId,
    companyName: row.company.name,
    opportunityId: row.opportunityId,
    opportunityTitle: row.opportunity?.title?.trim() || "—",
    vacancyId: row.vacancyId,
    vacancyTitle: row.vacancy?.title?.trim() || "—",
    candidateId: row.candidateId,
    candidateName: candidateName(row),
    status: prismaStatusToUi[row.status],
    statusValue: row.status,
    type: prismaTypeToUi[row.type],
    typeValue: row.type,
    currency,
    validityDays: row.validityDays,
    clientMonthlyAmountLabel: formatMoney(clientMonthly, currency),
    grossMarginPercentLabel: formatPercent(marginPct),
    grossMarginPercentAmount: marginPct,
    updatedAtLabel: formatUpdatedAt(row.updatedAt),
  };
}

export function mapProposalToDetailUi(row: ProposalWithRelations): ProposalDetailUi {
  const list = mapProposalToListRowUi(row);
  const p = row.pricing;
  return {
    ...list,
    executiveSummary: row.executiveSummary?.trim() || null,
    profileSummary: row.profileSummary?.trim() || null,
    scopeNotes: row.scopeNotes?.trim() || null,
    commercialNotes: row.commercialNotes?.trim() || null,
    pricing: p
      ? {
          monthlyHours: p.monthlyHours,
          candidateNetSalary: parseDecimal(p.candidateNetSalary),
          employerCost: parseDecimal(p.employerCost),
          internalCost: parseDecimal(p.internalCost),
          clientRate: parseDecimal(p.clientRate) ?? 0,
          clientMonthlyAmount: parseDecimal(p.clientMonthlyAmount) ?? 0,
          grossMarginAmount: parseDecimal(p.grossMarginAmount) ?? 0,
          grossMarginPercent: parseDecimal(p.grossMarginPercent) ?? 0,
          estimatedDurationMonths: p.estimatedDurationMonths,
        }
      : null,
  };
}

