import { DataTableShell, PageHeader } from "@/components/layout";
import { listAllApplicationsForUi } from "@/lib/vacancy-applications/queries";

import { ApplicationsDataTable } from "./_components/applications-data-table";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const rows = await listAllApplicationsForUi();

  return (
    <div className="space-y-8">
      <PageHeader
        variant="list"
        title="Applications"
        description="All vacancy–candidate pipeline rows. One active application per pair is enforced in the database; closed rows keep history."
      />
      <DataTableShell>
        <ApplicationsDataTable rows={rows} />
      </DataTableShell>
    </div>
  );
}
