"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { canManageApplications } from "@/lib/auth/application-access";
import { prisma } from "@/lib/prisma";

import { parseApplicationUpdateForm } from "./validation";

export type ApplicationActionState =
  | { ok: true }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

async function ensureCanManage(): Promise<
  { ok: true } | { ok: false; state: ApplicationActionState }
> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, state: { ok: false, message: "You must be signed in." } };
  }
  if (!canManageApplications(session.user.role)) {
    return {
      ok: false,
      state: {
        ok: false,
        message: "You do not have permission to update applications.",
      },
    };
  }
  return { ok: true };
}

export async function updateVacancyApplication(
  _prev: ApplicationActionState | null,
  formData: FormData,
): Promise<ApplicationActionState> {
  const gate = await ensureCanManage();
  if (!gate.ok) return gate.state;

  const parsed = parseApplicationUpdateForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };

  const { data } = parsed;
  const existing = await prisma.vacancyApplication.findUnique({
    where: { id: data.applicationId },
    select: { id: true, vacancyId: true, candidateId: true },
  });
  if (!existing) {
    return { ok: false, message: "Application was not found." };
  }

  try {
    await prisma.vacancyApplication.update({
      where: { id: data.applicationId },
      data: {
        stage: data.stage,
        status: data.status,
        source: data.source,
        notes: data.notes,
      },
    });
  } catch {
    return { ok: false, message: "Could not update the application. Try again." };
  }

  revalidatePath(`/vacancies/${existing.vacancyId}`);
  revalidatePath(`/candidates/${existing.candidateId}`);
  return { ok: true };
}

