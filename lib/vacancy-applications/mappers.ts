import type {
  VacancyApplicationStage as PrismaStage,
  VacancyApplicationStatus as PrismaStatus,
} from "@/generated/prisma/enums";

import type {
  ApplicationMatrixRowUi,
  CandidateApplicationRowUi,
  VacancyApplicationStageUi,
  VacancyApplicationStatusUi,
  VacancyPipelineRowUi,
} from "./types";

const prismaStageToUi: Record<PrismaStage, VacancyApplicationStageUi> = {
  NEW: "New",
  PRE_SCREEN: "Pre-screen",
  INTERNAL_INTERVIEW: "Internal interview",
  CLIENT_INTERVIEW: "Client interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const prismaStatusToUi: Record<PrismaStatus, VacancyApplicationStatusUi> = {
  ACTIVE: "Active",
  CLOSED: "Closed",
};

export function mapApplicationStageToUi(s: PrismaStage): VacancyApplicationStageUi {
  return prismaStageToUi[s];
}

export function mapApplicationStatusToUi(s: PrismaStatus): VacancyApplicationStatusUi {
  return prismaStatusToUi[s];
}

function sourceLabel(s: string | null | undefined): string {
  const t = s?.trim();
  return t ? t : "—";
}

type CandidateMini = { id: string; firstName: string; lastName: string };

type VacancyMini = {
  id: string;
  title: string;
  opportunity: { company: { id: string; name: string } };
};

export type ApplicationWithCandidate = {
  id: string;
  stage: PrismaStage;
  status: PrismaStatus;
  source: string | null;
  notes: string | null;
  candidate: CandidateMini;
};

export type ApplicationWithVacancy = {
  id: string;
  stage: PrismaStage;
  status: PrismaStatus;
  vacancy: VacancyMini;
};

export type ApplicationMatrixPrismaRow = {
  id: string;
  stage: PrismaStage;
  status: PrismaStatus;
  source: string | null;
  candidate: CandidateMini;
  vacancy: VacancyMini;
};

function candidateName(c: CandidateMini): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

export function mapToVacancyPipelineRowUi(row: ApplicationWithCandidate): VacancyPipelineRowUi {
  return {
    applicationId: row.id,
    candidateId: row.candidate.id,
    candidateName: candidateName(row.candidate),
    stage: mapApplicationStageToUi(row.stage),
    status: mapApplicationStatusToUi(row.status),
    sourceLabel: sourceLabel(row.source),
    source: row.source?.trim() || null,
    notes: row.notes?.trim() || null,
  };
}

export function mapToCandidateApplicationRowUi(
  row: ApplicationWithVacancy,
): CandidateApplicationRowUi {
  return {
    applicationId: row.id,
    vacancyId: row.vacancy.id,
    vacancyTitle: row.vacancy.title,
    companyId: row.vacancy.opportunity.company.id,
    companyName: row.vacancy.opportunity.company.name,
    stage: mapApplicationStageToUi(row.stage),
    status: mapApplicationStatusToUi(row.status),
  };
}

export function mapToApplicationMatrixRowUi(row: ApplicationMatrixPrismaRow): ApplicationMatrixRowUi {
  return {
    applicationId: row.id,
    candidateId: row.candidate.id,
    candidateName: candidateName(row.candidate),
    vacancyId: row.vacancy.id,
    vacancyTitle: row.vacancy.title,
    companyName: row.vacancy.opportunity.company.name,
    stage: mapApplicationStageToUi(row.stage),
    status: mapApplicationStatusToUi(row.status),
    sourceLabel: sourceLabel(row.source),
  };
}
