"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { canManageProposals } from "@/lib/auth/proposal-access";
import { prisma } from "@/lib/prisma";

import type { ProposalActionState } from "./actions";

async function gate(): Promise<
  { ok: true } | { ok: false; state: ProposalActionState }
> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, state: { ok: false, message: "You must be signed in." } };
  }
  if (!canManageProposals(session.user.role)) {
    return {
      ok: false,
      state: {
        ok: false,
        message: "Only Sales and Director can update proposal tracking.",
      },
    };
  }
  return { ok: true };
}

export async function setProposalPipelineStatus(
  proposalId: string,
  status: "IN_NEGOTIATION" | "WON" | "LOST",
): Promise<ProposalActionState> {
  const g = await gate();
  if (!g.ok) return g.state;

  const exists = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { id: true },
  });
  if (!exists) return { ok: false, message: "Proposal was not found." };

  await prisma.proposal.update({
    where: { id: proposalId },
    data: { status },
  });

  revalidatePath("/proposals");
  revalidatePath(`/proposals/${proposalId}`);
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
  if (!exists) return { ok: false, message: "Proposal was not found." };

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
