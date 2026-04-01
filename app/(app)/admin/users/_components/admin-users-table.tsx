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
import { setAdminUserActive } from "@/lib/admin-users/actions";
import type { AdminUserRow } from "@/lib/admin-users/types";
import { roleLabel } from "@/lib/auth/access";

import { AdminUserEditDialog } from "./admin-user-edit-dialog";

export function AdminUsersTable({
  users,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function runToggle(userId: string, nextActive: boolean) {
    startTransition(async () => {
      const result = await setAdminUserActive(userId, nextActive);
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
            <TableHead className="w-[140px]">Rol</TableHead>
            <TableHead className="w-[120px]">Estado</TableHead>
            <TableHead className="w-[180px] whitespace-nowrap">Alta</TableHead>
            <TableHead className="w-[280px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                No hay usuarios. Crea el primero con &quot;Nuevo usuario&quot;.
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.name?.trim() ? u.name : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>{roleLabel(u.role)}</TableCell>
                  <TableCell>
                    {u.isActive ? (
                      <Badge variant="secondary">Activo</Badge>
                    ) : (
                      <Badge variant="outline">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums text-sm text-muted-foreground">
                    {u.createdAtLabel}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <AdminUserEditDialog user={u} currentUserId={currentUserId} />
                      {u.isActive ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
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
                            runToggle(u.id, false);
                          }}
                        >
                          Desactivar
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={pending}
                          onClick={() => runToggle(u.id, true)}
                        >
                          Activar
                        </Button>
                      )}
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
