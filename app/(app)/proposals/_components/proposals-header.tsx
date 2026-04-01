import { PageHeader } from "@/components/layout";
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
    <PageHeader
      variant="list"
      title="Proposals"
      description="Commercial proposals built from company, opportunity, vacancy, and candidate data. Pricing is deterministic and auditable; text is manual-first."
      actions={
        canManage ? (
          <ProposalsNewProposalDialog
            companies={companies}
            opportunities={opportunities}
            vacancies={vacancies}
            candidates={candidates}
          />
        ) : null
      }
    />
  );
}

