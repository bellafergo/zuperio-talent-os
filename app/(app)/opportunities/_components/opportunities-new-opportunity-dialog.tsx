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
import {
  createOpportunity,
  type OpportunityActionState,
} from "@/lib/opportunities/actions";
import type {
  OpportunityCompanyOption,
  OpportunityOwnerOption,
} from "@/lib/opportunities/queries";

import { OpportunityRecordFormFields } from "./opportunity-record-form-fields";

export function OpportunitiesNewOpportunityDialog({
  companies,
  owners,
}: {
  companies: OpportunityCompanyOption[];
  owners: OpportunityOwnerOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState<OpportunityActionState | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const result = await createOpportunity(null, fd);
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
          New Opportunity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>New opportunity</DialogTitle>
          <DialogDescription>
            Create a deal linked to a company. Stage is required; value is optional.
          </DialogDescription>
        </DialogHeader>
        <form key={formKey} onSubmit={onSubmit} className="space-y-4">
          <OpportunityRecordFormFields
            companies={companies}
            owners={owners}
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
              {pending ? "Saving…" : "Create opportunity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

