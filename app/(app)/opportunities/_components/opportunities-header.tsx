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
      title="Opportunities"
      description="Pipeline and deal tracking tied to accounts. Data comes from PostgreSQL; search and filters apply to the loaded page."
      actions={
        canManage ? (
          <OpportunitiesNewOpportunityDialog companies={companies} owners={owners} />
        ) : null
      }
    />
  );
}
