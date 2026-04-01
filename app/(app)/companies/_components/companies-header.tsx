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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Companies
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Accounts and relationships across your pipeline. Search and filter
          the directory below.
        </p>
      </div>
      {canManage ? <CompaniesNewCompanyDialog users={users} /> : null}
    </div>
  );
}
