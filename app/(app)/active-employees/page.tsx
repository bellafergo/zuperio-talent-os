import { listPlacementsForActiveEmployeesUi } from "@/lib/placements/queries";

import { ActiveEmployeesDataTable } from "./_components/active-employees-data-table";
import { ActiveEmployeesHeader } from "./_components/active-employees-header";

export const dynamic = "force-dynamic";

export default async function ActiveEmployeesPage() {
  const rows = await listPlacementsForActiveEmployeesUi();

  return (
    <div className="space-y-6">
      <ActiveEmployeesHeader />
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ring-foreground/5 sm:p-5">
        <ActiveEmployeesDataTable rows={rows} />
      </div>
    </div>
  );
}
