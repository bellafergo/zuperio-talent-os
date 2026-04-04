import { DEFAULT_CURRENCY } from "@/lib/currency";
import { prisma } from "@/lib/prisma";

import { mapVacancyToListRow, type VacancyWithRelations } from "./mappers";
import type { VacancyListRow, VacancyRequirementDraft } from "./types";

const vacancyInclude = {
  opportunity: {
    select: {
      id: true,
      title: true,
      company: { select: { id: true, name: true } },
    },
  },
} as const;

export async function listVacanciesForUi(): Promise<VacancyListRow[]> {
  const rows = await prisma.vacancy.findMany({
    include: vacancyInclude,
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
  });
  return rows.map((row) =>
    mapVacancyToListRow(row as unknown as VacancyWithRelations),
  );
}

export async function getVacancyByIdForUi(
  id: string,
): Promise<VacancyListRow | null> {
  const row = await prisma.vacancy.findUnique({
    where: { id },
    include: vacancyInclude,
  });
  return row ? mapVacancyToListRow(row as unknown as VacancyWithRelations) : null;
}

export type OpportunityOptionForVacancyForm = {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
};

export async function listOpportunitiesForVacancyForm(): Promise<
  OpportunityOptionForVacancyForm[]
> {
  return prisma.opportunity.findMany({
    select: {
      id: true,
      title: true,
      company: { select: { id: true, name: true } },
    },
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
  }).then((rows) =>
    rows.map((o) => ({
      id: o.id,
      title: o.title,
      companyId: o.company.id,
      companyName: o.company.name,
    })),
  );
}

export type VacancyEditData = {
  id: string;
  title: string;
  opportunityId: string;
  seniorityValue: VacancyListRow["seniorityValue"];
  statusValue: VacancyListRow["statusValue"];
  targetRateAmount: number | null;
  currency: string;
  roleSummaryLine: string | null;
  requirements: VacancyRequirementDraft[];
};

export async function getVacancyEditData(
  id: string,
): Promise<VacancyEditData | null> {
  const row = await prisma.vacancy.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      opportunityId: true,
      seniority: true,
      status: true,
      targetRate: true,
      currency: true,
      roleSummary: true,
      skillRequirements: {
        select: { skillId: true, required: true, minimumYears: true },
        orderBy: [{ required: "desc" }, { updatedAt: "desc" }],
      },
    },
  });
  if (!row) return null;

  const amount =
    typeof row.targetRate === "object" &&
    row.targetRate !== null &&
    "toNumber" in row.targetRate &&
    typeof (row.targetRate as { toNumber: () => number }).toNumber === "function"
      ? (row.targetRate as { toNumber: () => number }).toNumber()
      : row.targetRate == null
        ? null
        : Number(row.targetRate);

  const normalizedAmount = Number.isFinite(amount as number) ? (amount as number) : null;

  return {
    id: row.id,
    title: row.title,
    opportunityId: row.opportunityId,
    seniorityValue: row.seniority as VacancyEditData["seniorityValue"],
    statusValue: row.status as VacancyEditData["statusValue"],
    targetRateAmount: normalizedAmount,
    currency: row.currency?.trim() || DEFAULT_CURRENCY,
    roleSummaryLine: row.roleSummary?.trim() || null,
    requirements: row.skillRequirements.map((r) => ({
      skillId: r.skillId,
      required: r.required,
      minimumYears: r.minimumYears,
    })),
  };
}

/** Vacancies that can still receive candidates (intake / pipeline). */
const ACTIVE_VACANCY_STATUSES = [
  "OPEN",
  "SOURCING",
  "INTERVIEWING",
  "ON_HOLD",
] as const;

export type OpenVacancyOptionForCandidateForm = {
  id: string;
  title: string;
};

export async function listOpenVacanciesForCandidateForm(): Promise<
  OpenVacancyOptionForCandidateForm[]
> {
  const rows = await prisma.vacancy.findMany({
    where: { status: { in: [...ACTIVE_VACANCY_STATUSES] } },
    select: { id: true, title: true },
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
  });
  return rows;
}
