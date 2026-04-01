import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { DetailGrid, PageHeader, SectionCard } from "@/components/layout";
import {
  canManageContactMethodDirectory,
  canManageContacts,
} from "@/lib/auth/contact-access";
import { getContactByIdForUi, listCompaniesForContactForm } from "@/lib/contacts/queries";

import { ContactAddMethodDialog } from "../_components/contact-add-method-dialog";
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
        description="Persona ligada a una cuenta: campos desde PostgreSQL."
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

      <p className="text-sm text-muted-foreground">
        Última actualización del registro:{" "}
        <span className="font-medium tabular-nums text-foreground">
          {contact.updatedAtLabel}
        </span>
      </p>

      <DetailGrid
        items={[
          { label: "Puesto / rol", value: contact.title },
          { label: "Correo", value: contact.email },
          { label: "Teléfono", value: contact.phone },
          {
            label: "Empresa",
            value: contact.companyName,
            href: `/companies/${contact.companyId}`,
          },
        ]}
      />

      <SectionCard
        title="Notas"
        description="Contexto, preferencias e historial de conversación."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Notas y entradas de línea de tiempo vivirán aquí a medida crezca la capa
          CRM. Los campos principales del contacto arriba están en PostgreSQL.
        </p>
      </SectionCard>

      {isDirector ? <ContactMethodsDirectorSection contactId={contact.id} /> : null}
    </div>
  );
}
