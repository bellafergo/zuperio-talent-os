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
import type { SkillOption } from "@/lib/skills/queries";
import {
  createVacancy,
  type VacancyActionState,
} from "@/lib/vacancies/actions";
import type { OpportunityOptionForVacancyForm } from "@/lib/vacancies/queries";
import type { CompanyOption } from "@/lib/vacancies/types";

import { VacancyRecordFormFields } from "./vacancy-record-form-fields";

export function VacanciesNewVacancyDialog({
  companies,
  opportunities,
  skills,
}: {
  companies: CompanyOption[];
  opportunities: OpportunityOptionForVacancyForm[];
  skills: SkillOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState<VacancyActionState | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const result = await createVacancy(null, fd);
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
          New Vacancy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>New vacancy</DialogTitle>
          <DialogDescription>
            Create a role linked to an opportunity. Requirements are stored as
            structured skill rows.
          </DialogDescription>
        </DialogHeader>
        <form key={formKey} onSubmit={onSubmit} className="space-y-4">
          <VacancyRecordFormFields
            companies={companies}
            opportunities={opportunities}
            skills={skills}
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
              {pending ? "Saving…" : "Create vacancy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

