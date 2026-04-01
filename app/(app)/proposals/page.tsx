import { auth } from "@/auth";
import { canManageProposals } from "@/lib/auth/proposal-access";
import {
  listCandidatesForProposalForm,
  listCompaniesForProposalForm,
  listOpportunitiesForProposalForm,
  listProposalsForUi,
  listVacanciesForProposalForm,
} from "@/lib/proposals/queries";

import { ProposalsHeader } from "./_components/proposals-header";
import { ProposalsTable } from "./_components/proposals-table";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  const session = await auth();
  const canManage = canManageProposals(session?.user?.role);

  const [rows, companies, opportunities, vacancies, candidates] = await Promise.all([
    listProposalsForUi(),
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
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ring-foreground/5 sm:p-5">
        <ProposalsTable rows={rows} />
      </div>
    </div>
  );
}

