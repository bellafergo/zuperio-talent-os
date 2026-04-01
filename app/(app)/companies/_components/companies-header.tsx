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
      title="Companies"
      description="Accounts and relationships across your pipeline. Search and filter the directory below."
      actions={canManage ? <CompaniesNewCompanyDialog users={users} /> : null}
    />
  );
}
