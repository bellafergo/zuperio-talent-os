import { PageHeader } from "@/components/layout";
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
    <PageHeader
      variant="list"
      title="Contacts"
      description="People across your accounts. Records are loaded from PostgreSQL; search and filters run in the browser on the current page."
      actions={canManage ? <ContactsNewContactDialog companies={companies} /> : null}
    />
  );
}
