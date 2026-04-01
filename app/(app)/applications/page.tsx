import { listAllApplicationsForUi } from "@/lib/vacancy-applications/queries";

import { ApplicationsDataTable } from "./_components/applications-data-table";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const rows = await listAllApplicationsForUi();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Applications
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          All vacancy–candidate pipeline rows. One active application per pair is
          enforced in the database; closed rows keep history.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ring-foreground/5 sm:p-5">
        <ApplicationsDataTable rows={rows} />
      </div>
    </div>
  );
}
