import type { PlacementStatus as PrismaPlacementStatus } from "@/generated/prisma/enums";

import type {
  CandidateCurrentAssignmentUi,
  PlacementListRowUi,
  PlacementStatusUi,
} from "./types";

const prismaStatusToUi: Record<PrismaPlacementStatus, PlacementStatusUi> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function formatPlacementDate(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export type PlacementWithRelations = {
  id: string;
  startDate: Date;
  endDate: Date | null;
  status: PrismaPlacementStatus;
  candidate: { id: string; firstName: string; lastName: string };
  vacancy: { id: string; title: string };
  company: { id: string; name: string };
};

function candidateDisplayName(c: PlacementWithRelations["candidate"]): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

export function mapPlacementToListRowUi(
  row: PlacementWithRelations,
): PlacementListRowUi {
  return {
    id: row.id,
    candidateId: row.candidate.id,
    candidateName: candidateDisplayName(row.candidate),
    companyId: row.company.id,
    companyName: row.company.name,
    vacancyId: row.vacancy.id,
    vacancyTitle: row.vacancy.title,
    startDateLabel: formatPlacementDate(row.startDate),
    status: prismaStatusToUi[row.status],
  };
}

export function mapPlacementToCurrentAssignmentUi(
  row: PlacementWithRelations,
): CandidateCurrentAssignmentUi {
  return {
    placementId: row.id,
    companyId: row.company.id,
    companyName: row.company.name,
    vacancyId: row.vacancy.id,
    vacancyTitle: row.vacancy.title,
    startDateLabel: formatPlacementDate(row.startDate),
    endDateLabel: row.endDate ? formatPlacementDate(row.endDate) : null,
    status: prismaStatusToUi[row.status],
  };
}
