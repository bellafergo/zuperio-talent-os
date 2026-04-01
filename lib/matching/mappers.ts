import type {
  MatchRecommendation as PrismaMatchRecommendation,
  VacancySeniority as PrismaVacancySeniority,
} from "@/generated/prisma/enums";

import { prismaSeniorityToUi } from "@/lib/vacancies/mappers";

import type {
  CandidateMatchRowUi,
  MatchMatrixRowUi,
  MatchRecommendationUi,
  VacancyMatchRowUi,
} from "./types";

const prismaRecommendationToUi: Record<
  PrismaMatchRecommendation,
  MatchRecommendationUi
> = {
  STRONG_MATCH: "Strong match",
  PARTIAL_MATCH: "Partial match",
  LOW_MATCH: "Low match",
};

export function mapMatchRecommendationToUi(
  r: PrismaMatchRecommendation,
): MatchRecommendationUi {
  return prismaRecommendationToUi[r];
}

type CandidateMini = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  seniority: PrismaVacancySeniority;
};

type VacancyMini = {
  id: string;
  title: string;
  opportunity: { company: { name: string } };
};

export type MatchWithCandidate = {
  id: string;
  score: number;
  skillsMatchNotes: string | null;
  recommendation: PrismaMatchRecommendation;
  candidate: CandidateMini;
};

export type MatchWithVacancy = {
  id: string;
  score: number;
  recommendation: PrismaMatchRecommendation;
  vacancy: VacancyMini;
};

export type MatchMatrixPrismaRow = {
  id: string;
  score: number;
  recommendation: PrismaMatchRecommendation;
  candidate: CandidateMini;
  vacancy: VacancyMini;
};

function candidateName(c: CandidateMini): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

export function mapMatchToVacancyRowUi(row: MatchWithCandidate): VacancyMatchRowUi {
  return {
    matchId: row.id,
    candidateId: row.candidate.id,
    candidateName: candidateName(row.candidate),
    candidateRole: row.candidate.role,
    candidateSeniority: prismaSeniorityToUi[row.candidate.seniority],
    score: row.score,
    recommendation: mapMatchRecommendationToUi(row.recommendation),
    skillsMatchNotes: row.skillsMatchNotes,
  };
}

export function mapMatchToCandidateRowUi(row: MatchWithVacancy): CandidateMatchRowUi {
  return {
    matchId: row.id,
    vacancyId: row.vacancy.id,
    vacancyTitle: row.vacancy.title,
    companyName: row.vacancy.opportunity.company.name,
    score: row.score,
    recommendation: mapMatchRecommendationToUi(row.recommendation),
  };
}

export function mapMatchToMatrixRowUi(row: MatchMatrixPrismaRow): MatchMatrixRowUi {
  return {
    matchId: row.id,
    candidateId: row.candidate.id,
    candidateName: candidateName(row.candidate),
    vacancyId: row.vacancy.id,
    vacancyTitle: row.vacancy.title,
    companyName: row.vacancy.opportunity.company.name,
    score: row.score,
    recommendation: mapMatchRecommendationToUi(row.recommendation),
  };
}
