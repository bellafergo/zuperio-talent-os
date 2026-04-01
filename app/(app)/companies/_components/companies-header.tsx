import { PageHeader } from "@/components/layout";
import type { CompanyOwnerOption } from "@/lib/companies/queries";

import { CompaniesNewCompanyDialog } from "./companies-new-company-dialog";

export function CompaniesHeader({
  canManage,
  users,
}: {
  canManage: boolean;
  users: CompanyOwnerOption[];
}) {
  return (
    <PageHeader
      variant="list"
      title="Empresas"
      description="Cuentas y relaciones en tu embudo. Busca y filtra el directorio."
      actions={canManage ? <CompaniesNewCompanyDialog users={users} /> : null}
    />
  );
}
