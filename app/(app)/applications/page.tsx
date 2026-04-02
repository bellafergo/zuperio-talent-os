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
        title="Postulaciones"
        description="Todos los pares vacante–candidato del pipeline. Solo se permite una postulación activa por par; las cerradas conservan el historial."
      />
      <DataTableShell>
        <ApplicationsDataTable rows={rows} />
      </DataTableShell>
    </div>
  );
}
