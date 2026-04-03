import type { MatchRecommendation as PrismaMatchRecommendation } from "@/generated/prisma/enums";

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
  STRONG_MATCH: "Match alto",
  PARTIAL_MATCH: "Match medio",
  LOW_MATCH: "Match bajo",
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
};

type VacancyMini = {
  id: string;
  title: string;
  opportunity: { company: { name: string } };
};

export type MatchWithCandidate = {
  id: string;
  score: number;
  explanation: string;
  recommendation: PrismaMatchRecommendation;
  candidate: CandidateMini;
};

export type MatchWithVacancy = {
  id: string;
  score: number;
  explanation: string;
  recommendation: PrismaMatchRecommendation;
  vacancy: VacancyMini;
};

export type MatchMatrixPrismaRow = {
  id: string;
  score: number;
  explanation: string;
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
    score: row.score,
    recommendation: mapMatchRecommendationToUi(row.recommendation),
    explanation: row.explanation,
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
    explanation: row.explanation,
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
    explanation: row.explanation,
  };
}
