import { auth } from "@/auth";
import { canManageCompanies } from "@/lib/auth/company-access";
import {
  listCompaniesForUi,
  listUsersForCompanyForm,
} from "@/lib/companies/queries";

import { CompaniesHeader } from "./_components/companies-header";
import { CompaniesModule } from "./_components/companies-module";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const session = await auth();
  const canManage = canManageCompanies(session?.user?.role);
  const [companies, users] = await Promise.all([
    listCompaniesForUi(),
    canManage ? listUsersForCompanyForm() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <CompaniesHeader canManage={canManage} users={users} />
      <CompaniesModule companies={companies} />
    </div>
  );
}
