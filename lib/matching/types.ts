export type MatchRecommendationUi =
  | "Match fuerte"
  | "Match parcial"
  | "Match bajo";

/** Row for vacancy detail — matched candidates. */
export type VacancyMatchRowUi = {
  matchId: string;
  candidateId: string;
  candidateName: string;
  score: number;
  recommendation: MatchRecommendationUi;
  explanation: string;
};

/** Row for candidate detail — matched vacancies. */
export type CandidateMatchRowUi = {
  matchId: string;
  vacancyId: string;
  vacancyTitle: string;
  companyName: string;
  score: number;
  recommendation: MatchRecommendationUi;
  explanation: string;
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
  explanation: string;
};
