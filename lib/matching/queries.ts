import { prisma } from "@/lib/prisma";

import { buildSkillCoverageBreakdown } from "./compute";
import {
  buildCandidateVacancyComparisonMatrix,
  type CandidateVacancyComparisonMatrix,
} from "./comparison-matrix";
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
} as const;

const vacancyForMatchSelect = {
  id: true,
  title: true,
  company: { select: { name: true } },
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

export type ComparisonMatrixBundle = CandidateVacancyComparisonMatrix & {
  candidateName: string;
  vacancyTitle: string;
  companyName: string;
  /** Skills requeridos cumplidos / faltantes (solo si `skillMatchActive`). */
  skillBreakdown: {
    met: { skillId: string; skillName: string }[];
    missing: { skillId: string; skillName: string }[];
    candidateSkillNames: string[];
  } | null;
};

function busyOnOtherVacancy(
  candidateId: string,
  vacancyId: string,
  activeVacancyIds: string[],
): boolean {
  return activeVacancyIds.some((vid) => vid !== vacancyId);
}

/**
 * Loads structured candidate + vacancy data and builds the comparison matrix
 * using the same inputs as match sync / `computeStructuredCandidateVacancyMatch`.
 */
export async function getComparisonMatrixForPair(
  candidateId: string,
  vacancyId: string,
): Promise<ComparisonMatrixBundle | null> {
  const [candidate, vacancy, activePlacements] = await Promise.all([
    prisma.candidate.findUnique({
      where: { id: candidateId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        seniority: true,
        availabilityStatus: true,
        role: true,
        structuredSkills: {
          select: {
            skillId: true,
            yearsExperience: true,
            skill: { select: { name: true } },
          },
        },
      },
    }),
    prisma.vacancy.findUnique({
      where: { id: vacancyId },
      select: {
        id: true,
        title: true,
        roleSummary: true,
        seniority: true,
        skillRequirements: {
          select: {
            skillId: true,
            required: true,
            minimumYears: true,
            skill: { select: { name: true } },
          },
        },
        company: { select: { name: true } },
      },
    }),
    prisma.placement.findMany({
      where: { status: "ACTIVE", candidateId },
      select: { vacancyId: true },
    }),
  ]);

  if (!candidate || !vacancy) return null;

  const activeVacancyIds = activePlacements.map((p) => p.vacancyId);
  const placementCtx = {
    busyOnOtherVacancy: busyOnOtherVacancy(
      candidateId,
      vacancyId,
      activeVacancyIds,
    ),
  };

  const requirementSkillNames = new Map<string, string>();
  for (const r of vacancy.skillRequirements) {
    requirementSkillNames.set(r.skillId, r.skill.name);
  }

  const candidateSkillsInput = candidate.structuredSkills.map((cs) => ({
    skillId: cs.skillId,
    skillName: cs.skill.name,
    yearsExperience: cs.yearsExperience,
  }));

  const vacancyReqsInput = vacancy.skillRequirements.map((r) => ({
    skillId: r.skillId,
    required: r.required,
    minimumYears: r.minimumYears,
  }));

  const matrix = buildCandidateVacancyComparisonMatrix(
    {
      seniority: candidate.seniority,
      availabilityStatus: candidate.availabilityStatus,
      role: candidate.role,
      skills: candidateSkillsInput,
    },
    {
      seniority: vacancy.seniority,
      title: vacancy.title,
      roleSummary: vacancy.roleSummary,
      requirements: vacancyReqsInput,
    },
    placementCtx,
    requirementSkillNames,
  );

  const candidateName =
    `${candidate.firstName} ${candidate.lastName}`.trim() || "Candidate";

  const skillBreakdown = matrix.skillMatchActive
    ? {
        ...buildSkillCoverageBreakdown(
          vacancyReqsInput,
          candidateSkillsInput,
          requirementSkillNames,
        ),
        candidateSkillNames: [...candidateSkillsInput.map((s) => s.skillName)].sort(
          (a, b) => a.localeCompare(b),
        ),
      }
    : null;

  return {
    ...matrix,
    candidateName,
    vacancyTitle: vacancy.title,
    companyName: vacancy.company.name,
    skillBreakdown,
  };
}

export async function getComparisonMatrixByMatchId(
  matchId: string,
): Promise<ComparisonMatrixBundle | null> {
  const row = await prisma.candidateVacancyMatch.findUnique({
    where: { id: matchId },
    select: { candidateId: true, vacancyId: true },
  });
  if (!row) return null;
  return getComparisonMatrixForPair(row.candidateId, row.vacancyId);
}
