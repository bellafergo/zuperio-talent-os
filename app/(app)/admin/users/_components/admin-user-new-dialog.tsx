"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

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
import { createAdminUser } from "@/lib/admin-users/actions";
import type { AdminUserActionState } from "@/lib/admin-users/types";
import { cn } from "@/lib/utils";

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "dark:bg-input/30",
);

export function AdminUserNewDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState<AdminUserActionState | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const result = await createAdminUser(null, fd);
      setState(result);
      if (result.ok) {
        setOpen(false);
        form.reset();
        router.refresh();
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        className="shrink-0 gap-1.5"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="size-4" aria-hidden />
        Nuevo usuario
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
            <DialogTitle>Nuevo usuario interno</DialogTitle>
            <DialogDescription>
              Contraseña temporal: compártela por un canal seguro. El usuario
              deberá iniciar sesión con correo y esta contraseña.
            </DialogDescription>
          </DialogHeader>
          <form key={formKey} onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="new-user-name" className="text-sm font-medium">
                Nombre
              </label>
              <Input
                id="new-user-name"
                name="name"
                maxLength={200}
                placeholder="Nombre completo"
                aria-invalid={Boolean(state?.ok === false && state.fieldErrors?.name)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-user-email" className="text-sm font-medium">
                Correo <span className="text-destructive">*</span>
              </label>
              <Input
                id="new-user-email"
                name="email"
                type="email"
                required
                autoComplete="off"
                aria-invalid={Boolean(state?.ok === false && state.fieldErrors?.email)}
              />
              {state?.ok === false && state.fieldErrors?.email ? (
                <p className="text-sm text-destructive" role="alert">
                  {state.fieldErrors.email}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label htmlFor="new-user-role" className="text-sm font-medium">
                Rol <span className="text-destructive">*</span>
              </label>
              <select
                id="new-user-role"
                name="role"
                required
                className={selectClass}
                defaultValue="RECRUITER"
              >
                <option value="SALES">Ventas</option>
                <option value="RECRUITER">Reclutamiento</option>
                <option value="DIRECTOR">Dirección</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="new-user-password" className="text-sm font-medium">
                Contraseña temporal <span className="text-destructive">*</span>
              </label>
              <Input
                id="new-user-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                aria-invalid={Boolean(state?.ok === false && state.fieldErrors?.password)}
              />
              {state?.ok === false && state.fieldErrors?.password ? (
                <p className="text-sm text-destructive" role="alert">
                  {state.fieldErrors.password}
                </p>
              ) : null}
            </div>
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
                {pending ? "Creando…" : "Crear usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
