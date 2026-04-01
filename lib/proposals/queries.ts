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
  status: true,
  currency: true,
  validityDays: true,
  executiveSummary: true,
  profileSummary: true,
  scopeNotes: true,
  commercialNotes: true,
  pricing: {
    select: {
      monthlyHours: true,
      candidateNetSalary: true,
      employerCost: true,
      internalCost: true,
      clientRate: true,
      clientMonthlyAmount: true,
      grossMarginAmount: true,
      grossMarginPercent: true,
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

