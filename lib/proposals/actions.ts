"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { canManageProposals } from "@/lib/auth/proposal-access";
import { prisma } from "@/lib/prisma";

import { computeProposalPricing } from "./pricing";
import { parseProposalForm } from "./validation";

export type ProposalActionState =
  | { ok: true; proposalId?: string }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

async function ensureCanManage(): Promise<
  { ok: true; userId: string | null } | { ok: false; state: ProposalActionState }
> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, state: { ok: false, message: "You must be signed in." } };
  }
  if (!canManageProposals(session.user.role)) {
    return { ok: false, state: { ok: false, message: "You do not have permission to change proposals." } };
  }
  return { ok: true, userId: session.user.id ?? null };
}

export async function createProposal(
  _prev: ProposalActionState | null,
  formData: FormData,
): Promise<ProposalActionState> {
  const gate = await ensureCanManage();
  if (!gate.ok) return gate.state;

  const parsed = parseProposalForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };
  const { data } = parsed;

  const company = await prisma.company.findUnique({ where: { id: data.companyId }, select: { id: true } });
  if (!company) return { ok: false, fieldErrors: { companyId: "Selected company was not found." } };

  if (data.opportunityId) {
    const opp = await prisma.opportunity.findUnique({
      where: { id: data.opportunityId },
      select: { id: true, companyId: true },
    });
    if (!opp) return { ok: false, fieldErrors: { opportunityId: "Selected opportunity was not found." } };
    if (opp.companyId !== data.companyId) {
      return { ok: false, fieldErrors: { opportunityId: "Opportunity must belong to the selected company." } };
    }
  }

  if (data.vacancyId) {
    const vac = await prisma.vacancy.findUnique({
      where: { id: data.vacancyId },
      select: { id: true, opportunity: { select: { companyId: true } }, opportunityId: true },
    });
    if (!vac) return { ok: false, fieldErrors: { vacancyId: "Selected vacancy was not found." } };
    if (vac.opportunity.companyId !== data.companyId) {
      return { ok: false, fieldErrors: { vacancyId: "Vacancy must belong to the selected company." } };
    }
    if (data.opportunityId && vac.opportunityId !== data.opportunityId) {
      return { ok: false, fieldErrors: { vacancyId: "Vacancy must belong to the selected opportunity." } };
    }
  }

  if (data.candidateId) {
    const cand = await prisma.candidate.findUnique({ where: { id: data.candidateId }, select: { id: true } });
    if (!cand) return { ok: false, fieldErrors: { candidateId: "Selected candidate was not found." } };
  }

  const computed = computeProposalPricing({
    scheme: data.scheme,
    monthlyHours: data.monthlyHours,
    estimatedDurationMonths: data.estimatedDurationMonths,
    candidateNetSalary: data.candidateNetSalary,
    marginPercent: data.marginPercent,
    employerLoadPercent: data.employerLoadPercent,
    bonuses: data.bonuses,
    benefits: data.benefits,
    operatingExpenses: data.operatingExpenses,
    discountPercent: data.discountPercent,
  });

  try {
    const created = await prisma.$transaction(async (tx) => {
      const proposal = await tx.proposal.create({
        data: {
          companyId: data.companyId,
          opportunityId: data.opportunityId,
          vacancyId: data.vacancyId,
          candidateId: data.candidateId,
          type: data.type,
          format: data.format,
          status: data.status,
          currency: data.currency,
          validityDays: data.validityDays,
          executiveSummary: data.executiveSummary,
          profileSummary: data.profileSummary,
          scopeNotes: data.scopeNotes,
          commercialNotes: data.commercialNotes,
          createdById: gate.userId,
        },
        select: { id: true },
      });

      await tx.proposalPricing.create({
        data: {
          proposalId: proposal.id,
          scheme: data.scheme,
          monthlyHours: data.monthlyHours,
          candidateNetSalary: data.candidateNetSalary,
          marginPercent: data.marginPercent,
          employerLoadPercent: data.employerLoadPercent,
          bonuses: data.bonuses,
          benefits: data.benefits,
          operatingExpenses: data.operatingExpenses,
          discountPercent: data.discountPercent,

          grossSalary: computed.grossSalary,
          employerCost: computed.employerCost,
          totalBenefits: computed.totalBenefits,
          totalEmployerLoad: computed.totalEmployerLoad,
          totalOperatingExpenses: computed.totalOperatingExpenses,
          subtotal: computed.subtotal,
          grossMarginAmount: computed.grossMarginAmount,
          grossMarginPercent: computed.grossMarginPercent,
          finalMonthlyRate: computed.finalMonthlyRate,
          finalMonthlyRateWithVAT: computed.finalMonthlyRateWithVAT,
          estimatedDurationMonths: data.estimatedDurationMonths,
        },
      });

      return proposal;
    });

    revalidatePath("/proposals");
    revalidatePath(`/proposals/${created.id}`);
    return { ok: true, proposalId: created.id };
  } catch {
    return { ok: false, message: "Could not create the proposal. Try again." };
  }
}

