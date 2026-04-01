"use client";

import { PencilIcon } from "lucide-react";
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
import type { SkillOption } from "@/lib/skills/queries";
import { updateVacancy, type VacancyActionState } from "@/lib/vacancies/actions";
import type {
  OpportunityOptionForVacancyForm,
  VacancyEditData,
} from "@/lib/vacancies/queries";

import { VacancyRecordFormFields } from "./vacancy-record-form-fields";

export function VacancyEditDialog({
  vacancy,
  opportunities,
  skills,
}: {
  vacancy: VacancyEditData;
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
      const result = await updateVacancy(null, fd);
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
        className="shrink-0 gap-1.5"
        onClick={() => setOpen(true)}
      >
        <PencilIcon className="size-3.5" aria-hidden />
        Edit
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
        <DialogContent className="sm:max-w-2xl" showCloseButton>
          <DialogHeader>
            <DialogTitle>Edit vacancy</DialogTitle>
            <DialogDescription>
              Update core fields and structured requirements.
            </DialogDescription>
          </DialogHeader>
          <form key={formKey} onSubmit={onSubmit} className="space-y-4">
            <VacancyRecordFormFields
              opportunities={opportunities}
              skills={skills}
              vacancyId={vacancy.id}
              defaults={{
                title: vacancy.title,
                opportunityId: vacancy.opportunityId,
                seniorityValue: vacancy.seniorityValue,
                statusValue: vacancy.statusValue,
                targetRateAmount: vacancy.targetRateAmount,
                currency: vacancy.currency,
                roleSummaryLine: vacancy.roleSummaryLine,
                requirements: vacancy.requirements,
              }}
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
                {pending ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

