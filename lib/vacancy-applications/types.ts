export type VacancyApplicationStageUi =
  | "New"
  | "Pre-screen"
  | "Internal interview"
  | "Client interview"
  | "Offer"
  | "Hired"
  | "Rejected"
  | "Withdrawn";

export type VacancyApplicationStatusUi = "Active" | "Closed";

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
