"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { canManageCandidates } from "@/lib/auth/candidate-access";
import { prisma } from "@/lib/prisma";
import { syncAllCandidateVacancyMatches } from "@/lib/matching/sync";

import { parseCandidateForm } from "./validation";

function scheduleMatchResync() {
  void syncAllCandidateVacancyMatches().catch((err) => {
    console.error("[matching] sync after candidate mutation failed", err);
  });
}

export type CandidateActionState =
  | { ok: true; candidateId?: string }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

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
            availabilityStatus: data.availabilityStatus,
            currentCompany: data.currentCompany,
            notes: data.notes,
            skills: legacy,
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
        availabilityStatus: data.availabilityStatus,
        currentCompany: data.currentCompany,
        notes: data.notes,
        skills: "",
      },
      select: { id: true },
    });
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
          availabilityStatus: data.availabilityStatus,
          currentCompany: data.currentCompany,
          notes: data.notes,
          skills: legacySkills,
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

    revalidatePath("/candidates");
    revalidatePath(`/candidates/${candidateId}`);
    revalidatePath("/matching");
    scheduleMatchResync();
    return { ok: true, candidateId };
  } catch {
    return { ok: false, message: "Could not update the candidate. Try again." };
  }
}