export async function updateProposal(
  _prev: ProposalActionState | null,
  formData: FormData,
): Promise<ProposalActionState> {
  const gate = await ensureCanManage();
  if (!gate.ok) return gate.state;

  const idRaw = formData.get("proposalId");
  const proposalId = typeof idRaw === "string" ? idRaw.trim() : "";
  if (!proposalId) return { ok: false, message: "Missing proposal id." };

  const exists = await prisma.proposal.findUnique({ where: { id: proposalId }, select: { id: true } });
  if (!exists) return { ok: false, message: "Proposal was not found." };

  const parsed = parseProposalForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };
  const { data } = parsed;

  const company = await prisma.company.findUnique({ where: { id: data.companyId }, select: { id: true } });
  if (!company) return { ok: false, fieldErrors: { companyId: "Selected company was not found." } };

  if (data.opportunityId) {
    const opp = await prisma.opportunity.findUnique({
      where: { id: data.opportunityId },
      select: { id: true, companyId: true },
    });
    if (!opp) return { ok: false, fieldErrors: { opportunityId: "Selected opportunity was not found." } };
    if (opp.companyId !== data.companyId) {
      return { ok: false, fieldErrors: { opportunityId: "Opportunity must belong to the selected company." } };
    }
  }

  if (data.vacancyId) {
    const vac = await prisma.vacancy.findUnique({
      where: { id: data.vacancyId },
      select: { id: true, opportunity: { select: { companyId: true } }, opportunityId: true },
    });
    if (!vac) return { ok: false, fieldErrors: { vacancyId: "Selected vacancy was not found." } };
    if (vac.opportunity.companyId !== data.companyId) {
      return { ok: false, fieldErrors: { vacancyId: "Vacancy must belong to the selected company." } };
    }
    if (data.opportunityId && vac.opportunityId !== data.opportunityId) {
      return { ok: false, fieldErrors: { vacancyId: "Vacancy must belong to the selected opportunity." } };
    }
  }

  if (data.candidateId) {
    const cand = await prisma.candidate.findUnique({ where: { id: data.candidateId }, select: { id: true } });
    if (!cand) return { ok: false, fieldErrors: { candidateId: "Selected candidate was not found." } };
  }

  const computed = computeProposalPricing({
    scheme: data.scheme,
    monthlyHours: data.monthlyHours,
    estimatedDurationMonths: data.estimatedDurationMonths,
    candidateNetSalary: data.candidateNetSalary,
    marginPercent: data.marginPercent,
    employerLoadPercent: data.employerLoadPercent,
    bonuses: data.bonuses,
    benefits: data.benefits,
    operatingExpenses: data.operatingExpenses,
    discountPercent: data.discountPercent,
  });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.proposal.update({
        where: { id: proposalId },
        data: {
          companyId: data.companyId,
          opportunityId: data.opportunityId,
          vacancyId: data.vacancyId,
          candidateId: data.candidateId,
          type: data.type,
          format: data.format,
          status: data.status,
          currency: data.currency,
          validityDays: data.validityDays,
          executiveSummary: data.executiveSummary,
          profileSummary: data.profileSummary,
          scopeNotes: data.scopeNotes,
          commercialNotes: data.commercialNotes,
        },
      });

      await tx.proposalPricing.upsert({
        where: { proposalId },
        create: {
          proposalId,
          scheme: data.scheme,
          monthlyHours: data.monthlyHours,
          candidateNetSalary: data.candidateNetSalary,
          marginPercent: data.marginPercent,
          employerLoadPercent: data.employerLoadPercent,
          bonuses: data.bonuses,
          benefits: data.benefits,
          operatingExpenses: data.operatingExpenses,
          discountPercent: data.discountPercent,

          grossSalary: computed.grossSalary,
          employerCost: computed.employerCost,
          totalBenefits: computed.totalBenefits,
          totalEmployerLoad: computed.totalEmployerLoad,
          totalOperatingExpenses: computed.totalOperatingExpenses,
          subtotal: computed.subtotal,
          grossMarginAmount: computed.grossMarginAmount,
          grossMarginPercent: computed.grossMarginPercent,
          finalMonthlyRate: computed.finalMonthlyRate,
          finalMonthlyRateWithVAT: computed.finalMonthlyRateWithVAT,
          estimatedDurationMonths: data.estimatedDurationMonths,
        },
        update: {
          scheme: data.scheme,
          monthlyHours: data.monthlyHours,
          candidateNetSalary: data.candidateNetSalary,
          marginPercent: data.marginPercent,
          employerLoadPercent: data.employerLoadPercent,
          bonuses: data.bonuses,
          benefits: data.benefits,
          operatingExpenses: data.operatingExpenses,
          discountPercent: data.discountPercent,

          grossSalary: computed.grossSalary,
          employerCost: computed.employerCost,
          totalBenefits: computed.totalBenefits,
          totalEmployerLoad: computed.totalEmployerLoad,
          totalOperatingExpenses: computed.totalOperatingExpenses,
          subtotal: computed.subtotal,
          grossMarginAmount: computed.grossMarginAmount,
          grossMarginPercent: computed.grossMarginPercent,
          finalMonthlyRate: computed.finalMonthlyRate,
          finalMonthlyRateWithVAT: computed.finalMonthlyRateWithVAT,
          estimatedDurationMonths: data.estimatedDurationMonths,
        },
      });
    });

    revalidatePath("/proposals");
    revalidatePath(`/proposals/${proposalId}`);
    return { ok: true, proposalId };
  } catch {
    return { ok: false, message: "Could not update the proposal. Try again." };
  }
}

