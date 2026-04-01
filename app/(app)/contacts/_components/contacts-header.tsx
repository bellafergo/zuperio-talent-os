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
      title="Contactos"
      description="Personas ligadas a tus cuentas. Búsqueda y filtros en la página actual."
      actions={canManage ? <ContactsNewContactDialog companies={companies} /> : null}
    />
  );
}
