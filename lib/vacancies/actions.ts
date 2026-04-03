"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { canManageVacancies } from "@/lib/auth/vacancy-access";
import { prisma } from "@/lib/prisma";
import { syncAllCandidateVacancyMatches } from "@/lib/matching/sync";

import { parseVacancyForm } from "./validation";

function scheduleMatchResync() {
  void syncAllCandidateVacancyMatches().catch((err) => {
    console.error("[matching] sync after vacancy mutation failed", err);
  });
}

export type VacancyActionState =
  | { ok: true; vacancyId?: string }
  | {
      ok: false;
      message?: string;
      fieldErrors?: Record<string, string>;
    };

async function ensureCanManage(): Promise<
  { ok: true } | { ok: false; state: VacancyActionState }
> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, state: { ok: false, message: "You must be signed in." } };
  }
  if (!canManageVacancies(session.user.role)) {
    return {
      ok: false,
      state: {
        ok: false,
        message: "You do not have permission to change vacancies.",
      },
    };
  }
  return { ok: true };
}

export async function createVacancy(
  _prev: VacancyActionState | null,
  formData: FormData,
): Promise<VacancyActionState> {
  const gate = await ensureCanManage();
  if (!gate.ok) return gate.state;

  const parsed = parseVacancyForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };

  const { data } = parsed;

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: data.opportunityId },
    select: { id: true },
  });
  if (!opportunity) {
    return {
      ok: false,
      fieldErrors: { opportunityId: "Selected opportunity was not found." },
    };
  }

  if (data.requirements.length > 0) {
    const skillIds = data.requirements.map((r) => r.skillId);
    const skills = await prisma.skill.findMany({
      where: { id: { in: skillIds } },
      select: { id: true },
    });
    if (skills.length !== skillIds.length) {
      return {
        ok: false,
        fieldErrors: { requirements: "One or more skills were not found." },
      };
    }
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const vacancy = await tx.vacancy.create({
        data: {
          title: data.title,
          opportunityId: data.opportunityId,
          seniority: data.seniority,
          status: data.status,
          targetRate: data.targetRate,
          currency: data.currency ?? undefined,
          roleSummary: data.roleSummary,
        },
        select: { id: true },
      });

      if (data.requirements.length > 0) {
        await tx.vacancyRequirement.createMany({
          data: data.requirements.map((r) => ({
            vacancyId: vacancy.id,
            skillId: r.skillId,
            required: r.required,
            minimumYears: r.minimumYears,
          })),
        });
      }

      return vacancy;
    });

    revalidatePath("/vacancies");
    revalidatePath(`/vacancies/${created.id}`);
    revalidatePath("/matching");
    scheduleMatchResync();
    return { ok: true, vacancyId: created.id };
  } catch {
    return { ok: false, message: "Could not create the vacancy. Try again." };
  }
}

export async function updateVacancy(
  _prev: VacancyActionState | null,
  formData: FormData,
): Promise<VacancyActionState> {
  const gate = await ensureCanManage();
  if (!gate.ok) return gate.state;

  const idRaw = formData.get("vacancyId");
  const vacancyId = typeof idRaw === "string" ? idRaw.trim() : "";
  if (!vacancyId) return { ok: false, message: "Missing vacancy id." };

  const exists = await prisma.vacancy.findUnique({
    where: { id: vacancyId },
    select: { id: true },
  });
  if (!exists) return { ok: false, message: "Vacancy was not found." };

  const parsed = parseVacancyForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };

  const { data } = parsed;

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: data.opportunityId },
    select: { id: true },
  });
  if (!opportunity) {
    return {
      ok: false,
      fieldErrors: { opportunityId: "Selected opportunity was not found." },
    };
  }

  if (data.requirements.length > 0) {
    const skillIds = data.requirements.map((r) => r.skillId);
    const skills = await prisma.skill.findMany({
      where: { id: { in: skillIds } },
      select: { id: true },
    });
    if (skills.length !== skillIds.length) {
      return {
        ok: false,
        fieldErrors: { requirements: "One or more skills were not found." },
      };
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.vacancy.update({
        where: { id: vacancyId },
        data: {
          title: data.title,
          opportunityId: data.opportunityId,
          seniority: data.seniority,
          status: data.status,
          targetRate: data.targetRate,
          currency: data.currency ?? undefined,
          roleSummary: data.roleSummary,
        },
      });

      await tx.vacancyRequirement.deleteMany({ where: { vacancyId } });
      if (data.requirements.length > 0) {
        await tx.vacancyRequirement.createMany({
          data: data.requirements.map((r) => ({
            vacancyId,
            skillId: r.skillId,
            required: r.required,
            minimumYears: r.minimumYears,
          })),
        });
      }
    });

    revalidatePath("/vacancies");
    revalidatePath(`/vacancies/${vacancyId}`);
    revalidatePath("/matching");
    scheduleMatchResync();
    return { ok: true, vacancyId };
  } catch {
    return { ok: false, message: "Could not update the vacancy. Try again." };
  }
}

