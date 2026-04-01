import { prisma } from "@/lib/prisma";

import { mapCandidateToUi, type CandidateRow } from "./mappers";
import type { CandidateUi } from "./types";
import type { CandidateSkillDraft } from "./validation";

export async function listCandidatesForUi(): Promise<CandidateUi[]> {
  const rows = await prisma.candidate.findMany({
    orderBy: [{ updatedAt: "desc" }, { lastName: "asc" }, { firstName: "asc" }],
  });
  return rows.map((row) => mapCandidateToUi(row as CandidateRow));
}

export async function getCandidateByIdForUi(
  id: string,
): Promise<CandidateUi | null> {
  const row = await prisma.candidate.findUnique({
    where: { id },
  });
  return row ? mapCandidateToUi(row as CandidateRow) : null;
}

export type CandidateEditData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string;
  seniorityValue: CandidateRow["seniority"];
  availabilityStatusValue: CandidateRow["availabilityStatus"];
  currentCompany: string | null;
  notes: string | null;
  structuredSkills: CandidateSkillDraft[];
};

export async function getCandidateEditData(
  id: string,
): Promise<CandidateEditData | null> {
  const row = await prisma.candidate.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      seniority: true,
      availabilityStatus: true,
      currentCompany: true,
      notes: true,
      structuredSkills: {
        select: { skillId: true, yearsExperience: true, level: true },
        orderBy: [{ updatedAt: "desc" }],
      },
    },
  });
  if (!row) return null;

  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    role: row.role,
    seniorityValue: row.seniority as CandidateEditData["seniorityValue"],
    availabilityStatusValue:
      row.availabilityStatus as CandidateEditData["availabilityStatusValue"],
    currentCompany: row.currentCompany,
    notes: row.notes,
    structuredSkills: row.structuredSkills.map((s) => ({
      skillId: s.skillId,
      yearsExperience: s.yearsExperience,
      level: s.level?.trim() || null,
    })),
  };
}
