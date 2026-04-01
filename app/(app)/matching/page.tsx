import { DataTableShell } from "@/components/layout";
import { listAllMatchesForUi } from "@/lib/matching/queries";

import { MatchingDataTable } from "./_components/matching-data-table";
import { MatchingHeader } from "./_components/matching-header";

export const dynamic = "force-dynamic";

export default async function MatchingPage() {
  const rows = await listAllMatchesForUi();

  return (
    <div className="space-y-8">
      <MatchingHeader pairCount={rows.length} />
      <DataTableShell className="ring-1 ring-foreground/[0.06]">
        <MatchingDataTable rows={rows} />
      </DataTableShell>
    </div>
  );
}
