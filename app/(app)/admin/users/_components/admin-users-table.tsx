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
  approveAdminUserDeletion,
  requestAdminUserDeletion,
  setAdminUserActive,
} from "@/lib/admin-users/actions";
import type { AdminUserRow } from "@/lib/admin-users/types";
import { roleLabel } from "@/lib/auth/access";
import { cn } from "@/lib/utils";

import { AdminUserEditDialog } from "./admin-user-edit-dialog";

function StatusCell({ u }: { u: AdminUserRow }) {
  const badge =
    u.displayStatus === "active" ? (
      <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Activo</Badge>
    ) : u.displayStatus === "inactive" ? (
      <Badge variant="secondary">Inactivo</Badge>
    ) : u.displayStatus === "pending_removal" ? (
      <Badge
        variant="outline"
        className="border-amber-500/60 text-amber-950 dark:text-amber-100"
      >
        Baja pendiente
      </Badge>
    ) : (
      <Badge variant="outline">Dado de baja</Badge>
    );

  return (
    <div className="space-y-1">
      {badge}
      {u.displayStatus === "pending_removal" &&
      u.deletionRequesterLabel &&
      u.deletionRequestedAtLabel ? (
        <p className="max-w-[220px] text-xs leading-snug text-muted-foreground">
          Solicitud de {u.deletionRequesterLabel}
          <br />
          <span className="tabular-nums">{u.deletionRequestedAtLabel}</span>
        </p>
      ) : null}
      {u.displayStatus === "removed" &&
      u.deletionApproverLabel &&
      u.deletionApprovedAtLabel ? (
        <p className="max-w-[220px] text-xs leading-snug text-muted-foreground">
          Aprobado por {u.deletionApproverLabel}
          <br />
          <span className="tabular-nums">{u.deletionApprovedAtLabel}</span>
        </p>
      ) : null}
    </div>
  );
}

export function AdminUsersTable({
  users,
  currentUserId,
  includeRemoved,
}: {
  users: AdminUserRow[];
  currentUserId: string;
  /** When false and list is empty, hint to toggle "show removed". */
  includeRemoved: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(
    fn: () => Promise<{ ok: boolean; message?: string }>,
  ) {
    startTransition(async () => {
      const result = await fn();
      if (!result.ok && result.message) {
        window.alert(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-foreground/[0.04]">
      <Table>
        <TableHeader>
          <TableRow className="border-border/80 hover:bg-transparent">
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead className="w-[120px]">Rol</TableHead>
            <TableHead className="min-w-[160px]">Estado</TableHead>
            <TableHead className="w-[168px] whitespace-nowrap">Alta</TableHead>
            <TableHead className="min-w-[320px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-sm text-muted-foreground"
              >
                {includeRemoved
                  ? "No hay ningún usuario en la base de datos."
                  : "No hay usuarios activos en esta vista. Usa «Mostrar dados de baja» para ver cuentas dadas de baja administrativa."}
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => {
              const isSelf = u.id === currentUserId;
              const canRequestRemoval =
                !u.isDeleted &&
                !isSelf &&
                u.displayStatus !== "pending_removal" &&
                u.displayStatus !== "removed";
              const canApproveRemoval =
                u.displayStatus === "pending_removal" &&
                u.deletionRequestedById != null &&
                u.deletionRequestedById !== currentUserId;

              return (
                <TableRow
                  key={u.id}
                  className={cn(u.isDeleted && "bg-muted/25 text-muted-foreground")}
                >
                  <TableCell className="font-medium">
                    {u.name?.trim() ? u.name : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>{roleLabel(u.role)}</TableCell>
                  <TableCell>
                    <StatusCell u={u} />
                  </TableCell>
                  <TableCell className="tabular-nums text-sm text-muted-foreground">
                    {u.createdAtLabel}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-end gap-1 sm:flex-row sm:flex-wrap sm:justify-end">
                      <AdminUserEditDialog user={u} currentUserId={currentUserId} />
                      {!u.isDeleted ? (
                        u.isActive ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-muted-foreground hover:text-destructive"
                            disabled={pending || isSelf}
                            title={
                              isSelf
                                ? "No puedes desactivar tu propia cuenta"
                                : undefined
                            }
                            onClick={() => {
                              if (
                                !window.confirm(
                                  `¿Desactivar a ${u.email}? No podrá iniciar sesión.`,
                                )
                              ) {
                                return;
                              }
                              run(() => setAdminUserActive(u.id, false));
                            }}
                          >
                            Desactivar
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            disabled={pending}
                            onClick={() => run(() => setAdminUserActive(u.id, true))}
                          >
                            Activar
                          </Button>
                        )
                      ) : null}
                      {canRequestRemoval ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          disabled={pending}
                          onClick={() => {
                            if (
                              !window.confirm(
                                `Solicitar baja administrativa de ${u.email}?\n\nOtro director deberá aprobar. Hasta entonces la cuenta sigue vigente (salvo que la desactives aparte).`,
                              )
                            ) {
                              return;
                            }
                            run(() => requestAdminUserDeletion(u.id));
                          }}
                        >
                          Solicitar baja
                        </Button>
                      ) : null}
                      {canApproveRemoval ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={pending}
                          onClick={() => {
                            if (
                              !window.confirm(
                                `Aprobar baja administrativa de ${u.email}?\n\nLa cuenta quedará inactiva, marcada como dada de baja y sin acceso al login. El registro se conserva para auditoría.`,
                              )
                            ) {
                              return;
                            }
                            run(() => approveAdminUserDeletion(u.id));
                          }}
                        >
                          Aprobar baja
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
