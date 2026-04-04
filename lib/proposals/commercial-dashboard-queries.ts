import type {
  PricingScheme,
  ProposalFormat,
  ProposalStatus,
} from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

import {
  addToCurrencySum,
  emptyCurrencySum,
  type CurrencyValueSum,
} from "@/lib/currency";
import { prisma } from "@/lib/prisma";

import { computeIsFollowUpPending } from "./follow-up";

type ProposalRow = {
  id: string;
  status: ProposalStatus;
  currency: string;
  sentAt: Date | null;
  followUpCount: number;
  format: ProposalFormat;
  companyId: string;
  company: { name: string };
  createdById: string | null;
  createdBy: { name: string | null; email: string } | null;
  pricing: {
    finalMonthlyRate: Prisma.Decimal | null;
    grossMarginPercent: Prisma.Decimal | null;
    scheme: PricingScheme;
  } | null;
};

function monthlyRate(p: ProposalRow["pricing"]): number | null {
  if (!p?.finalMonthlyRate) return null;
  const n = p.finalMonthlyRate.toNumber();
  return Number.isFinite(n) ? n : null;
}

function marginPercent(p: ProposalRow["pricing"]): number | null {
  if (!p?.grossMarginPercent) return null;
  const n = p.grossMarginPercent.toNumber();
  return Number.isFinite(n) ? n : null;
}

function sumNumeric(s: CurrencyValueSum): number {
  return s.mxn + s.usd + s.other;
}

export type StatusBreakdownRow = {
  status: ProposalStatus;
  count: number;
  valueSum: CurrencyValueSum;
};

export type CompanyBreakdownRow = {
  companyId: string;
  companyName: string;
  count: number;
  valueSum: CurrencyValueSum;
};

export type OwnerBreakdownRow = {
  userId: string | null;
  label: string;
  count: number;
  valueSum: CurrencyValueSum;
};

export type FormatBreakdownRow = {
  format: ProposalFormat;
  count: number;
  valueSum: CurrencyValueSum;
};

export type SchemeBreakdownRow = {
  scheme: PricingScheme;
  count: number;
  valueSum: CurrencyValueSum;
};

export type FollowUpRow = {
  id: string;
  companyName: string;
  sentAt: Date;
  followUpCount: number;
  status: ProposalStatus;
};

export type CommercialDashboardData = {
  counts: {
    total: number;
    draft: number;
    sent: number;
    viewed: number;
    followUpPending: number;
    inNegotiation: number;
    won: number;
    lost: number;
  };
  revenue: {
    pipelineNonLost: CurrencyValueSum;
    pipelineSent: CurrencyValueSum;
    pipelineNegotiation: CurrencyValueSum;
    won: CurrencyValueSum;
    lost: CurrencyValueSum;
    avgMarginPercent: number | null;
    /** Arithmetic mean of final monthly rate (no FX); interpret with caution if mixed currencies. */
    avgProposalValue: number | null;
  };
  byStatus: StatusBreakdownRow[];
  byCompany: CompanyBreakdownRow[];
  byOwner: OwnerBreakdownRow[];
  byFormat: FormatBreakdownRow[];
  byScheme: SchemeBreakdownRow[];
  followUps: FollowUpRow[];
};

const STATUS_ORDER: ProposalStatus[] = [
  "DRAFT",
  "SENT",
  "VIEWED",
  "IN_NEGOTIATION",
  "WON",
  "LOST",
];

function ownerLabel(row: ProposalRow): string {
  if (!row.createdById) return "Sin asignar";
  const n = row.createdBy?.name?.trim();
  if (n) return n;
  return row.createdBy?.email ?? "Usuario desconocido";
}

/**
 * Single fetch + deterministic in-memory aggregates.
 * Revenue sums are split by proposal `currency` (MXN / USD / other); no FX conversion.
 */
