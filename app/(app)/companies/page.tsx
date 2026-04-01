import { listCompaniesForUi } from "@/lib/companies/queries";

import { CompaniesHeader } from "./_components/companies-header";
import { CompaniesModule } from "./_components/companies-module";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await listCompaniesForUi();

  return (
    <div className="space-y-6">
      <CompaniesHeader />
      <CompaniesModule companies={companies} />
    </div>
  );
}
