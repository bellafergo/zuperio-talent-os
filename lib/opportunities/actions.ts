"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { canManageOpportunities } from "@/lib/auth/opportunity-access";
import { prisma } from "@/lib/prisma";

import { parseOpportunityForm } from "./validation";

export type OpportunityActionState =
  | { ok: true; opportunityId?: string }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

async function ensureCanManage(): Promise<
  { ok: true } | { ok: false; state: OpportunityActionState }
> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, state: { ok: false, message: "You must be signed in." } };
  }
  if (!canManageOpportunities(session.user.role)) {
    return {
      ok: false,
      state: {
        ok: false,
        message: "You do not have permission to change opportunities.",
      },
    };
  }
  return { ok: true };
}

export async function createOpportunity(
  _prev: OpportunityActionState | null,
  formData: FormData,
): Promise<OpportunityActionState> {
  const gate = await ensureCanManage();
  if (!gate.ok) return gate.state;

  const parsed = parseOpportunityForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };
  const { data } = parsed;

  const company = await prisma.company.findUnique({
    where: { id: data.companyId },
    select: { id: true },
  });
  if (!company) {
    return { ok: false, fieldErrors: { companyId: "Selected company was not found." } };
  }

  if (data.ownerId) {
    const owner = await prisma.user.findUnique({
      where: { id: data.ownerId },
      select: { id: true },
    });
    if (!owner) {
      return { ok: false, fieldErrors: { ownerId: "Selected owner was not found." } };
    }
  }

  try {
    const created = await prisma.opportunity.create({
      data: {
        title: data.title,
        companyId: data.companyId,
        ownerId: data.ownerId,
        stage: data.stage,
        value: data.value,
        currency: data.currency,
      },
      select: { id: true },
    });

    revalidatePath("/opportunities");
    revalidatePath(`/opportunities/${created.id}`);
    revalidatePath(`/companies/${data.companyId}`);
    return { ok: true, opportunityId: created.id };
  } catch {
    return { ok: false, message: "Could not create the opportunity. Try again." };
  }
}

export async function updateOpportunity(
  _prev: OpportunityActionState | null,
  formData: FormData,
): Promise<OpportunityActionState> {
  const gate = await ensureCanManage();
  if (!gate.ok) return gate.state;

  const idRaw = formData.get("opportunityId");
  const opportunityId = typeof idRaw === "string" ? idRaw.trim() : "";
  if (!opportunityId) return { ok: false, message: "Missing opportunity id." };

  const existing = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    select: { id: true, companyId: true },
  });
  if (!existing) return { ok: false, message: "Opportunity was not found." };

  const parsed = parseOpportunityForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };
  const { data } = parsed;

  const company = await prisma.company.findUnique({
    where: { id: data.companyId },
    select: { id: true },
  });
  if (!company) {
    return { ok: false, fieldErrors: { companyId: "Selected company was not found." } };
  }

  if (data.ownerId) {
    const owner = await prisma.user.findUnique({
      where: { id: data.ownerId },
      select: { id: true },
    });
    if (!owner) {
      return { ok: false, fieldErrors: { ownerId: "Selected owner was not found." } };
    }
  }

  try {
    await prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        title: data.title,
        companyId: data.companyId,
        ownerId: data.ownerId,
        stage: data.stage,
        value: data.value,
        currency: data.currency,
      },
    });

    revalidatePath("/opportunities");
    revalidatePath(`/opportunities/${opportunityId}`);
    revalidatePath(`/companies/${existing.companyId}`);
    if (existing.companyId !== data.companyId) {
      revalidatePath(`/companies/${data.companyId}`);
    }
    return { ok: true, opportunityId };
  } catch {
    return { ok: false, message: "Could not update the opportunity. Try again." };
  }
}

