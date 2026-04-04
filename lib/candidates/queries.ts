import type { CandidatePipelineIntent } from "@/generated/prisma/enums";

import { prisma } from "@/lib/prisma";

import { mapCandidateToUi, type CandidateRow } from "./mappers";
import type { CandidateUi } from "./types";
import type { CandidateSkillDraft } from "./validation";

export async function listCandidatesForUi(): Promise<CandidateUi[]> {
  try {
    const rows = await prisma.candidate.findMany({
      orderBy: [{ updatedAt: "desc" }, { lastName: "asc" }, { firstName: "asc" }],
      include: {
        pipelineVacancy: { select: { title: true } },
      },
    });
    return rows.map((row) => mapCandidateToUi(row as unknown as CandidateRow));
  } catch (err) {
    console.error("[listCandidatesForUi] failed", err);
    return [];
  }
}

export type CandidateCvFileInfo = {
  cvFileName: string;
  cvUploadedAt: Date;
} | null;

export async function getCandidateByIdForUi(
  id: string,
): Promise<CandidateUi | null> {
  const row = await prisma.candidate.findUnique({
    where: { id },
    include: {
      pipelineVacancy: { select: { title: true } },
    },
  });
  return row ? mapCandidateToUi(row as unknown as CandidateRow) : null;
}

export async function getCandidateCvFileInfo(
  id: string,
): Promise<CandidateCvFileInfo> {
  const row = await prisma.candidate.findUnique({
    where: { id },
    select: { cvFileName: true, cvUploadedAt: true },
  });
  if (!row?.cvFileName || !row.cvUploadedAt) return null;
  return { cvFileName: row.cvFileName, cvUploadedAt: row.cvUploadedAt };
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
  availabilityStartDate: Date | null;
  pipelineIntentValue: CandidatePipelineIntent;
  pipelineVacancyId: string | null;
  currentCompany: string | null;
  notes: string | null;
  structuredSkills: CandidateSkillDraft[];
  locationCity: string | null;
  workModality: string | null;
  cvLanguagesText: string | null;
  cvCertificationsText: string | null;
  cvIndustriesText: string | null;
  cvEducationText: string | null;
  cvSoftSkillsText: string | null;
  cvFileName: string | null;
  cvUploadedAt: Date | null;
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
      availabilityStartDate: true,
      pipelineIntent: true,
      pipelineVacancyId: true,
      currentCompany: true,
      notes: true,
      locationCity: true,
      workModality: true,
      cvLanguagesText: true,
      cvCertificationsText: true,
      cvIndustriesText: true,
      cvEducationText: true,
      cvSoftSkillsText: true,
      cvFileName: true,
      cvUploadedAt: true,
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
    availabilityStartDate: row.availabilityStartDate,
    pipelineIntentValue: row.pipelineIntent as CandidatePipelineIntent,
    pipelineVacancyId: row.pipelineVacancyId,
    currentCompany: row.currentCompany,
    notes: row.notes,
    structuredSkills: row.structuredSkills.map((s) => ({
      skillId: s.skillId,
      yearsExperience: s.yearsExperience,
      level: s.level?.trim() || null,
    })),
    locationCity: row.locationCity,
    workModality: row.workModality,
    cvLanguagesText: row.cvLanguagesText,
    cvCertificationsText: row.cvCertificationsText,
    cvIndustriesText: row.cvIndustriesText,
    cvEducationText: row.cvEducationText,
    cvSoftSkillsText: row.cvSoftSkillsText,
    cvFileName: row.cvFileName,
    cvUploadedAt: row.cvUploadedAt,
  };
}
