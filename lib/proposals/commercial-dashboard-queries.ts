import type {
  PricingScheme,
  ProposalFormat,
  ProposalStatus,
} from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import { computeIsFollowUpPending } from "./follow-up";

type ProposalRow = {
  id: string;
  status: ProposalStatus;
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

export type StatusBreakdownRow = {
  status: ProposalStatus;
  count: number;
  valueSum: number;
};

export type CompanyBreakdownRow = {
  companyId: string;
  companyName: string;
  count: number;
  valueSum: number;
};

export type OwnerBreakdownRow = {
  userId: string | null;
  label: string;
  count: number;
  valueSum: number;
};

export type FormatBreakdownRow = {
  format: ProposalFormat;
  count: number;
  valueSum: number;
};

export type SchemeBreakdownRow = {
  scheme: PricingScheme;
  count: number;
  valueSum: number;
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
    /** Sum of finalMonthlyRate for all proposals except LOST (null pricing excluded from sum). */
    pipelineNonLost: number;
    pipelineSent: number;
    pipelineNegotiation: number;
    won: number;
    lost: number;
    /** Simple mean of grossMarginPercent where present. */
    avgMarginPercent: number | null;
    /** Simple mean of finalMonthlyRate where present. */
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
  if (!row.createdById) return "Unassigned";
  const n = row.createdBy?.name?.trim();
  if (n) return n;
  return row.createdBy?.email ?? "Unknown user";
}

/**
 * Single fetch + deterministic in-memory aggregates.
 * Revenue uses `finalMonthlyRate` (monthly client rate, major currency units as stored per proposal).
 * Mixed currencies are summed numerically — see UI note.
 */
export async function getCommercialDashboardData(): Promise<CommercialDashboardData> {
  const rows = (await prisma.proposal.findMany({
    select: {
      id: true,
      status: true,
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

  let pipelineNonLost = 0;
  let pipelineSent = 0;
  let pipelineNegotiation = 0;
  let wonRev = 0;
  let lostRev = 0;

  const margins: number[] = [];
  const values: number[] = [];

  const statusMap = new Map<ProposalStatus, { count: number; valueSum: number }>();
  const companyMap = new Map<string, { name: string; count: number; valueSum: number }>();
  const ownerMap = new Map<string | null, { label: string; count: number; valueSum: number }>();
  const formatMap = new Map<ProposalFormat, { count: number; valueSum: number }>();
  const schemeMap = new Map<PricingScheme, { count: number; valueSum: number }>();

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
      if (row.status !== "LOST") pipelineNonLost += v;
      if (row.status === "SENT") pipelineSent += v;
      if (row.status === "IN_NEGOTIATION") pipelineNegotiation += v;
      if (row.status === "WON") wonRev += v;
      if (row.status === "LOST") lostRev += v;
    }

    const stAgg = statusMap.get(row.status) ?? { count: 0, valueSum: 0 };
    stAgg.count += 1;
    if (v != null) stAgg.valueSum += v;
    statusMap.set(row.status, stAgg);

    const coAgg =
      companyMap.get(row.companyId) ?? { name: row.company.name, count: 0, valueSum: 0 };
    coAgg.count += 1;
    if (v != null) coAgg.valueSum += v;
    companyMap.set(row.companyId, coAgg);

    const ownerKey = row.createdById;
    const oLabel = ownerLabel(row);
    const owAgg = ownerMap.get(ownerKey) ?? { label: oLabel, count: 0, valueSum: 0 };
    owAgg.count += 1;
    if (v != null) owAgg.valueSum += v;
    ownerMap.set(ownerKey, owAgg);

    const fAgg = formatMap.get(row.format) ?? { count: 0, valueSum: 0 };
    fAgg.count += 1;
    if (v != null) fAgg.valueSum += v;
    formatMap.set(row.format, fAgg);

    const scheme = row.pricing?.scheme ?? "MIXED";
    const scAgg = schemeMap.get(scheme) ?? { count: 0, valueSum: 0 };
    scAgg.count += 1;
    if (v != null) scAgg.valueSum += v;
    schemeMap.set(scheme, scAgg);
  }

  followUps.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());

  const avgMarginPercent =
    margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : null;
  const avgProposalValue =
    values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;

  const byStatus: StatusBreakdownRow[] = STATUS_ORDER.map((status) => {
    const x = statusMap.get(status) ?? { count: 0, valueSum: 0 };
    return { status, count: x.count, valueSum: x.valueSum };
  });

  const byCompany: CompanyBreakdownRow[] = [...companyMap.entries()]
    .map(([companyId, x]) => ({
      companyId,
      companyName: x.name,
      count: x.count,
      valueSum: x.valueSum,
    }))
    .sort((a, b) => b.valueSum - a.valueSum || b.count - a.count)
    .slice(0, 15);

  const byOwner: OwnerBreakdownRow[] = [...ownerMap.entries()]
    .map(([userId, x]) => ({
      userId,
      label: x.label,
      count: x.count,
      valueSum: x.valueSum,
    }))
    .sort((a, b) => b.valueSum - a.valueSum || b.count - a.count);

  const byFormat: FormatBreakdownRow[] = (["SIMPLE", "DETAILED"] as ProposalFormat[]).map(
    (format) => {
      const x = formatMap.get(format) ?? { count: 0, valueSum: 0 };
      return { format, count: x.count, valueSum: x.valueSum };
    },
  );

  const byScheme: SchemeBreakdownRow[] = (["MIXED", "FULL_IMSS"] as PricingScheme[]).map(
    (scheme) => {
      const x = schemeMap.get(scheme) ?? { count: 0, valueSum: 0 };
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
