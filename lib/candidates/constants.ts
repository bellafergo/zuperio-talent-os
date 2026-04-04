import type {
  CandidatePipelineIntent,
  CandidateRecruitmentStage,
} from "@/generated/prisma/enums";

import type { CandidateAvailabilityUi } from "./types";

/** Reuse vacancy seniority labels for staff-augmentation alignment. */
export { VACANCY_SENIORITIES as CANDIDATE_SENIORITIES } from "@/lib/vacancies/constants";

export const CANDIDATE_AVAILABILITY: CandidateAvailabilityUi[] = [
  "Disponible",
  "En proceso",
  "Asignado",
  "No disponible",
];

/** Recruiting context labels (aligned with create/edit form). */
export const CANDIDATE_PIPELINE_CONTEXT_LABELS: Record<
  CandidatePipelineIntent,
  string
> = {
  OPEN_VACANCY: "Vacante abierta",
  NO_VACANCY: "Sin vacante definida",
  TALENT_POOL: "Pool de talento",
};

export const CANDIDATE_PIPELINE_INTENT_FILTER_OPTIONS: {
  value: CandidatePipelineIntent | "all";
  label: string;
}[] = [
  { value: "all", label: "Todos los contextos" },
  {
    value: "OPEN_VACANCY",
    label: CANDIDATE_PIPELINE_CONTEXT_LABELS.OPEN_VACANCY,
  },
  {
    value: "NO_VACANCY",
    label: CANDIDATE_PIPELINE_CONTEXT_LABELS.NO_VACANCY,
  },
  {
    value: "TALENT_POOL",
    label: CANDIDATE_PIPELINE_CONTEXT_LABELS.TALENT_POOL,
  },
];

export const CANDIDATE_LINKED_VACANCY_FILTER_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "yes", label: "Con vacante vinculada" },
  { value: "no", label: "Sin vacante vinculada" },
] as const;

/** Process stage labels (list, detail, forms). */
export const CANDIDATE_RECRUITMENT_STAGE_LABELS: Record<
  CandidateRecruitmentStage,
  string
> = {
  NUEVO: "Nuevo",
  CONTACTADO: "Contactado",
  ENTREVISTA: "En entrevista",
  PERFIL_ENVIADO: "Perfil enviado",
  NEGOCIACION: "En negociación",
  COLOCADO: "Colocado",
  DESCARTADO: "Descartado",
};

export const CANDIDATE_RECRUITMENT_STAGE_ORDER: CandidateRecruitmentStage[] = [
  "NUEVO",
  "CONTACTADO",
  "ENTREVISTA",
  "PERFIL_ENVIADO",
  "NEGOCIACION",
  "COLOCADO",
  "DESCARTADO",
];

/** Canonical work modality values for candidate intake (legacy free text still round-trips). */
export const CANDIDATE_WORK_MODALITY_OPTIONS = [
  "Híbrido",
  "Home office",
  "Presencial",
] as const;
