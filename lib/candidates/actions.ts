"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { canManageCandidates } from "@/lib/auth/candidate-access";
import type { VacancyStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { syncAllCandidateVacancyMatches } from "@/lib/matching/sync";

import {
  getCandidateEditData,
  type CandidateEditDataJson,
} from "./queries";
import { saveCandidateCvFile } from "./cv-file-save";
import {
  computeAvailabilityForPersistence,
  parseCandidateForm,
  type CandidateFormParsed,
} from "./validation";

/** Never throws; logs on failure so candidate save still succeeds. */
async function tryAttachCvFromForm(candidateId: string, formData: FormData): Promise<void> {
  const raw = formData.get("cvFile");
  if (!(raw instanceof File) || raw.size === 0) return;
  const result = await saveCandidateCvFile(candidateId, raw);
  if (!result.ok) {
    console.error("[candidate] CV attach after save failed:", result.message);
  }
}

const OPEN_PIPELINE_VACANCY_STATUSES: VacancyStatus[] = [
  "OPEN",
  "SOURCING",
  "INTERVIEWING",
  "ON_HOLD",
];

async function validatePipelineVacancy(
  data: CandidateFormParsed,
): Promise<{ ok: true } | { ok: false; fieldErrors: Record<string, string> }> {
  if (data.pipelineIntent !== "OPEN_VACANCY") return { ok: true };
  const vid = data.pipelineVacancyId?.trim();
  if (!vid) {
    return {
      ok: false,
      fieldErrors: { pipelineVacancyId: "Selecciona una vacante abierta." },
    };
  }
  const v = await prisma.vacancy.findUnique({
    where: { id: vid },
    select: { id: true, status: true },
  });
  if (!v || !OPEN_PIPELINE_VACANCY_STATUSES.includes(v.status)) {
    return {
      ok: false,
      fieldErrors: {
        pipelineVacancyId: "La vacante no existe o ya no está abierta.",
      },
    };
  }
  return { ok: true };
}

function scheduleMatchResync() {
  void syncAllCandidateVacancyMatches().catch((err) => {
    console.error("[matching] sync after candidate mutation failed", err);
  });
}

export type CandidateActionState =
  | { ok: true; candidateId?: string }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

/**
 * Loads edit payload for list row actions. Auth-gated; returns JSON-safe dates.
 * Does not throw — callers show empty state on failure.
 */
export async function loadCandidateEditDataForListAction(
  candidateId: string,
): Promise<
  { ok: true; data: CandidateEditDataJson } | { ok: false; message?: string }
> {
  const gate = await ensureCanManage();
  if (!gate.ok) {
    return { ok: false, message: "Sin permiso para editar candidatos." };
  }
  const id = candidateId.trim();
  if (!id) return { ok: false, message: "Identificador no válido." };
  try {
    const data = await getCandidateEditData(id);
    if (!data) return { ok: false, message: "Candidato no encontrado." };
    return {
      ok: true,
      data: {
        ...data,
        availabilityStartDate: data.availabilityStartDate?.toISOString() ?? null,
        cvUploadedAt: data.cvUploadedAt?.toISOString() ?? null,
      },
    };
  } catch (err) {
    console.error("[loadCandidateEditDataForListAction]", err);
    return { ok: false, message: "No se pudo cargar la ficha." };
  }
}

async function ensureCanManage(): Promise<
  { ok: true } | { ok: false; state: CandidateActionState }
> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, state: { ok: false, message: "You must be signed in." } };
  }
  if (!canManageCandidates(session.user.role)) {
    return {
      ok: false,
      state: { ok: false, message: "You do not have permission to change candidates." },
    };
  }
  return { ok: true };
}

