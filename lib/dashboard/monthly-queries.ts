import type { VacancyStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

import type { DashboardMonthPeriod } from "@/lib/datetime/dashboard-month";

/** Vacancies considered “active” for staffing / sourcing. */
const ACTIVE_VACANCY_STATUSES: VacancyStatus[] = [
  "OPEN",
  "ON_HOLD",
  "SOURCING",
  "INTERVIEWING",
];

export type MonthlyCommercialClosureRow = {
  id: string;
  companyName: string;
  currency: string;
  finalMonthlyRate: number | null;
  candidateLabel: string;
  closureReferenceAt: Date;
  hasPreciseClosureAt: boolean;
};

export type MonthlyHiredRow = {
  placementId: string;
  candidateName: string;
  companyName: string;
  vacancyTitle: string;
  startDate: Date;
  status: string;
};

export type ActiveVacancyByCompanyRow = {
  companyId: string;
  companyName: string;
  count: number;
  titles: string[];
};

/**
 * WON proposals closed in the UTC month: `commercialClosedAt` in range, or legacy rows
 * (null closure) with `updatedAt` in range.
 */
export async function listMonthlyCommercialClosures(
  period: DashboardMonthPeriod,
): Promise<MonthlyCommercialClosureRow[]> {
  const { startUtc, endUtcExclusive } = period;

  const rows = await prisma.proposal.findMany({
    where: {
      status: "WON",
      OR: [
        {
          commercialClosedAt: {
            gte: startUtc,
            lt: endUtcExclusive,
          },
        },
        {
          AND: [
            { commercialClosedAt: null },
            {
              updatedAt: {
                gte: startUtc,
                lt: endUtcExclusive,
              },
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      currency: true,
      commercialClosedAt: true,
      updatedAt: true,
      company: { select: { name: true } },
      candidate: { select: { firstName: true, lastName: true } },
      pricing: { select: { finalMonthlyRate: true } },
    },
    orderBy: [{ commercialClosedAt: "asc" }, { updatedAt: "asc" }],
  });

  return rows.map((r) => {
    const rate = r.pricing?.finalMonthlyRate;
    const n = rate?.toNumber();
    const finalMonthlyRate =
      n != null && Number.isFinite(n) ? n : null;
    const c = r.candidate;
    const candidateLabel = c
      ? `${c.firstName} ${c.lastName}`.trim() || "—"
      : "—";
    const precise = r.commercialClosedAt != null;
    const closureReferenceAt = precise ? r.commercialClosedAt! : r.updatedAt;
    return {
      id: r.id,
      companyName: r.company.name?.trim() || "—",
      currency: r.currency?.trim() || "MXN",
      finalMonthlyRate,
      candidateLabel,
      closureReferenceAt,
      hasPreciseClosureAt: precise,
    };
  });
}

/** Placements whose assignment starts in the UTC month. */
export async function listMonthlyHiredPlacements(
  period: DashboardMonthPeriod,
): Promise<MonthlyHiredRow[]> {
  const { startUtc, endUtcExclusive } = period;

  const rows = await prisma.placement.findMany({
    where: {
      startDate: {
        gte: startUtc,
        lt: endUtcExclusive,
      },
    },
    select: {
      id: true,
      status: true,
      startDate: true,
      company: { select: { name: true } },
      vacancy: { select: { title: true } },
      candidate: { select: { firstName: true, lastName: true } },
    },
    orderBy: [{ startDate: "asc" }, { id: "asc" }],
  });

  return rows.map((r) => ({
    placementId: r.id,
    candidateName:
      `${r.candidate.firstName} ${r.candidate.lastName}`.trim() || "—",
    companyName: r.company.name?.trim() || "—",
    vacancyTitle: r.vacancy.title?.trim() || "—",
    startDate: r.startDate,
    status: r.status,
  }));
}

/**
 * Current active vacancies grouped by client company (not historical / month snapshot).
 */
export async function listActiveVacanciesByCompany(): Promise<
  ActiveVacancyByCompanyRow[]
> {
  const rows = await prisma.vacancy.findMany({
    where: { status: { in: ACTIVE_VACANCY_STATUSES } },
    select: {
      title: true,
      opportunity: {
        select: {
          company: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: [
      { opportunity: { company: { name: "asc" } } },
      { title: "asc" },
    ],
  });

  const map = new Map<
    string,
    { companyName: string; titles: string[] }
  >();

  for (const r of rows) {
    const co = r.opportunity?.company;
    const companyId = co?.id ?? "_unknown";
    const companyName = co?.name?.trim() || "Sin empresa";
    const title = r.title?.trim() || "—";
    let agg = map.get(companyId);
    if (!agg) {
      agg = { companyName, titles: [] };
      map.set(companyId, agg);
    }
    agg.titles.push(title);
  }

  return [...map.entries()]
    .map(([companyId, x]) => ({
      companyId,
      companyName: x.companyName,
      count: x.titles.length,
      titles: x.titles,
    }))
    .sort(
      (a, b) =>
        b.count - a.count || a.companyName.localeCompare(b.companyName, "es"),
    );
}

export function sumClosureMonthlyValue(
  rows: MonthlyCommercialClosureRow[],
): { mxn: number; usd: number; other: number } {
  const out = { mxn: 0, usd: 0, other: 0 };
  for (const r of rows) {
    if (r.finalMonthlyRate == null) continue;
    const c = r.currency.toUpperCase();
    if (c === "MXN") out.mxn += r.finalMonthlyRate;
    else if (c === "USD") out.usd += r.finalMonthlyRate;
    else out.other += r.finalMonthlyRate;
  }
  return out;
}
