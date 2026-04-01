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

function formatDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseDecimal(
  value: { toNumber?: () => number } | number | string | null | undefined,
): number | null {
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

export type PlacementWithRelations = {
  id: string;
  startDate: Date;
  endDate: Date | null;
  status: PrismaPlacementStatus;
  rateClient?: { toNumber?: () => number } | number | string | null;
  rateCandidate?: { toNumber?: () => number } | number | string | null;
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
    startDateValue: formatDateInput(row.startDate),
    endDateValue: row.endDate ? formatDateInput(row.endDate) : null,
    statusValue: row.status,
    rateClientAmount: parseDecimal(row.rateClient ?? null),
    rateCandidateAmount: parseDecimal(row.rateCandidate ?? null),
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
