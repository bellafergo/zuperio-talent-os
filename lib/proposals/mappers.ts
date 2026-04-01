import type {
  PricingScheme as PrismaPricingScheme,
  ProposalFormat as PrismaProposalFormat,
  ProposalStatus as PrismaProposalStatus,
  ProposalType as PrismaProposalType,
} from "@/generated/prisma/enums";

import type {
  PricingSchemeUi,
  ProposalDetailUi,
  ProposalFormatUi,
  ProposalListRowUi,
  ProposalStatusUi,
  ProposalTypeUi,
} from "./types";

import { DEFAULT_CURRENCY, formatMoney } from "@/lib/currency";

import { computeIsFollowUpPending } from "./follow-up";

const prismaStatusToUi: Record<PrismaProposalStatus, ProposalStatusUi> = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  VIEWED: "Vista",
  IN_NEGOTIATION: "En negociación",
  WON: "Ganada",
  LOST: "Perdida",
};

const prismaTypeToUi: Record<PrismaProposalType, ProposalTypeUi> = {
  STAFF_AUG: "Ampliación de personal",
};

const prismaFormatToUi: Record<PrismaProposalFormat, ProposalFormatUi> = {
  SIMPLE: "Sencilla",
  DETAILED: "Detallada",
};

const prismaSchemeToUi: Record<PrismaPricingScheme, PricingSchemeUi> = {
  MIXED: "Mixto",
  FULL_IMSS: "IMSS completo",
};

/** Prisma `Decimal` or plain number/string from DB/JSON */
type DecimalSource = { toNumber?: () => number } | number | string | null | undefined;

function parseDecimal(value: DecimalSource): number | null {
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

function formatMoneyCompact(amount: number | null, currency: string): string {
  return formatMoney(amount, currency?.trim() || DEFAULT_CURRENCY, 0);
}

function formatPercent(pct: number | null): string {
  if (pct == null) return "—";
  return `${pct.toFixed(1)}%`;
}

function formatUpdatedAt(d: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function formatTrackingTimestamp(d: Date | null): string {
  if (!d) return "—";
  return (
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }).format(d) + " UTC"
  );
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
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    candidateCvExportedAt: Date | null;
  } | null;
  type: PrismaProposalType;
  format: PrismaProposalFormat;
  status: PrismaProposalStatus;
  currency: string;
  validityDays: number;
  executiveSummary: string | null;
  profileSummary: string | null;
  scopeNotes: string | null;
  commercialNotes: string | null;
  proposalPdfExportedAt: Date | null;
  sentAt: Date | null;
  lastFollowUpAt: Date | null;
  followUpCount: number;
  pricing: {
    scheme: PrismaPricingScheme;
    monthlyHours: number;
    candidateNetSalary: DecimalSource;
    marginPercent: DecimalSource;
    employerLoadPercent: DecimalSource;
    bonuses: DecimalSource;
    benefits: DecimalSource;
    operatingExpenses: DecimalSource;
    discountPercent: DecimalSource;
    fullImssGrossFactor: DecimalSource;
    vatPercent: DecimalSource;

    grossSalary: DecimalSource;
    employerCost: DecimalSource;
    totalBonuses: DecimalSource;
    totalBenefits: DecimalSource;
    totalEmployerLoad: DecimalSource;
    totalOperatingExpenses: DecimalSource;
    subtotal: DecimalSource;
    baseMonthlyRateBeforeDiscount: DecimalSource;
    grossMarginAmount: DecimalSource;
    grossMarginPercent: DecimalSource;
    finalMonthlyRate: DecimalSource;
    finalMonthlyRateWithVAT: DecimalSource;
    estimatedDurationMonths: number;
  } | null;
  updatedAt: Date;
};

function candidateName(row: ProposalWithRelations): string {
  if (!row.candidate) return "—";
  return `${row.candidate.firstName} ${row.candidate.lastName}`.trim();
}

export function mapProposalToListRowUi(row: ProposalWithRelations): ProposalListRowUi {
  const currency = row.currency?.trim() || DEFAULT_CURRENCY;
  const finalMonthly = parseDecimal(row.pricing?.finalMonthlyRate) ?? null;
  const finalMonthlyWithVat = parseDecimal(row.pricing?.finalMonthlyRateWithVAT) ?? null;
  const marginPct = parseDecimal(row.pricing?.grossMarginPercent) ?? null;

  const isFollowUpPending = computeIsFollowUpPending(
    row.status,
    row.sentAt,
  );

  return {
    proposalPdfExportedAt: row.proposalPdfExportedAt?.toISOString() ?? null,
    candidateCvExportedAt:
      row.candidate?.candidateCvExportedAt?.toISOString() ?? null,
    sentAt: row.sentAt?.toISOString() ?? null,
    lastFollowUpAt: row.lastFollowUpAt?.toISOString() ?? null,
    followUpCount: row.followUpCount,
    isFollowUpPending,
    sentAtLabel: formatTrackingTimestamp(row.sentAt),
    lastFollowUpAtLabel: formatTrackingTimestamp(row.lastFollowUpAt),
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
    format: prismaFormatToUi[row.format],
    formatValue: row.format,
    currency,
    validityDays: row.validityDays,
    finalMonthlyRateLabel: formatMoneyCompact(finalMonthly, currency),
    finalMonthlyRateWithVATLabel: formatMoneyCompact(finalMonthlyWithVat, currency),
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
          schemeValue: p.scheme,
          scheme: prismaSchemeToUi[p.scheme],
          monthlyHours: p.monthlyHours,
          candidateNetSalary: parseDecimal(p.candidateNetSalary),
          marginPercent: parseDecimal(p.marginPercent),
          employerLoadPercent: parseDecimal(p.employerLoadPercent),
          bonuses: parseDecimal(p.bonuses),
          benefits: parseDecimal(p.benefits),
          operatingExpenses: parseDecimal(p.operatingExpenses),
          discountPercent: parseDecimal(p.discountPercent),
          fullImssGrossFactor: parseDecimal(p.fullImssGrossFactor),
          vatPercent: parseDecimal(p.vatPercent),

          grossSalary: parseDecimal(p.grossSalary),
          employerCost: parseDecimal(p.employerCost),
          totalBonuses: parseDecimal(p.totalBonuses) ?? parseDecimal(p.bonuses),
          totalBenefits: parseDecimal(p.totalBenefits),
          totalEmployerLoad: parseDecimal(p.totalEmployerLoad),
          totalOperatingExpenses: parseDecimal(p.totalOperatingExpenses),
          subtotal: parseDecimal(p.subtotal),
          baseMonthlyRateBeforeDiscount: parseDecimal(p.baseMonthlyRateBeforeDiscount),
          grossMarginAmount: parseDecimal(p.grossMarginAmount),
          grossMarginPercent: parseDecimal(p.grossMarginPercent),
          finalMonthlyRate: parseDecimal(p.finalMonthlyRate),
          finalMonthlyRateWithVAT: parseDecimal(p.finalMonthlyRateWithVAT),
          estimatedDurationMonths: p.estimatedDurationMonths,
        }
      : null,
  };
}

