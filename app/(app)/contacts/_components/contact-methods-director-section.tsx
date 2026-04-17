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
      description="Todos los canales guardados. Revisa tipo, valor, principal y estado; las acciones no eliminan filas del historial."
      contentClassName="pt-4"
    >
      <ContactMethodsDirectorTable methods={methods} />
    </SectionCard>
  );
}