export async function getCommercialDashboardData(): Promise<CommercialDashboardData> {
  const rows = (await prisma.proposal.findMany({
    select: {
      id: true,
      status: true,
      currency: true,
      sentAt: true,
      followUpCount: true,
      format: true,
      companyId: true,
      company: { select: { name: true } },
      createdById: true,
      createdBy: { select: { name: true, email: true } },
      pricing: {
        select: {
          finalMonthlyRate: true,
          grossMarginPercent: true,
          scheme: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  })) as ProposalRow[];

  const now = Date.now();

  let draft = 0;
  let sent = 0;
  let viewed = 0;
  let inNegotiation = 0;
  let won = 0;
  let lost = 0;
  let followUpPending = 0;

  const pipelineNonLost = emptyCurrencySum();
  const pipelineSent = emptyCurrencySum();
  const pipelineNegotiation = emptyCurrencySum();
  const wonRev = emptyCurrencySum();
  const lostRev = emptyCurrencySum();

  const margins: number[] = [];
  const values: number[] = [];

  const statusMap = new Map<
    ProposalStatus,
    { count: number; valueSum: CurrencyValueSum }
  >();
  const companyMap = new Map<
    string,
    { name: string; count: number; valueSum: CurrencyValueSum }
  >();
  const ownerMap = new Map<
    string | null,
    { label: string; count: number; valueSum: CurrencyValueSum }
  >();
  const formatMap = new Map<
    ProposalFormat,
    { count: number; valueSum: CurrencyValueSum }
  >();
  const schemeMap = new Map<
    PricingScheme,
    { count: number; valueSum: CurrencyValueSum }
  >();

  const followUps: FollowUpRow[] = [];

  for (const row of rows) {
    const v = monthlyRate(row.pricing);
    const m = marginPercent(row.pricing);

    if (m != null) margins.push(m);
    if (v != null) values.push(v);

    switch (row.status) {
      case "DRAFT":
        draft += 1;
        break;
      case "SENT":
        sent += 1;
        break;
      case "VIEWED":
        viewed += 1;
        break;
      case "IN_NEGOTIATION":
        inNegotiation += 1;
        break;
      case "WON":
        won += 1;
        break;
      case "LOST":
        lost += 1;
        break;
    }

    if (computeIsFollowUpPending(row.status, row.sentAt, now)) {
      followUpPending += 1;
      if (row.sentAt) {
        followUps.push({
          id: row.id,
          companyName: row.company.name,
          sentAt: row.sentAt,
          followUpCount: row.followUpCount,
          status: row.status,
        });
      }
    }

    if (v != null) {
      if (row.status !== "LOST") addToCurrencySum(pipelineNonLost, row.currency, v);
      if (row.status === "SENT") addToCurrencySum(pipelineSent, row.currency, v);
      if (row.status === "IN_NEGOTIATION")
        addToCurrencySum(pipelineNegotiation, row.currency, v);
      if (row.status === "WON") addToCurrencySum(wonRev, row.currency, v);
      if (row.status === "LOST") addToCurrencySum(lostRev, row.currency, v);
    }

    let stAgg = statusMap.get(row.status);
    if (!stAgg) {
      stAgg = { count: 0, valueSum: emptyCurrencySum() };
      statusMap.set(row.status, stAgg);
    }
    stAgg.count += 1;
    if (v != null) addToCurrencySum(stAgg.valueSum, row.currency, v);

    let coAgg = companyMap.get(row.companyId);
    if (!coAgg) {
      coAgg = { name: row.company.name, count: 0, valueSum: emptyCurrencySum() };
      companyMap.set(row.companyId, coAgg);
    }
    coAgg.count += 1;
    if (v != null) addToCurrencySum(coAgg.valueSum, row.currency, v);

    const ownerKey = row.createdById;
    const oLabel = ownerLabel(row);
    let owAgg = ownerMap.get(ownerKey);
    if (!owAgg) {
      owAgg = { label: oLabel, count: 0, valueSum: emptyCurrencySum() };
      ownerMap.set(ownerKey, owAgg);
    }
    owAgg.count += 1;
    if (v != null) addToCurrencySum(owAgg.valueSum, row.currency, v);

    let fAgg = formatMap.get(row.format);
    if (!fAgg) {
      fAgg = { count: 0, valueSum: emptyCurrencySum() };
      formatMap.set(row.format, fAgg);
    }
    fAgg.count += 1;
    if (v != null) addToCurrencySum(fAgg.valueSum, row.currency, v);

    const scheme = row.pricing?.scheme ?? "MIXED";
    let scAgg = schemeMap.get(scheme);
    if (!scAgg) {
      scAgg = { count: 0, valueSum: emptyCurrencySum() };
      schemeMap.set(scheme, scAgg);
    }
    scAgg.count += 1;
    if (v != null) addToCurrencySum(scAgg.valueSum, row.currency, v);
  }

  followUps.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());

  const avgMarginPercent =
    margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : null;
  const avgProposalValue =
    values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;

  const byStatus: StatusBreakdownRow[] = STATUS_ORDER.map((status) => {
    const x = statusMap.get(status) ?? { count: 0, valueSum: emptyCurrencySum() };
    return { status, count: x.count, valueSum: x.valueSum };
  });

  const byCompany: CompanyBreakdownRow[] = [...companyMap.entries()]
    .map(([companyId, x]) => ({
      companyId,
      companyName: x.name,
      count: x.count,
      valueSum: x.valueSum,
    }))
    .sort(
      (a, b) =>
        sumNumeric(b.valueSum) - sumNumeric(a.valueSum) || b.count - a.count,
    )
    .slice(0, 15);

  const byOwner: OwnerBreakdownRow[] = [...ownerMap.entries()]
    .map(([userId, x]) => ({
      userId,
      label: x.label,
      count: x.count,
      valueSum: x.valueSum,
    }))
    .sort(
      (a, b) =>
        sumNumeric(b.valueSum) - sumNumeric(a.valueSum) || b.count - a.count,
    );

  const byFormat: FormatBreakdownRow[] = (["SIMPLE", "DETAILED"] as ProposalFormat[]).map(
    (format) => {
      const x = formatMap.get(format) ?? { count: 0, valueSum: emptyCurrencySum() };
      return { format, count: x.count, valueSum: x.valueSum };
    },
  );

  const byScheme: SchemeBreakdownRow[] = (["MIXED", "FULL_IMSS"] as PricingScheme[]).map(
    (scheme) => {
      const x = schemeMap.get(scheme) ?? { count: 0, valueSum: emptyCurrencySum() };
      return { scheme, count: x.count, valueSum: x.valueSum };
    },
  );

  return {
    counts: {
      total: rows.length,
      draft,
      sent,
      viewed,
      followUpPending,
      inNegotiation,
      won,
      lost,
    },
    revenue: {
      pipelineNonLost,
      pipelineSent,
      pipelineNegotiation,
      won: wonRev,
      lost: lostRev,
      avgMarginPercent,
      avgProposalValue,
    },
    byStatus,
    byCompany,
    byOwner,
    byFormat,
    byScheme,
    followUps,
  };
}

/** Safe fallback when the main dashboard aggregate query fails. */
export function emptyCommercialDashboardData(): CommercialDashboardData {
  const z = emptyCurrencySum();
  return {
    counts: {
      total: 0,
      draft: 0,
      sent: 0,
      viewed: 0,
      followUpPending: 0,
      inNegotiation: 0,
      won: 0,
      lost: 0,
    },
    revenue: {
      pipelineNonLost: z,
      pipelineSent: z,
      pipelineNegotiation: z,
      won: z,
      lost: z,
      avgMarginPercent: null,
      avgProposalValue: null,
    },
    byStatus: STATUS_ORDER.map((status) => ({
      status,
      count: 0,
      valueSum: emptyCurrencySum(),
    })),
    byCompany: [],
    byOwner: [],
    byFormat: (["SIMPLE", "DETAILED"] as ProposalFormat[]).map((format) => ({
      format,
      count: 0,
      valueSum: emptyCurrencySum(),
    })),
    byScheme: (["MIXED", "FULL_IMSS"] as PricingScheme[]).map((scheme) => ({
      scheme,
      count: 0,
      valueSum: emptyCurrencySum(),
    })),
    followUps: [],
  };
}
