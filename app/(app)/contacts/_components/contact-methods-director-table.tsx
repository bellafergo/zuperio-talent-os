"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deactivateContactMethod,
  setPrimaryContactMethod,
} from "@/lib/contacts/contact-method-actions";
import type { ContactMethodRowUi } from "@/lib/contacts/types";

export function ContactMethodsDirectorTable({
  methods,
}: {
  methods: ContactMethodRowUi[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {methods.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay métodos guardados. Pueden aparecer tras migración o cuando el equipo
          agregue datos.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Etiqueta</TableHead>
              <TableHead className="w-[100px]">Estado</TableHead>
              <TableHead className="w-[120px]">Principal</TableHead>
              <TableHead className="max-w-[140px]">Notas</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Por</TableHead>
              <TableHead className="w-[200px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {methods.map((m) => (
              <TableRow key={m.id} className={!m.isActive ? "opacity-60" : undefined}>
                <TableCell className="font-medium">{m.type}</TableCell>
                <TableCell className="max-w-[200px]">
                  <span className="line-clamp-2 break-all text-sm">{m.value}</span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {m.label ?? "—"}
                </TableCell>
                <TableCell>
                  {m.isActive ? (
                    <Badge variant="secondary">Activo</Badge>
                  ) : (
                    <Badge variant="outline">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {m.isPrimary ? (
                    <Badge>Sí</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">No</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[140px] text-xs text-muted-foreground">
                  <span className="line-clamp-2" title={m.notes ?? undefined}>
                    {m.notes?.trim() ? m.notes : "—"}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {m.createdAtLabel}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {m.createdByLabel}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    {m.isActive && !m.isPrimary ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={pending}
                        onClick={() => {
                          startTransition(async () => {
                            await setPrimaryContactMethod(m.id);
                            router.refresh();
                          });
                        }}
                      >
                        Principal
                      </Button>
                    ) : null}
                    {m.isActive ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        disabled={pending}
                        onClick={() => {
                          startTransition(async () => {
                            await deactivateContactMethod(m.id);
                            router.refresh();
                          });
                        }}
                      >
                        Desactivar
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
