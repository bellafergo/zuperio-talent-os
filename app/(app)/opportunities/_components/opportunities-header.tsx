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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Opportunities
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Pipeline and deal tracking tied to accounts. Data comes from PostgreSQL;
          search and filters apply to the loaded page.
        </p>
      </div>
      {canManage ? (
        <OpportunitiesNewOpportunityDialog companies={companies} owners={owners} />
      ) : null}
    </div>
  );
}
