import { DEFAULT_CURRENCY } from "@/lib/currency";
import { prisma } from "@/lib/prisma";

import { mapVacancyToListRow, type VacancyWithRelations } from "./mappers";
import type { CompanyOption, VacancyListRow, VacancyRequirementDraft } from "./types";

const vacancyInclude = {
  company: { select: { id: true, name: true } },
  opportunity: { select: { id: true, title: true } },
  contact: { select: { id: true, firstName: true, lastName: true } },
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

export type ContactOptionForVacancyForm = {
  id: string;
  displayName: string;
  companyId: string;
};

export async function listVacanciesForCompanyUi(companyId: string): Promise<VacancyListRow[]> {
  try {
    const rows = await prisma.vacancy.findMany({
      where: { companyId },
      include: vacancyInclude,
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    });
    return rows.map((row) =>
      mapVacancyToListRow(row as unknown as VacancyWithRelations),
    );
  } catch (err) {
    console.error("[listVacanciesForCompanyUi] failed:", err);
    return [];
  }
}

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

export async function listContactsForVacancyForm(): Promise<
  ContactOptionForVacancyForm[]
> {
  const rows = await prisma.contact.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      companyId: true,
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });
  return rows.map((c) => ({
    id: c.id,
    displayName: `${c.firstName} ${c.lastName ?? ""}`.trim(),
    companyId: c.companyId,
  }));
}

export type VacancyEditData = {
  id: string;
  title: string;
  companyId: string;
  opportunityId: string | null;
  contactId: string | null;
  seniorityValue: VacancyListRow["seniorityValue"];
  statusValue: VacancyListRow["statusValue"];
  targetRateAmount: number | null;
  currency: string;
  roleSummaryLine: string | null;
  workModality: string | null;
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
      companyId: true,
      opportunityId: true,
      contactId: true,
      seniority: true,
      status: true,
      targetRate: true,
      currency: true,
      roleSummary: true,
      workModality: true,
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
    companyId: row.companyId,
    opportunityId: row.opportunityId,
    contactId: row.contactId,
    seniorityValue: row.seniority as VacancyEditData["seniorityValue"],
    statusValue: row.status as VacancyEditData["statusValue"],
    targetRateAmount: normalizedAmount,
    currency: row.currency?.trim() || DEFAULT_CURRENCY,
    roleSummaryLine: row.roleSummary?.trim() || null,
    workModality: row.workModality?.trim() || null,
    requirements: row.skillRequirements.map((r) => ({
      skillId: r.skillId,
      required: r.required,
      minimumYears: r.minimumYears,
    })),
  };
}

export async function listCompaniesForVacancyForm(): Promise<CompanyOption[]> {
  return prisma.company.findMany({
    select: { id: true, name: true },
    orderBy: [{ name: "asc" }],
  });
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
