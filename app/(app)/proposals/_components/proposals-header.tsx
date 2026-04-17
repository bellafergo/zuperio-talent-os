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
      title="Propuestas"
      description="Propuestas comerciales con empresa, oportunidad, vacante y candidato. Precios deterministas y auditables; textos manuales."
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

