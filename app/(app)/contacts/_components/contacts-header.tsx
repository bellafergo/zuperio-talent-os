import type { CompanyOption } from "@/lib/contacts/types";

import { ContactsNewContactDialog } from "./contacts-new-contact-dialog";

export function ContactsHeader({
  canManage,
  companies,
}: {
  canManage: boolean;
  companies: CompanyOption[];
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Contacts
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          People across your accounts. Records are loaded from PostgreSQL; search
          and filters run in the browser on the current page.
        </p>
      </div>
      {canManage ? <ContactsNewContactDialog companies={companies} /> : null}
    </div>
  );
}
