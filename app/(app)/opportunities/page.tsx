import { listOpportunitiesForUi } from "@/lib/opportunities/queries";

import { OpportunitiesHeader } from "./_components/opportunities-header";
import { OpportunitiesModule } from "./_components/opportunities-module";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const opportunities = await listOpportunitiesForUi();

  return (
    <div className="space-y-6">
      <OpportunitiesHeader />
      <OpportunitiesModule opportunities={opportunities} />
    </div>
  );
}
