import type { VacancySeniorityUi } from "@/lib/vacancies/types";

export type MatchRecommendationUi =
  | "Strong match"
  | "Partial match"
  | "Low match";

/** Row for vacancy detail — matched candidates. */
export type VacancyMatchRowUi = {
  matchId: string;
  candidateId: string;
  candidateName: string;
  candidateRole: string;
  candidateSeniority: VacancySeniorityUi;
  score: number;
  recommendation: MatchRecommendationUi;
  skillsMatchNotes: string | null;
};

/** Row for candidate detail — matched vacancies. */
export type CandidateMatchRowUi = {
  matchId: string;
  vacancyId: string;
  vacancyTitle: string;
  companyName: string;
  score: number;
  recommendation: MatchRecommendationUi;
};

/** Global matching table. */
export type MatchMatrixRowUi = {
  matchId: string;
  candidateId: string;
  candidateName: string;
  vacancyId: string;
  vacancyTitle: string;
  companyName: string;
  score: number;
  recommendation: MatchRecommendationUi;
};
