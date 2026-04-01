import { prisma } from "@/lib/prisma";

import { mapProposalToDetailUi, mapProposalToListRowUi, type ProposalWithRelations } from "./mappers";
import type {
  ProposalCandidateOption,
  ProposalCompanyOption,
  ProposalDetailUi,
  ProposalListRowUi,
  ProposalOpportunityOption,
  ProposalVacancyOption,
} from "./types";

const proposalSelect = {
  id: true,
  companyId: true,
  company: { select: { id: true, name: true } },
  opportunityId: true,
  opportunity: { select: { id: true, title: true } },
  vacancyId: true,
  vacancy: { select: { id: true, title: true } },
  candidateId: true,
  candidate: { select: { id: true, firstName: true, lastName: true } },
  type: true,
  format: true,
  status: true,
  currency: true,
  validityDays: true,
  executiveSummary: true,
  profileSummary: true,
  scopeNotes: true,
  commercialNotes: true,
  pricing: {
    select: {
      scheme: true,
      monthlyHours: true,
      candidateNetSalary: true,
      marginPercent: true,
      employerLoadPercent: true,
      bonuses: true,
      benefits: true,
      operatingExpenses: true,
      discountPercent: true,

      grossSalary: true,
      employerCost: true,
      totalBenefits: true,
      totalEmployerLoad: true,
      totalOperatingExpenses: true,
      subtotal: true,
      grossMarginAmount: true,
      grossMarginPercent: true,
      finalMonthlyRate: true,
      finalMonthlyRateWithVAT: true,
      estimatedDurationMonths: true,
    },
  },
  updatedAt: true,
} as const;

export async function listProposalsForUi(): Promise<ProposalListRowUi[]> {
  const rows = await prisma.proposal.findMany({
    select: proposalSelect,
    orderBy: [{ updatedAt: "desc" }],
  });
  return rows.map((r) => mapProposalToListRowUi(r as unknown as ProposalWithRelations));
}

export async function getProposalByIdForUi(id: string): Promise<ProposalDetailUi | null> {
  const row = await prisma.proposal.findUnique({
    where: { id },
    select: proposalSelect,
  });
  return row ? mapProposalToDetailUi(row as unknown as ProposalWithRelations) : null;
}

export async function listCompaniesForProposalForm(): Promise<ProposalCompanyOption[]> {
  return prisma.company.findMany({
    select: { id: true, name: true },
    orderBy: [{ name: "asc" }],
  });
}

export async function listOpportunitiesForProposalForm(): Promise<ProposalOpportunityOption[]> {
  const rows = await prisma.opportunity.findMany({
    select: { id: true, title: true, companyId: true },
    orderBy: [{ updatedAt: "desc" }],
  });
  return rows.map((o) => ({ id: o.id, title: o.title, companyId: o.companyId }));
}

export async function listVacanciesForProposalForm(): Promise<ProposalVacancyOption[]> {
  const rows = await prisma.vacancy.findMany({
    select: {
      id: true,
      title: true,
      opportunityId: true,
      opportunity: { select: { companyId: true } },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
  return rows.map((v) => ({
    id: v.id,
    title: v.title,
    opportunityId: v.opportunityId,
    companyId: v.opportunity.companyId,
  }));
}

export async function listCandidatesForProposalForm(): Promise<ProposalCandidateOption[]> {
  const rows = await prisma.candidate.findMany({
    select: { id: true, firstName: true, lastName: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  return rows.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`.trim(),
  }));
}

/** First active company contact with an email, else first active contact (name only). */
export async function getCompanyPreferredContactForProposalEmail(
  companyId: string,
): Promise<{ displayName: string; email: string | null } | null> {
  const contacts = await prisma.contact.findMany({
    where: { companyId, status: "ACTIVE" },
    orderBy: [{ updatedAt: "desc" }],
    select: { firstName: true, lastName: true, email: true },
  });
  if (contacts.length === 0) return null;
  const withEmail = contacts.find((c) => c.email?.trim());
  const pick = withEmail ?? contacts[0];
  const displayName =
    [pick.firstName, pick.lastName].filter(Boolean).join(" ").trim() ||
    "Client contact";
  return {
    displayName,
    email: pick.email?.trim() ?? null,
  };
}

