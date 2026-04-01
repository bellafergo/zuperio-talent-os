import { auth } from "@/auth";
import { canManageContacts } from "@/lib/auth/contact-access";
import { listCompaniesForContactForm, listContactsForUi } from "@/lib/contacts/queries";

import { ContactsHeader } from "./_components/contacts-header";
import { ContactsModule } from "./_components/contacts-module";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const session = await auth();
  const canManage = canManageContacts(session?.user?.role);

  const [contacts, companies] = await Promise.all([
    listContactsForUi(),
    canManage ? listCompaniesForContactForm() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-8">
      <ContactsHeader canManage={canManage} companies={companies} />
      <ContactsModule contacts={contacts} />
    </div>
  );
}
