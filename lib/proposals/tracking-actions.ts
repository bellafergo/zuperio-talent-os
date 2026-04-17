"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { canManageProposals } from "@/lib/auth/proposal-access";
import { prisma } from "@/lib/prisma";
import { isMissingProposalCommercialClosedAtError } from "@/lib/prisma/proposal-commercial-closed-drift";

import type { ProposalActionState } from "./actions";
import { commercialClosedAtPatchForStatusChange } from "./commercial-closed-at";

async function gate(): Promise<
  { ok: true } | { ok: false; state: ProposalActionState }
> {
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      state: { ok: false, message: "Debe iniciar sesión para continuar." },
    };
  }
  if (!canManageProposals(session.user.role)) {
    return {
      ok: false,
      state: {
        ok: false,
        message: "Solo ventas y dirección pueden actualizar el seguimiento.",
      },
    };
  }
  return { ok: true };
}

/**
 * Commercial pipeline quick actions (detail page). Persists one of the three
 * “late funnel” statuses. Verified flow (UI disables redundant clicks):
 * - IN_NEGOTIATION ↔ WON / LOST (p. ej. Ganada/Pérdida → En negociación).
 * - SENT / VIEWED / DRAFT can also move into these states via the same buttons
 * Full status edits (incl. all enums) remain available in the proposal edit form.
 */
export async function setProposalPipelineStatus(
  proposalId: string,
  status: "IN_NEGOTIATION" | "WON" | "LOST",
): Promise<ProposalActionState> {
  const g = await gate();
  if (!g.ok) return g.state;

  const row = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { id: true, status: true },
  });
  if (!row) return { ok: false, message: "Proposal was not found." };

  if (row.status === status) {
    return { ok: true, proposalId };
  }

  const closurePatch = commercialClosedAtPatchForStatusChange(
    row.status,
    status,
  );

  try {
    await prisma.proposal.update({
      where: { id: proposalId },
      data: { status, ...closurePatch },
    });
  } catch (err) {
    if (
      Object.keys(closurePatch).length > 0 &&
      isMissingProposalCommercialClosedAtError(err)
    ) {
      console.warn(
        "[setProposalPipelineStatus] commercialClosedAt column missing; saving status only. Run `prisma migrate deploy`.",
      );
      await prisma.proposal.update({
        where: { id: proposalId },
        data: { status },
      });
    } else {
      throw err;
    }
  }

  revalidatePath("/proposals");
  revalidatePath(`/proposals/${proposalId}`);
  revalidatePath("/dashboard");
  return { ok: true, proposalId };
}

export async function markProposalFollowUpSent(
  proposalId: string,
): Promise<ProposalActionState> {
  const g = await gate();
  if (!g.ok) return g.state;

  const exists = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { id: true },
  });
  if (!exists) return { ok: false, message: "No se encontró la propuesta." };

  await prisma.proposal.update({
    where: { id: proposalId },
    data: {
      lastFollowUpAt: new Date(),
      followUpCount: { increment: 1 },
    },
  });

  revalidatePath("/proposals");
  revalidatePath(`/proposals/${proposalId}`);
  return { ok: true, proposalId };
}
