/**
 * Recruitment pipeline seeds (VacancyApplication). At most one ACTIVE row per (vacancyId, candidateId).
 */

export type SeedVacancyApplicationStage =
  | "NEW"
  | "PRE_SCREEN"
  | "INTERNAL_INTERVIEW"
  | "CLIENT_INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export type SeedVacancyApplicationStatus = "ACTIVE" | "CLOSED";

export type SeedVacancyApplication = {
  id: string;
  vacancyId: string;
  candidateId: string;
  stage: SeedVacancyApplicationStage;
  status: SeedVacancyApplicationStatus;
  source?: string | null;
  notes?: string | null;
};

export const SEED_VACANCY_APPLICATIONS: SeedVacancyApplication[] = [
  {
    id: "app_1",
    vacancyId: "vac_1",
    candidateId: "cand_1",
    stage: "INTERNAL_INTERVIEW",
    status: "ACTIVE",
    source: "Matching",
    notes: "Strong logistics + Java fit; client loop next week.",
  },
  {
    id: "app_2",
    vacancyId: "vac_1",
    candidateId: "cand_3",
    stage: "PRE_SCREEN",
    status: "ACTIVE",
    source: "Recruiter",
  },
  {
    id: "app_3",
    vacancyId: "vac_1",
    candidateId: "cand_14",
    stage: "NEW",
    status: "ACTIVE",
    source: "Direct",
    notes: "Intern pipeline — exploratory for junior track.",
  },
  {
    id: "app_4",
    vacancyId: "vac_4",
    candidateId: "cand_5",
    stage: "HIRED",
    status: "CLOSED",
    source: "Matching",
    notes: "Completed hire; moved to billing.",
  },
  {
    id: "app_5",
    vacancyId: "vac_4",
    candidateId: "cand_11",
    stage: "REJECTED",
    status: "CLOSED",
    source: "Referral",
    notes: "Insufficient healthcare data depth.",
  },
  {
    id: "app_6",
    vacancyId: "vac_6",
    candidateId: "cand_10",
    stage: "CLIENT_INTERVIEW",
    status: "ACTIVE",
    source: "Matching",
  },
  {
    id: "app_7",
    vacancyId: "vac_10",
    candidateId: "cand_6",
    stage: "OFFER",
    status: "ACTIVE",
    source: "Direct",
    notes: "Offer out; awaiting signature.",
  },
  {
    id: "app_8",
    vacancyId: "vac_10",
    candidateId: "cand_2",
    stage: "REJECTED",
    status: "CLOSED",
    source: "Matching",
  },
  {
    id: "app_9",
    vacancyId: "vac_3",
    candidateId: "cand_4",
    stage: "INTERNAL_INTERVIEW",
    status: "ACTIVE",
    source: "Recruiter",
  },
  {
    id: "app_10",
    vacancyId: "vac_13",
    candidateId: "cand_1",
    stage: "NEW",
    status: "ACTIVE",
    source: "Referral",
  },
  {
    id: "app_11",
    vacancyId: "vac_2",
    candidateId: "cand_11",
    stage: "PRE_SCREEN",
    status: "ACTIVE",
    source: "Direct",
  },
  {
    id: "app_12",
    vacancyId: "vac_7",
    candidateId: "cand_3",
    stage: "REJECTED",
    status: "CLOSED",
    source: "Matching",
    notes: "Role filled internally at client.",
  },
  {
    id: "app_13",
    vacancyId: "vac_11",
    candidateId: "cand_9",
    stage: "PRE_SCREEN",
    status: "ACTIVE",
    source: "Recruiter",
  },
  {
    id: "app_14",
    vacancyId: "vac_14",
    candidateId: "cand_8",
    stage: "WITHDRAWN",
    status: "CLOSED",
    source: "Direct",
    notes: "Candidate withdrew — not pursuing residency work.",
  },
  {
    id: "app_15",
    vacancyId: "vac_4",
    candidateId: "cand_9",
    stage: "CLIENT_INTERVIEW",
    status: "ACTIVE",
    source: "Matching",
    notes: "PM exploring stretch into data engineer track.",
  },
];
