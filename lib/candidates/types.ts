import type {
  CandidatePipelineIntent,
  CandidateRecruitmentStage,
} from "@/generated/prisma/enums";
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
  /** Stored recruiting context (safe default NO_VACANCY if data is missing). */
  pipelineIntent: CandidatePipelineIntent;
  /** Short label for list/detail (e.g. Pool de talento). */
  pipelineContextLabel: string;
  /** Compact vacancy line for tables; "—" when not targeting a vacancy row. */
  pipelineVacancyLine: string;
  /** Longer neutral copy for detail (stale FK, open intent without id, etc.). */
  recruitingVacancyDetailLine: string;
  /** FK when set; null if not linked or cleared after vacancy removal. */
  pipelineVacancyId: string | null;
  recruitmentStage: CandidateRecruitmentStage;
  recruitmentStageLabel: string;
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
  /** "all" | CandidatePipelineIntent */
  pipelineIntent: string;
  /** "all" | "yes" (has pipelineVacancyId) | "no" */
  linkedVacancy: string;
};