export async function createCandidate(
  _prev: CandidateActionState | null,
  formData: FormData,
): Promise<CandidateActionState> {
  const gate = await ensureCanManage();
  if (!gate.ok) return gate.state;

  const parsed = parseCandidateForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };
  const { data } = parsed;

  const avail = computeAvailabilityForPersistence(
    data.availabilityMode,
    data.availabilitySpecificDate,
  );
  if (!avail.ok) return { ok: false, fieldErrors: avail.fieldErrors };

  const pipelineOk = await validatePipelineVacancy(data);
  if (!pipelineOk.ok) return { ok: false, fieldErrors: pipelineOk.fieldErrors };

  if (data.structuredSkills.length > 0) {
    const skillIds = data.structuredSkills.map((s) => s.skillId);
    const skills = await prisma.skill.findMany({
      where: { id: { in: skillIds } },
      select: { id: true, name: true },
    });
    if (skills.length !== skillIds.length) {
      return { ok: false, fieldErrors: { structuredSkills: "One or more skills were not found." } };
    }
    // Keep legacy `skills` string aligned (temporary transition field).
    const legacy = skills.map((s) => s.name).sort((a, b) => a.localeCompare(b)).join(", ");
    try {
      const created = await prisma.$transaction(async (tx) => {
        const candidate = await tx.candidate.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            role: data.role,
            seniority: data.seniority,
            availabilityStatus: avail.availabilityStatus,
            availabilityStartDate: avail.availabilityStartDate,
            pipelineIntent: data.pipelineIntent,
            pipelineVacancyId: data.pipelineVacancyId,
            currentCompany: data.currentCompany,
            notes: data.notes,
            skills: legacy,
            locationCity: data.locationCity,
            workModality: data.workModality,
            cvLanguagesText: data.cvLanguagesText,
            cvCertificationsText: data.cvCertificationsText,
            cvIndustriesText: data.cvIndustriesText,
            cvEducationText: data.cvEducationText,
            cvSoftSkillsText: data.cvSoftSkillsText,
          },
          select: { id: true },
        });
        await tx.candidateSkill.createMany({
          data: data.structuredSkills.map((s) => ({
            candidateId: candidate.id,
            skillId: s.skillId,
            yearsExperience: s.yearsExperience,
            level: s.level,
          })),
        });
        return candidate;
      });
      await tryAttachCvFromForm(created.id, formData);
      revalidatePath("/candidates");
      revalidatePath(`/candidates/${created.id}`);
      revalidatePath("/matching");
      scheduleMatchResync();
      return { ok: true, candidateId: created.id };
    } catch {
      return { ok: false, message: "Could not create the candidate. Try again." };
    }
  }

  try {
    const created = await prisma.candidate.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        seniority: data.seniority,
        availabilityStatus: avail.availabilityStatus,
        availabilityStartDate: avail.availabilityStartDate,
        pipelineIntent: data.pipelineIntent,
        pipelineVacancyId: data.pipelineVacancyId,
        currentCompany: data.currentCompany,
        notes: data.notes,
        skills: "",
        locationCity: data.locationCity,
        workModality: data.workModality,
        cvLanguagesText: data.cvLanguagesText,
        cvCertificationsText: data.cvCertificationsText,
        cvIndustriesText: data.cvIndustriesText,
        cvEducationText: data.cvEducationText,
        cvSoftSkillsText: data.cvSoftSkillsText,
      },
      select: { id: true },
    });
    await tryAttachCvFromForm(created.id, formData);
    revalidatePath("/candidates");
    revalidatePath(`/candidates/${created.id}`);
    revalidatePath("/matching");
    scheduleMatchResync();
    return { ok: true, candidateId: created.id };
  } catch {
    return { ok: false, message: "Could not create the candidate. Try again." };
  }
}

export async function updateCandidate(
  _prev: CandidateActionState | null,
  formData: FormData,
): Promise<CandidateActionState> {
  const gate = await ensureCanManage();
  if (!gate.ok) return gate.state;

  const idRaw = formData.get("candidateId");
  const candidateId = typeof idRaw === "string" ? idRaw.trim() : "";
  if (!candidateId) return { ok: false, message: "Missing candidate id." };

  const exists = await prisma.candidate.findUnique({
    where: { id: candidateId },
    select: { id: true },
  });
  if (!exists) return { ok: false, message: "Candidate was not found." };

  const parsed = parseCandidateForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };
  const { data } = parsed;

  const avail = computeAvailabilityForPersistence(
    data.availabilityMode,
    data.availabilitySpecificDate,
  );
  if (!avail.ok) return { ok: false, fieldErrors: avail.fieldErrors };

  const pipelineOk = await validatePipelineVacancy(data);
  if (!pipelineOk.ok) return { ok: false, fieldErrors: pipelineOk.fieldErrors };

  // Validate skills and build legacy string.
  let legacySkills = "";
  if (data.structuredSkills.length > 0) {
    const skillIds = data.structuredSkills.map((s) => s.skillId);
    const skills = await prisma.skill.findMany({
      where: { id: { in: skillIds } },
      select: { id: true, name: true },
    });
    if (skills.length !== skillIds.length) {
      return { ok: false, fieldErrors: { structuredSkills: "One or more skills were not found." } };
    }
    legacySkills = skills.map((s) => s.name).sort((a, b) => a.localeCompare(b)).join(", ");
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.candidate.update({
        where: { id: candidateId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          role: data.role,
          seniority: data.seniority,
          availabilityStatus: avail.availabilityStatus,
          availabilityStartDate: avail.availabilityStartDate,
          pipelineIntent: data.pipelineIntent,
          pipelineVacancyId: data.pipelineVacancyId,
          currentCompany: data.currentCompany,
          notes: data.notes,
          skills: legacySkills,
          locationCity: data.locationCity,
          workModality: data.workModality,
          cvLanguagesText: data.cvLanguagesText,
          cvCertificationsText: data.cvCertificationsText,
          cvIndustriesText: data.cvIndustriesText,
          cvEducationText: data.cvEducationText,
          cvSoftSkillsText: data.cvSoftSkillsText,
        },
      });

      await tx.candidateSkill.deleteMany({ where: { candidateId } });
      if (data.structuredSkills.length > 0) {
        await tx.candidateSkill.createMany({
          data: data.structuredSkills.map((s) => ({
            candidateId,
            skillId: s.skillId,
            yearsExperience: s.yearsExperience,
            level: s.level,
          })),
        });
      }
    });

    await tryAttachCvFromForm(candidateId, formData);
    revalidatePath("/candidates");
    revalidatePath(`/candidates/${candidateId}`);
    revalidatePath("/matching");
    scheduleMatchResync();
    return { ok: true, candidateId };
  } catch {
    return { ok: false, message: "Could not update the candidate. Try again." };
  }
}

