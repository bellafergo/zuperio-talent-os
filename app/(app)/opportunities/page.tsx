import { auth } from "@/auth";
import { canManageOpportunities } from "@/lib/auth/opportunity-access";
import {
  listCompaniesForOpportunityForm,
  listOpportunitiesForUi,
  listUsersForOpportunityForm,
} from "@/lib/opportunities/queries";

import { OpportunitiesHeader } from "./_components/opportunities-header";
import { OpportunitiesModule } from "./_components/opportunities-module";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const session = await auth();
  const canManage = canManageOpportunities(session?.user?.role);

  const [opportunities, companies, owners] = await Promise.all([
    listOpportunitiesForUi(),
    canManage ? listCompaniesForOpportunityForm() : Promise.resolve([]),
    canManage ? listUsersForOpportunityForm() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <OpportunitiesHeader canManage={canManage} companies={companies} owners={owners} />
      <OpportunitiesModule opportunities={opportunities} />
    </div>
  );
}
