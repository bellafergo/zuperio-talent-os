import Link from "next/link";

import { EmptyState, SectionCard } from "@/components/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ContactListRow } from "@/lib/contacts/types";

export function CompanyContactsSection({
  contacts,
}: {
  contacts: ContactListRow[];
}) {
  return (
    <SectionCard
      title="Contactos"
      description="Personas asociadas a esta empresa."
      contentClassName="pt-4"
    >
      {contacts.length === 0 ? (
        <EmptyState
          variant="embedded"
          title="Sin contactos"
          description="Cuando se agreguen contactos para esta empresa aparecerán aquí."
        />
      ) : (
        <div className="-mx-4 max-w-[calc(100%+2rem)] sm:mx-0 sm:max-w-none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="w-[180px]">Cargo</TableHead>
                <TableHead className="w-[200px]">Correo</TableHead>
                <TableHead className="w-[140px]">Teléfono</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/contacts/${c.id}`}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      {c.displayName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.phone}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SectionCard>
  );
}
