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
  DialogTrigger,
} from "@/components/ui/dialog";
import { createContact, type ContactActionState } from "@/lib/contacts/actions";
import type { CompanyOption } from "@/lib/contacts/types";

import { ContactRecordFormFields } from "./contact-record-form-fields";

export function ContactsNewContactDialog({ companies }: { companies: CompanyOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState<ContactActionState | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const result = await createContact(null, fd);
      setState(result);
      if (result.ok) {
        setOpen(false);
        form.reset();
        router.refresh();
      }
    });
  }

  return (
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
      <DialogTrigger asChild>
        <Button type="button" className="shrink-0 gap-1.5">
          <PlusIcon className="size-4" aria-hidden />
          New Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>New contact</DialogTitle>
          <DialogDescription>
            Add a person to an account. First name, company, and status are required.
          </DialogDescription>
        </DialogHeader>
        <form key={formKey} onSubmit={onSubmit} className="space-y-4">
          <ContactRecordFormFields
            companies={companies}
            fieldErrors={state?.ok === false ? state.fieldErrors : undefined}
          />

          {state?.ok === false && state.message ? (
            <p className="text-sm text-destructive" role="alert">
              {state.message}
            </p>
          ) : null}

          <DialogFooter className="border-0 bg-transparent p-0 sm:justify-end gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Create contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

