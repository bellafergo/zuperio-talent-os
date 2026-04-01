import { prisma } from "@/lib/prisma";

import {
  mapPlacementToCurrentAssignmentUi,
  mapPlacementToListRowUi,
  type PlacementWithRelations,
} from "./mappers";
import type { CandidateCurrentAssignmentUi, PlacementListRowUi } from "./types";

const placementInclude = {
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
    include: placementInclude,
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
    include: placementInclude,
    orderBy: { startDate: "desc" },
  });
  return sortPlacementsForDirectory(rows as unknown as PlacementWithRelations[]).map(
    mapPlacementToListRowUi,
  );
}

/** Most recent active assignment for the candidate profile, if any. */
export async function getCurrentAssignmentForCandidateUi(
  candidateId: string,
): Promise<CandidateCurrentAssignmentUi | null> {
  const row = await prisma.placement.findFirst({
    where: { candidateId, status: "ACTIVE" },
    orderBy: { startDate: "desc" },
    include: placementInclude,
  });
  return row
    ? mapPlacementToCurrentAssignmentUi(row as unknown as PlacementWithRelations)
    : null;
}
