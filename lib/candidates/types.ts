import type { VacancySeniorityUi } from "@/lib/vacancies/types";

export type CandidateAvailabilityUi =
  | "Disponible"
  | "En proceso"
  | "Asignado"
  | "No disponible";

export type CandidateUi = {
  id: string;
  displayName: string;
  role: string;
  skills: string;
  skillTags: string[];
  seniority: VacancySeniorityUi;
  /** Coarse bucket for filters / badge tone (legacy four states). */
  availabilityStatus: CandidateAvailabilityUi;
  /** Human-readable availability line (immediate, date, two weeks, etc.). */
  availabilityBadgeLabel: string;
  email: string;
  phone: string;
  currentCompany: string;
  notes: string;
  updatedAtLabel: string;
};

export type CandidateFilterState = {
  query: string;
  seniority: string;
  availabilityStatus: string;
};
