import type {
  CandidateAvailabilityStatus as PrismaAvailability,
  CandidatePipelineIntent,
  VacancySeniority as PrismaSeniority,
} from "@/generated/prisma/enums";
import type { VacancySeniorityUi } from "@/lib/vacancies/types";

import { CANDIDATE_PIPELINE_CONTEXT_LABELS } from "./constants";
import type { CandidateAvailabilityUi, CandidateUi } from "./types";

const prismaSeniorityToUi: Record<PrismaSeniority, VacancySeniorityUi> = {
  INTERN: "Interno",
  JUNIOR: "Junior",
  MID: "Mid",
  SENIOR: "Senior",
  LEAD: "Lead",
  PRINCIPAL: "Principal",
};

const prismaAvailabilityToUi: Record<
  PrismaAvailability,
  CandidateAvailabilityUi
> = {
  AVAILABLE: "Disponible",
  IN_PROCESS: "En proceso",
  ASSIGNED: "Asignado",
  NOT_AVAILABLE: "No disponible",
};

export function parseSkillTags(skills: string): string[] {
  return skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatUpdatedAt(d: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function dash(s: string | null | undefined) {
  const t = s?.trim();
  return t ? t : "—";
}

function normalizePipelineIntent(v: unknown): CandidatePipelineIntent {
  if (v === "OPEN_VACANCY" || v === "NO_VACANCY" || v === "TALENT_POOL") {
    return v;
  }
  return "NO_VACANCY";
}

/** List/table: vacancy column when intent is open role targeting. */
export function buildPipelineVacancyLine(
  intent: CandidatePipelineIntent,
  vacancyId: string | null | undefined,
  vacancyTitle: string | null | undefined,
): string {
  if (intent !== "OPEN_VACANCY") return "—";
  const title = vacancyTitle?.trim();
  if (vacancyId && title) return title;
  if (vacancyId && !title) return "Vacante no disponible";
  return "Sin vacante vinculada";
}

/** Detail copy when not tied to a concrete vacancy row. */
export function buildPipelineVacancyDetailLine(
  intent: CandidatePipelineIntent,
  vacancyId: string | null | undefined,
  vacancyTitle: string | null | undefined,
): string {
  if (intent !== "OPEN_VACANCY") {
    return "No aplica (sin vacante vinculada)";
  }
  const title = vacancyTitle?.trim();
  if (vacancyId && title) return title;
  if (vacancyId && !title) {
    return "Vacante ya no disponible (ID guardado; revisa en edición)";
  }
  return "Sin vacante vinculada (contexto: vacante abierta)";
}

function startOfUTCDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function formatAvailabilityBadgeLabel(
  status: PrismaAvailability,
  start: Date | null,
  now: Date = new Date(),
): string {
  if (status === "NOT_AVAILABLE") return "No disponible";
  if (status === "ASSIGNED") return "Asignado";
  if (status === "IN_PROCESS") return "En proceso";
  if (status !== "AVAILABLE") return prismaAvailabilityToUi[status];
  if (!start) return "Disponible inmediata";
  const nowDay = startOfUTCDay(now);
  const startDay = startOfUTCDay(start);
  const diffDays = Math.round(
    (startDay.getTime() - nowDay.getTime()) / 86400000,
  );
  if (diffDays >= 12 && diffDays <= 16) return "Disponible en 2 semanas";
  return `Disponible desde ${new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(start)}`;
}

export type CandidateRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string;
  seniority: PrismaSeniority;
  skills: string;
  availabilityStatus: PrismaAvailability;
  availabilityStartDate: Date | null;
  currentCompany: string | null;
  notes: string | null;
  updatedAt: Date;
  pipelineIntent: CandidatePipelineIntent;
  pipelineVacancyId: string | null;
  pipelineVacancy?: { title: string } | null;
};

export function mapCandidateToUi(row: CandidateRow): CandidateUi {
  const displayName = `${row.firstName} ${row.lastName}`.trim();
  const pipelineIntent = normalizePipelineIntent(row.pipelineIntent);
  const vacancyTitle = row.pipelineVacancy?.title ?? null;
  return {
    id: row.id,
    displayName,
    role: row.role,
    skills: row.skills,
    skillTags: parseSkillTags(row.skills),
    seniority: prismaSeniorityToUi[row.seniority],
    availabilityStatus: prismaAvailabilityToUi[row.availabilityStatus],
    availabilityBadgeLabel: formatAvailabilityBadgeLabel(
      row.availabilityStatus,
      row.availabilityStartDate,
    ),
    pipelineIntent,
    pipelineContextLabel: CANDIDATE_PIPELINE_CONTEXT_LABELS[pipelineIntent],
    pipelineVacancyLine: buildPipelineVacancyLine(
      pipelineIntent,
      row.pipelineVacancyId,
      vacancyTitle,
    ),
    recruitingVacancyDetailLine: buildPipelineVacancyDetailLine(
      pipelineIntent,
      row.pipelineVacancyId,
      vacancyTitle,
    ),
    pipelineVacancyId: row.pipelineVacancyId ?? null,
    email: dash(row.email),
    phone: dash(row.phone),
    currentCompany: dash(row.currentCompany),
    notes: dash(row.notes),
    updatedAtLabel: formatUpdatedAt(row.updatedAt),
  };
}
