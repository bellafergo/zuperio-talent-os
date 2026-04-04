import { prisma } from "@/lib/prisma";

import {
  mapPlacementToCurrentAssignmentUi,
  mapPlacementToListRowUi,
  type PlacementWithRelations,
} from "./mappers";
import type { CandidateCurrentAssignmentUi, PlacementListRowUi } from "./types";

export type PlacementCandidateOption = {
  id: string;
  name: string;
};

export type PlacementVacancyOption = {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
};

const placementSelect = {
  id: true,
  startDate: true,
  endDate: true,
  status: true,
  rateClient: true,
  rateCandidate: true,
  candidate: { select: { id: true, firstName: true, lastName: true } },
  vacancy: { select: { id: true, title: true } },
  company: { select: { id: true, name: true } },
} as const;

const statusOrder: Record<string, number> = {
  ACTIVE: 0,
  COMPLETED: 1,
  CANCELLED: 2,
};

function sortPlacementsForDirectory(rows: PlacementWithRelations[]) {
  return [...rows].sort((a, b) => {
    const sa = statusOrder[a.status] ?? 99;
    const sb = statusOrder[b.status] ?? 99;
    if (sa !== sb) return sa - sb;
    return b.startDate.getTime() - a.startDate.getTime();
  });
}

export async function listPlacementsForActiveEmployeesUi(): Promise<
  PlacementListRowUi[]
> {
  const rows = await prisma.placement.findMany({
    select: placementSelect,
    orderBy: { startDate: "desc" },
  });
  return sortPlacementsForDirectory(rows as unknown as PlacementWithRelations[]).map(
    mapPlacementToListRowUi,
  );
}

export async function listPlacementsForCompanyUi(
  companyId: string,
): Promise<PlacementListRowUi[]> {
  const rows = await prisma.placement.findMany({
    where: { companyId },
    select: placementSelect,
    orderBy: { startDate: "desc" },
  });
  return sortPlacementsForDirectory(rows as unknown as PlacementWithRelations[]).map(
    mapPlacementToListRowUi,
  );
}

export async function listCandidatesForPlacementForm(): Promise<
  PlacementCandidateOption[]
> {
  const rows = await prisma.candidate.findMany({
    select: { id: true, firstName: true, lastName: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  return rows.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`.trim(),
  }));
}

export async function listVacanciesForPlacementForm(): Promise<
  PlacementVacancyOption[]
> {
  const rows = await prisma.vacancy.findMany({
    select: {
      id: true,
      title: true,
      company: { select: { id: true, name: true } },
    },
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
  });

  return rows.map((v) => ({
    id: v.id,
    title: v.title,
    companyId: v.company.id,
    companyName: v.company.name,
  }));
}

/** Most recent active assignment for the candidate profile, if any. */
export async function getCurrentAssignmentForCandidateUi(
  candidateId: string,
): Promise<CandidateCurrentAssignmentUi | null> {
  const row = await prisma.placement.findFirst({
    where: { candidateId, status: "ACTIVE" },
    orderBy: { startDate: "desc" },
    select: placementSelect,
  });
  return row
    ? mapPlacementToCurrentAssignmentUi(row as unknown as PlacementWithRelations)
    : null;
}
