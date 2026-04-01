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
import { createCompany, type CompanyActionState } from "@/lib/companies/actions";
import type { CompanyOwnerOption } from "@/lib/companies/queries";

import { CompanyRecordFormFields } from "./company-record-form-fields";

export function CompaniesNewCompanyDialog({
  users,
}: {
  users: CompanyOwnerOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState<CompanyActionState | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const result = await createCompany(null, fd);
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
          New Company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>New company</DialogTitle>
          <DialogDescription>
            Add an account to the directory. Name and status are required.
          </DialogDescription>
        </DialogHeader>
        <form key={formKey} onSubmit={onSubmit} className="space-y-4">
          <CompanyRecordFormFields
            users={users}
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
              {pending ? "Saving…" : "Create company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
