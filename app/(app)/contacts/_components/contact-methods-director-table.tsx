"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { CheckIcon, MinusIcon } from "lucide-react";

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
import { cn } from "@/lib/utils";

export function ContactMethodsDirectorTable({
  methods,
}: {
  methods: ContactMethodRowUi[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      {methods.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay métodos guardados. Aparecerán al migrar datos o cuando el equipo
          agregue canales.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border/80">
          <Table>
            <TableHeader>
              <TableRow className="border-border/80 hover:bg-transparent">
                <TableHead className="w-[100px] whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tipo
                </TableHead>
                <TableHead className="min-w-[200px] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Valor
                </TableHead>
                <TableHead className="w-[88px] text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Principal
                </TableHead>
                <TableHead className="w-[88px] text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Activo
                </TableHead>
                <TableHead className="w-[140px] whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Creado
                </TableHead>
                <TableHead className="min-w-[120px] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Quién
                </TableHead>
                <TableHead className="w-[140px] text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.map((m) => (
                <TableRow
                  key={m.id}
                  className={cn(
                    "border-border/60",
                    !m.isActive && "bg-muted/20 text-muted-foreground",
                  )}
                >
                  <TableCell className="align-top text-sm font-medium text-foreground">
                    {m.type}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <p className="break-all text-sm font-medium leading-snug text-foreground">
                        {m.value}
                      </p>
                      {m.label ? (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Etiqueta:</span> {m.label}
                        </p>
                      ) : null}
                      {m.notes?.trim() ? (
                        <p
                          className="line-clamp-2 text-xs leading-relaxed text-muted-foreground"
                          title={m.notes}
                        >
                          <span className="font-medium text-foreground/70">Nota:</span>{" "}
                          {m.notes}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="align-top text-center">
                    {m.isPrimary ? (
                      <span
                        className="inline-flex size-7 items-center justify-center rounded-full bg-primary/12 text-primary"
                        title="Principal para su tipo"
                      >
                        <CheckIcon className="size-3.5" strokeWidth={2.5} aria-hidden />
                        <span className="sr-only">Sí</span>
                      </span>
                    ) : (
                      <span className="inline-flex size-7 items-center justify-center text-muted-foreground/50">
                        <MinusIcon className="size-3.5" aria-hidden />
                        <span className="sr-only">No</span>
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="align-top text-center">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        m.isActive ? "text-foreground" : "text-muted-foreground line-through",
                      )}
                    >
                      {m.isActive ? "Sí" : "No"}
                    </span>
                  </TableCell>
                  <TableCell className="align-top whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                    {m.createdAtLabel}
                  </TableCell>
                  <TableCell className="align-top text-sm text-muted-foreground">
                    {m.createdByLabel}
                  </TableCell>
                  <TableCell className="align-top text-right">
                    <div className="flex flex-col items-end gap-1">
                      {m.isActive && !m.isPrimary ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs font-normal text-foreground"
                          disabled={pending}
                          onClick={() => {
                            startTransition(async () => {
                              await setPrimaryContactMethod(m.id);
                              router.refresh();
                            });
                          }}
                        >
                          Marcar principal
                        </Button>
                      ) : null}
                      {m.isActive ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs font-normal text-muted-foreground hover:text-destructive"
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
                      {!m.isActive ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
