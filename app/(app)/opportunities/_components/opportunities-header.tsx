import { PageHeader } from "@/components/layout";
import type {
  OpportunityCompanyOption,
  OpportunityOwnerOption,
} from "@/lib/opportunities/queries";

import { OpportunitiesNewOpportunityDialog } from "./opportunities-new-opportunity-dialog";

export function OpportunitiesHeader({
  canManage,
  companies,
  owners,
}: {
  canManage: boolean;
  companies: OpportunityCompanyOption[];
  owners: OpportunityOwnerOption[];
}) {
  return (
    <PageHeader
      variant="list"
      title="Oportunidades"
      description="Embudo y seguimiento de deals por cuenta. Búsqueda y filtros sobre la página cargada."
      actions={
        canManage ? (
          <OpportunitiesNewOpportunityDialog companies={companies} owners={owners} />
        ) : null
      }
    />
  );
}
