import type {
  ProposalCandidateOption,
  ProposalCompanyOption,
  ProposalOpportunityOption,
  ProposalVacancyOption,
} from "@/lib/proposals/types";

import { ProposalsNewProposalDialog } from "./proposals-new-proposal-dialog";

export function ProposalsHeader({
  canManage,
  companies,
  opportunities,
  vacancies,
  candidates,
}: {
  canManage: boolean;
  companies: ProposalCompanyOption[];
  opportunities: ProposalOpportunityOption[];
  vacancies: ProposalVacancyOption[];
  candidates: ProposalCandidateOption[];
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Proposals
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Commercial proposals built from company, opportunity, vacancy, and candidate
          data. Pricing is deterministic and auditable; text is manual-first.
        </p>
      </div>
      {canManage ? (
        <ProposalsNewProposalDialog
          companies={companies}
          opportunities={opportunities}
          vacancies={vacancies}
          candidates={candidates}
        />
      ) : null}
    </div>
  );
}

