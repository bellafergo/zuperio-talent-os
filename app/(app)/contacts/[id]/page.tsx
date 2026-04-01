import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { DetailGrid, PageHeader, SectionCard } from "@/components/layout";
import { canManageContacts } from "@/lib/auth/contact-access";
import { getContactByIdForUi, listCompaniesForContactForm } from "@/lib/contacts/queries";

import { ContactEditDialog } from "../_components/contact-edit-dialog";
import { ContactStatusBadge } from "../_components/contact-status-badge";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContactDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const canManage = canManageContacts(session?.user?.role);

  const [contact, companies] = await Promise.all([
    getContactByIdForUi(id),
    canManage ? listCompaniesForContactForm() : Promise.resolve([]),
  ]);

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        variant="detail"
        backHref="/contacts"
        backLabel="Back to contacts"
        title={contact.displayName}
        description="Person record linked to an account — fields from PostgreSQL."
        meta={<ContactStatusBadge status={contact.status} />}
        actions={
          canManage ? (
            <ContactEditDialog contact={contact} companies={companies} />
          ) : null
        }
      />

      <DetailGrid
        items={[
          { label: "Title / role", value: contact.title },
          { label: "Email", value: contact.email },
          { label: "Phone", value: contact.phone },
          {
            label: "Company",
            value: contact.companyName,
            href: `/companies/${contact.companyId}`,
          },
        ]}
      />

      <SectionCard
        title="Notes"
        description="Context, preferences, and conversation history."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Notes and timeline entries will live here as the CRM layer grows. Core
          contact fields above are stored in PostgreSQL.
        </p>
      </SectionCard>
    </div>
  );
}
