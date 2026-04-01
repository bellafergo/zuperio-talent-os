import { listContactsForUi } from "@/lib/contacts/queries";

import { ContactsHeader } from "./_components/contacts-header";
import { ContactsModule } from "./_components/contacts-module";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const contacts = await listContactsForUi();

  return (
    <div className="space-y-6">
      <ContactsHeader />
      <ContactsModule contacts={contacts} />
    </div>
  );
}
