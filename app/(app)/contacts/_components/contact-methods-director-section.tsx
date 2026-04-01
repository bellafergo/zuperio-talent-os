import { SectionCard } from "@/components/layout/section-card";
import { listContactMethodsForContact } from "@/lib/contacts/queries";

import { ContactMethodsDirectorTable } from "./contact-methods-director-table";

export async function ContactMethodsDirectorSection({
  contactId,
}: {
  contactId: string;
}) {
  const methods = await listContactMethodsForContact(contactId);

  return (
    <SectionCard
      title="Historial de métodos de contacto"
      description="Vista Director: todos los canales guardados, principal por tipo y desactivación sin borrar el archivo histórico en base de datos."
      contentClassName="pt-4"
    >
      <ContactMethodsDirectorTable methods={methods} />
    </SectionCard>
  );
}
