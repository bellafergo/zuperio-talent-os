"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { canManagePlacements } from "@/lib/auth/placement-access";
import { prisma } from "@/lib/prisma";

import { parsePlacementForm } from "./validation";

export type PlacementActionState =
  | { ok: true; placementId?: string }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

async function ensureCanManage(): Promise<
  { ok: true } | { ok: false; state: PlacementActionState }
> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, state: { ok: false, message: "You must be signed in." } };
  }
  if (!canManagePlacements(session.user.role)) {
    return {
      ok: false,
      state: { ok: false, message: "You do not have permission to change placements." },
    };
  }
  return { ok: true };
}

export async function createPlacement(
  _prev: PlacementActionState | null,
  formData: FormData,
): Promise<PlacementActionState> {
  const gate = await ensureCanManage();
  if (!gate.ok) return gate.state;

  const parsed = parsePlacementForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };

  const { data } = parsed;

  const [candidate, vacancy, company] = await Promise.all([
    prisma.candidate.findUnique({ where: { id: data.candidateId }, select: { id: true } }),
    prisma.vacancy.findUnique({
      where: { id: data.vacancyId },
      select: { id: true, companyId: true },
    }),
    prisma.company.findUnique({ where: { id: data.companyId }, select: { id: true } }),
  ]);

  if (!candidate) return { ok: false, fieldErrors: { candidateId: "Candidate not found." } };
  if (!vacancy) return { ok: false, fieldErrors: { vacancyId: "Vacancy not found." } };
  if (!company) return { ok: false, fieldErrors: { companyId: "Company not found." } };
  if (vacancy.companyId !== data.companyId) {
    return {
      ok: false,
      fieldErrors: { companyId: "Company must match the vacancy’s company." },
    };
  }

  try {
    const created = await prisma.placement.create({
      data: {
        candidateId: data.candidateId,
        vacancyId: data.vacancyId,
        companyId: data.companyId,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        rateClient: data.rateClient,
        rateCandidate: data.rateCandidate,
      },
      select: { id: true },
    });

    revalidatePath("/active-employees");
    revalidatePath(`/candidates/${data.candidateId}`);
    revalidatePath(`/companies/${data.companyId}`);
    revalidatePath(`/vacancies/${data.vacancyId}`);
    return { ok: true, placementId: created.id };
  } catch {
    return { ok: false, message: "Could not create the placement. Try again." };
  }
}

export async function updatePlacement(
  _prev: PlacementActionState | null,
  formData: FormData,
): Promise<PlacementActionState> {
  const gate = await ensureCanManage();
  if (!gate.ok) return gate.state;

  const idRaw = formData.get("placementId");
  const placementId = typeof idRaw === "string" ? idRaw.trim() : "";
  if (!placementId) return { ok: false, message: "Missing placement id." };

  const existing = await prisma.placement.findUnique({
    where: { id: placementId },
    select: { id: true, candidateId: true, vacancyId: true, companyId: true },
  });
  if (!existing) return { ok: false, message: "Placement was not found." };

  const parsed = parsePlacementForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };
  const { data } = parsed;

  const [candidate, vacancy, company] = await Promise.all([
    prisma.candidate.findUnique({ where: { id: data.candidateId }, select: { id: true } }),
    prisma.vacancy.findUnique({
      where: { id: data.vacancyId },
      select: { id: true, companyId: true },
    }),
    prisma.company.findUnique({ where: { id: data.companyId }, select: { id: true } }),
  ]);

  if (!candidate) return { ok: false, fieldErrors: { candidateId: "Candidate not found." } };
  if (!vacancy) return { ok: false, fieldErrors: { vacancyId: "Vacancy not found." } };
  if (!company) return { ok: false, fieldErrors: { companyId: "Company not found." } };
  if (vacancy.companyId !== data.companyId) {
    return {
      ok: false,
      fieldErrors: { companyId: "Company must match the vacancy’s company." },
    };
  }

  try {
    await prisma.placement.update({
      where: { id: placementId },
      data: {
        candidateId: data.candidateId,
        vacancyId: data.vacancyId,
        companyId: data.companyId,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        rateClient: data.rateClient,
        rateCandidate: data.rateCandidate,
      },
    });

    // Revalidate both old and new pages in case IDs changed.
    const companyIds = new Set([existing.companyId, data.companyId]);
    const candidateIds = new Set([existing.candidateId, data.candidateId]);
    const vacancyIds = new Set([existing.vacancyId, data.vacancyId]);

    revalidatePath("/active-employees");
    for (const cid of candidateIds) revalidatePath(`/candidates/${cid}`);
    for (const coid of companyIds) revalidatePath(`/companies/${coid}`);
    for (const vid of vacancyIds) revalidatePath(`/vacancies/${vid}`);
    return { ok: true, placementId };
  } catch {
    return { ok: false, message: "Could not update the placement. Try again." };
  }
}

