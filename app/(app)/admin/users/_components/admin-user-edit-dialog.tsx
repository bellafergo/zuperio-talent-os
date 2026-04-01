"use client";

import { PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import type { AdminUserRow } from "@/lib/admin-users/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { updateAdminUser } from "@/lib/admin-users/actions";
import type { AdminUserActionState } from "@/lib/admin-users/types";
import { roleLabel } from "@/lib/auth/access";
import { cn } from "@/lib/utils";

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "dark:bg-input/30",
);

export function AdminUserEditDialog({
  user,
  currentUserId,
}: {
  user: AdminUserRow;
  currentUserId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState<AdminUserActionState | null>(null);
  const [pending, startTransition] = useTransition();

  const isSelf = user.id === currentUserId;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const result = await updateAdminUser(null, fd);
      setState(result);
      if (result.ok) {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={() => setOpen(true)}
      >
        <PencilIcon className="size-3.5" aria-hidden />
        Editar
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            setFormKey((k) => k + 1);
            setState(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              {isSelf
                ? "No puedes desactivarte ni dejar de ser Director desde aquí."
                : "Cambios en nombre, correo, rol y estado de la cuenta."}
            </DialogDescription>
          </DialogHeader>
          <form key={formKey} onSubmit={onSubmit} className="space-y-4">
            <input type="hidden" name="userId" value={user.id} />
            <div className="space-y-2">
              <label htmlFor={`edit-name-${user.id}`} className="text-sm font-medium">
                Nombre
              </label>
              <Input
                id={`edit-name-${user.id}`}
                name="name"
                maxLength={200}
                defaultValue={user.name ?? ""}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={`edit-email-${user.id}`} className="text-sm font-medium">
                Correo <span className="text-destructive">*</span>
              </label>
              <Input
                id={`edit-email-${user.id}`}
                name="email"
                type="email"
                required
                defaultValue={user.email}
                aria-invalid={Boolean(state?.ok === false && state.fieldErrors?.email)}
              />
              {state?.ok === false && state.fieldErrors?.email ? (
                <p className="text-sm text-destructive" role="alert">
                  {state.fieldErrors.email}
                </p>
              ) : null}
            </div>
            {isSelf ? (
              <>
                <input type="hidden" name="role" value={user.role} />
                <input
                  type="hidden"
                  name="isActive"
                  value={user.isActive ? "true" : "false"}
                />
                <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Rol:</span>{" "}
                  {roleLabel(user.role)} — no editable en tu propia cuenta.
                  <br />
                  <span className="font-medium text-foreground">Estado:</span>{" "}
                  {user.isActive ? "Activo" : "Inactivo"} — usa otro director para
                  cambios de rol o desactivación.
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor={`edit-role-${user.id}`} className="text-sm font-medium">
                    Rol <span className="text-destructive">*</span>
                  </label>
                  <select
                    id={`edit-role-${user.id}`}
                    name="role"
                    required
                    className={selectClass}
                    defaultValue={user.role}
                  >
                    <option value="SALES">Ventas</option>
                    <option value="RECRUITER">Reclutamiento</option>
                    <option value="DIRECTOR">Dirección</option>
                  </select>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={user.isActive}
                    className="size-4 rounded border-input"
                  />
                  Cuenta activa (puede iniciar sesión)
                </label>
              </>
            )}
            {state?.ok === false && state.message ? (
              <p className="text-sm text-destructive" role="alert">
                {state.message}
              </p>
            ) : null}
            <DialogFooter className="border-0 bg-transparent p-0 sm:justify-end gap-2 sm:gap-2">
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={pending}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
