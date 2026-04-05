import type { JobBoardProvider } from "@/generated/prisma/enums";

export type VacancyApplicationStageUi =
  | "Nueva"
  | "Pre-filtro"
  | "Entrevista interna"
  | "Entrevista cliente"
  | "Oferta"
  | "Contratado"
  | "Rechazado"
  | "Retirado";

export type VacancyApplicationStatusUi = "Activa" | "Cerrada";

export type VacancyPipelineRowUi = {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateRole: string | null;
  candidateSeniority: string | null;
  availabilityLabel: string;
  stage: VacancyApplicationStageUi;
  status: VacancyApplicationStatusUi;
  sourceLabel: string;
  source: string | null;
  notes: string | null;
  jobBoardProvider: JobBoardProvider | null;
};

export type CandidateApplicationRowUi = {
  applicationId: string;
  vacancyId: string;
  vacancyTitle: string;
  companyId: string;
  companyName: string;
  stage: VacancyApplicationStageUi;
  status: VacancyApplicationStatusUi;
  jobBoardProvider: JobBoardProvider | null;
};

export type ApplicationMatrixRowUi = {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  vacancyId: string;
  vacancyTitle: string;
  companyName: string;
  stage: VacancyApplicationStageUi;
  status: VacancyApplicationStatusUi;
  sourceLabel: string;
  jobBoardProvider: JobBoardProvider | null;
};
