import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { PageHeader, SectionCard } from "@/components/layout";
import {
  canManageContactMethodDirectory,
  canManageContacts,
} from "@/lib/auth/contact-access";
import { getContactByIdForUi, listCompaniesForContactForm } from "@/lib/contacts/queries";

import { ContactAddMethodDialog } from "../_components/contact-add-method-dialog";
import { ContactDetailRecordCard } from "../_components/contact-detail-record-card";
import { ContactEditDialog } from "../_components/contact-edit-dialog";
import { ContactMethodsDirectorSection } from "../_components/contact-methods-director-section";
import { ContactStatusBadge } from "../_components/contact-status-badge";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContactDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const canManage = canManageContacts(session?.user?.role);
  const isDirector = canManageContactMethodDirectory(session?.user?.role);

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
        backLabel="Volver a contactos"
        title={contact.displayName}
        description="Ficha del contacto en la cuenta: empresa, puesto y canales principales."
        meta={<ContactStatusBadge status={contact.status} />}
        actions={
          canManage ? (
            <div className="flex flex-wrap items-center gap-2">
              <ContactAddMethodDialog contactId={contact.id} />
              <ContactEditDialog contact={contact} companies={companies} />
            </div>
          ) : null
        }
      />

      <ContactDetailRecordCard
        companyName={contact.companyName}
        companyId={contact.companyId}
        title={contact.title}
        email={contact.email}
        phone={contact.phone}
        updatedAtLabel={contact.updatedAtLabel}
      />

      <SectionCard
        title="Notas"
        description="Contexto interno del contacto (próximamente notas editables en esta ficha)."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Aquí vivirán notas y seguimiento comercial cuando activemos el editor en
          esta vista.
        </p>
      </SectionCard>

      {isDirector ? <ContactMethodsDirectorSection contactId={contact.id} /> : null}
    </div>
  );
}
