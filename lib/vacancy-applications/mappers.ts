import type {
  JobBoardProvider,
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
  NEW: "Nueva",
  PRE_SCREEN: "Pre-filtro",
  INTERNAL_INTERVIEW: "Entrevista interna",
  CLIENT_INTERVIEW: "Entrevista cliente",
  OFFER: "Oferta",
  HIRED: "Contratado",
  REJECTED: "Rechazado",
  WITHDRAWN: "Retirado",
};

const prismaStatusToUi: Record<PrismaStatus, VacancyApplicationStatusUi> = {
  ACTIVE: "Activa",
  CLOSED: "Cerrada",
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

const availabilityLabels: Record<string, string> = {
  AVAILABLE: "Disponible",
  IN_PROCESS: "En proceso",
  ASSIGNED: "Asignado",
  NOT_AVAILABLE: "No disponible",
};

function availabilityLabel(s: string | null | undefined): string {
  if (!s) return "—";
  return availabilityLabels[s] ?? s;
}

type CandidateMini = {
  id: string;
  firstName: string;
  lastName: string;
  role: string | null;
  seniority: string | null;
  availabilityStatus: string | null;
};

type VacancyMini = {
  id: string;
  title: string;
  company: { id: string; name: string };
};

export type ApplicationWithCandidate = {
  id: string;
  stage: PrismaStage;
  status: PrismaStatus;
  source: string | null;
  notes: string | null;
  candidate: CandidateMini;
  externalSource: { provider: JobBoardProvider } | null;
};

export type ApplicationWithVacancy = {
  id: string;
  stage: PrismaStage;
  status: PrismaStatus;
  vacancy: VacancyMini;
  externalSource: { provider: JobBoardProvider } | null;
};

export type ApplicationMatrixPrismaRow = {
  id: string;
  stage: PrismaStage;
  status: PrismaStatus;
  source: string | null;
  candidate: CandidateMini;
  vacancy: VacancyMini;
  externalSource: { provider: JobBoardProvider } | null;
};

function candidateName(c: CandidateMini): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

export function mapToVacancyPipelineRowUi(row: ApplicationWithCandidate): VacancyPipelineRowUi {
  return {
    applicationId: row.id,
    candidateId: row.candidate.id,
    candidateName: candidateName(row.candidate),
    candidateRole: row.candidate.role?.trim() || null,
    candidateSeniority: row.candidate.seniority?.trim() || null,
    availabilityLabel: availabilityLabel(row.candidate.availabilityStatus),
    stage: mapApplicationStageToUi(row.stage),
    status: mapApplicationStatusToUi(row.status),
    sourceLabel: sourceLabel(row.source),
    source: row.source?.trim() || null,
    notes: row.notes?.trim() || null,
    jobBoardProvider: row.externalSource?.provider ?? null,
  };
}

export function mapToCandidateApplicationRowUi(
  row: ApplicationWithVacancy,
): CandidateApplicationRowUi {
  return {
    applicationId: row.id,
    vacancyId: row.vacancy.id,
    vacancyTitle: row.vacancy.title,
    companyId: row.vacancy.company.id,
    companyName: row.vacancy.company.name,
    stage: mapApplicationStageToUi(row.stage),
    status: mapApplicationStatusToUi(row.status),
    jobBoardProvider: row.externalSource?.provider ?? null,
  };
}

export function mapToApplicationMatrixRowUi(row: ApplicationMatrixPrismaRow): ApplicationMatrixRowUi {
  return {
    applicationId: row.id,
    candidateId: row.candidate.id,
    candidateName: candidateName(row.candidate),
    vacancyId: row.vacancy.id,
    vacancyTitle: row.vacancy.title,
    companyName: row.vacancy.company.name,
    stage: mapApplicationStageToUi(row.stage),
    status: mapApplicationStatusToUi(row.status),
    sourceLabel: sourceLabel(row.source),
    jobBoardProvider: row.externalSource?.provider ?? null,
  };
}
