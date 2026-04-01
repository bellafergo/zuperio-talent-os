import type { VacancyApplicationStage } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

import {
  mapToApplicationMatrixRowUi,
  mapToCandidateApplicationRowUi,
  mapToVacancyPipelineRowUi,
  type ApplicationMatrixPrismaRow,
  type ApplicationWithCandidate,
  type ApplicationWithVacancy,
} from "./mappers";
import type {
  ApplicationMatrixRowUi,
  CandidateApplicationRowUi,
  VacancyPipelineRowUi,
} from "./types";

const STAGE_ORDER: VacancyApplicationStage[] = [
  "NEW",
  "PRE_SCREEN",
  "INTERNAL_INTERVIEW",
  "CLIENT_INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
  "WITHDRAWN",
];

function sortVacancyPipelineRows<
  T extends { status: string; stage: VacancyApplicationStage },
>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const sa = a.status === "ACTIVE" ? 0 : 1;
    const sb = b.status === "ACTIVE" ? 0 : 1;
    if (sa !== sb) return sa - sb;
    return STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage);
  });
}

const candidateSelect = {
  id: true,
  firstName: true,
  lastName: true,
} as const;

const vacancyInclude = {
  id: true,
  title: true,
  opportunity: { select: { company: { select: { id: true, name: true } } } },
} as const;

export async function listApplicationsForVacancyUi(
  vacancyId: string,
): Promise<VacancyPipelineRowUi[]> {
  const rows = sortVacancyPipelineRows(
    await prisma.vacancyApplication.findMany({
      where: { vacancyId },
      orderBy: { updatedAt: "desc" },
      include: { candidate: { select: candidateSelect } },
    }),
  );
  return rows.map((row) =>
    mapToVacancyPipelineRowUi(row as unknown as ApplicationWithCandidate),
  );
}

export async function listApplicationsForCandidateUi(
  candidateId: string,
): Promise<CandidateApplicationRowUi[]> {
  const rows = await prisma.vacancyApplication.findMany({
    where: { candidateId },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    // ACTIVE sorts before CLOSED; then most recently updated first.
    include: { vacancy: { select: vacancyInclude } },
  });
  return rows.map((row) =>
    mapToCandidateApplicationRowUi(row as unknown as ApplicationWithVacancy),
  );
}

export async function listAllApplicationsForUi(): Promise<ApplicationMatrixRowUi[]> {
  const rows = await prisma.vacancyApplication.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: {
      candidate: { select: candidateSelect },
      vacancy: { select: vacancyInclude },
    },
  });
  return rows.map((row) =>
    mapToApplicationMatrixRowUi(row as unknown as ApplicationMatrixPrismaRow),
  );
}
