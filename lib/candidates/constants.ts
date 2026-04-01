import type { CandidateAvailabilityUi } from "./types";

/** Reuse vacancy seniority labels for staff-augmentation alignment. */
export { VACANCY_SENIORITIES as CANDIDATE_SENIORITIES } from "@/lib/vacancies/constants";

export const CANDIDATE_AVAILABILITY: CandidateAvailabilityUi[] = [
  "Disponible",
  "En proceso",
  "Asignado",
  "No disponible",
];
