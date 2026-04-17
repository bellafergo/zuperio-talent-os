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
import {
  addContactMethod,
  type ContactMethodActionState,
} from "@/lib/contacts/contact-method-actions";
import { cn } from "@/lib/utils";

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
);

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "EMAIL", label: "Correo" },
  { value: "PHONE", label: "Teléfono" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "LINKEDIN", label: "LinkedIn" },
];

export function ContactAddMethodDialog({ contactId }: { contactId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState<ContactMethodActionState | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const result = await addContactMethod(null, fd);
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
        variant="secondary"
        size="sm"
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="size-3.5" aria-hidden />
        Agregar dato de contacto
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
            <DialogTitle>Agregar dato de contacto</DialogTitle>
            <DialogDescription>
              Se guarda un registro nuevo. No reemplaza el historial anterior. Si
              marcas principal, actualiza el correo o teléfono mostrado en la
              ficha (según el tipo).
            </DialogDescription>
          </DialogHeader>
          <form key={formKey} onSubmit={onSubmit} className="space-y-4">
            <input type="hidden" name="contactId" value={contactId} />

            <div className="space-y-2">
              <label htmlFor={`cm-type-${contactId}`} className="text-sm font-medium">
                Tipo <span className="text-destructive">*</span>
              </label>
              <select
                id={`cm-type-${contactId}`}
                name="type"
                required
                className={selectClass}
                defaultValue="EMAIL"
                aria-invalid={Boolean(state?.ok === false && state.fieldErrors?.type)}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {state?.ok === false && state.fieldErrors?.type ? (
                <p className="text-sm text-destructive" role="alert">
                  {state.fieldErrors.type}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor={`cm-value-${contactId}`} className="text-sm font-medium">
                Valor <span className="text-destructive">*</span>
              </label>
              <Input
                id={`cm-value-${contactId}`}
                name="value"
                required
                maxLength={500}
                placeholder="correo, número, URL…"
                aria-invalid={Boolean(state?.ok === false && state.fieldErrors?.value)}
              />
              {state?.ok === false && state.fieldErrors?.value ? (
                <p className="text-sm text-destructive" role="alert">
                  {state.fieldErrors.value}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor={`cm-label-${contactId}`} className="text-sm font-medium">
                Etiqueta (opcional)
              </label>
              <Input
                id={`cm-label-${contactId}`}
                name="label"
                maxLength={120}
                placeholder="Ej. Oficina, Móvil personal"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={`cm-notes-${contactId}`} className="text-sm font-medium">
                Nota interna (opcional)
              </label>
              <textarea
                id={`cm-notes-${contactId}`}
                name="notes"
                rows={2}
                maxLength={2000}
                className={cn(
                  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none",
                  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  "dark:bg-input/30",
                )}
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" name="makePrimary" className="size-4 rounded border-input" />
              Marcar como principal de este tipo
            </label>

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
