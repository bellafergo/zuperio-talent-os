import { Suspense } from "react";

import { auth } from "@/auth";
import { canManageProposals } from "@/lib/auth/proposal-access";
import { parseProposalListSearchParams } from "@/lib/proposals/list-search-params";
import {
  listCandidatesForProposalForm,
  listCompaniesForProposalForm,
  listOpportunitiesForProposalForm,
  listProposalsForUi,
  listVacanciesForProposalForm,
  getProposalsDashboardSummary,
} from "@/lib/proposals/queries";

import { ProposalsFilters } from "./_components/proposals-filters";
import { ProposalsHeader } from "./_components/proposals-header";
import { ProposalsSummaryStrip } from "./_components/proposals-summary-strip";
import { ProposalsTable } from "./_components/proposals-table";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ status?: string; followUp?: string }>;
};

export default async function ProposalsPage({ searchParams }: PageProps) {
  const session = await auth();
  const canManage = canManageProposals(session?.user?.role);
  const sp = await searchParams;
  const filters = parseProposalListSearchParams(sp);

  const [rows, summary, companies, opportunities, vacancies, candidates] =
    await Promise.all([
      listProposalsForUi(filters),
      getProposalsDashboardSummary(),
      canManage ? listCompaniesForProposalForm() : Promise.resolve([]),
      canManage ? listOpportunitiesForProposalForm() : Promise.resolve([]),
      canManage ? listVacanciesForProposalForm() : Promise.resolve([]),
      canManage ? listCandidatesForProposalForm() : Promise.resolve([]),
    ]);

  return (
    <div className="space-y-6">
      <ProposalsHeader
        canManage={canManage}
        companies={companies}
        opportunities={opportunities}
        vacancies={vacancies}
        candidates={candidates}
      />
      <ProposalsSummaryStrip summary={summary} />
      <Suspense fallback={<div className="h-10" />}>
        <ProposalsFilters />
      </Suspense>
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ring-foreground/5 sm:p-5">
        <ProposalsTable rows={rows} />
      </div>
    </div>
  );
}

