import type {
  CandidateAvailabilityStatus as PrismaAvailability,
  VacancySeniority as PrismaSeniority,
} from "@/generated/prisma/enums";
import type { VacancySeniorityUi } from "@/lib/vacancies/types";

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
  currentCompany: string | null;
  notes: string | null;
  updatedAt: Date;
};

export function mapCandidateToUi(row: CandidateRow): CandidateUi {
  const displayName = `${row.firstName} ${row.lastName}`.trim();
  return {
    id: row.id,
    displayName,
    role: row.role,
    skills: row.skills,
    skillTags: parseSkillTags(row.skills),
    seniority: prismaSeniorityToUi[row.seniority],
    availabilityStatus: prismaAvailabilityToUi[row.availabilityStatus],
    email: dash(row.email),
    phone: dash(row.phone),
    currentCompany: dash(row.currentCompany),
    notes: dash(row.notes),
    updatedAtLabel: formatUpdatedAt(row.updatedAt),
  };
}
