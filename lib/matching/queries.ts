import { prisma } from "@/lib/prisma";

import {
  mapMatchToCandidateRowUi,
  mapMatchToMatrixRowUi,
  mapMatchToVacancyRowUi,
  type MatchMatrixPrismaRow,
  type MatchWithCandidate,
  type MatchWithVacancy,
} from "./mappers";
import type {
  CandidateMatchRowUi,
  MatchMatrixRowUi,
  VacancyMatchRowUi,
} from "./types";

const candidateSelect = {
  id: true,
  firstName: true,
  lastName: true,
  role: true,
  seniority: true,
} as const;

const vacancyForMatchSelect = {
  id: true,
  title: true,
  opportunity: { select: { company: { select: { name: true } } } },
} as const;

export async function listMatchesForVacancyUi(
  vacancyId: string,
): Promise<VacancyMatchRowUi[]> {
  const rows = await prisma.candidateVacancyMatch.findMany({
    where: { vacancyId },
    orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
    include: { candidate: { select: candidateSelect } },
  });
  return rows.map((row) =>
    mapMatchToVacancyRowUi(row as unknown as MatchWithCandidate),
  );
}

export async function listMatchesForCandidateUi(
  candidateId: string,
): Promise<CandidateMatchRowUi[]> {
  const rows = await prisma.candidateVacancyMatch.findMany({
    where: { candidateId },
    orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
    include: { vacancy: { select: vacancyForMatchSelect } },
  });
  return rows.map((row) =>
    mapMatchToCandidateRowUi(row as unknown as MatchWithVacancy),
  );
}

export async function listAllMatchesForUi(): Promise<MatchMatrixRowUi[]> {
  const rows = await prisma.candidateVacancyMatch.findMany({
    orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
    include: {
      candidate: { select: candidateSelect },
      vacancy: { select: vacancyForMatchSelect },
    },
  });
  return rows.map((row) =>
    mapMatchToMatrixRowUi(row as unknown as MatchMatrixPrismaRow),
  );
}
