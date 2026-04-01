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
  stage: VacancyApplicationStageUi;
  status: VacancyApplicationStatusUi;
  sourceLabel: string;
  source: string | null;
  notes: string | null;
};

export type CandidateApplicationRowUi = {
  applicationId: string;
  vacancyId: string;
  vacancyTitle: string;
  companyId: string;
  companyName: string;
  stage: VacancyApplicationStageUi;
  status: VacancyApplicationStatusUi;
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
};
