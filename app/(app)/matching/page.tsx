import { listAllMatchesForUi } from "@/lib/matching/queries";

import { MatchingDataTable } from "./_components/matching-data-table";
import { MatchingHeader } from "./_components/matching-header";

export const dynamic = "force-dynamic";

export default async function MatchingPage() {
  const rows = await listAllMatchesForUi();

  return (
    <div className="space-y-6">
      <MatchingHeader />
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ring-foreground/5 sm:p-5">
        <MatchingDataTable rows={rows} />
      </div>
    </div>
  );
}
