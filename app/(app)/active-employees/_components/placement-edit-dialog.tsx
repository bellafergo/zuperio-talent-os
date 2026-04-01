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
import { updatePlacement, type PlacementActionState } from "@/lib/placements/actions";
import type { PlacementListRowUi } from "@/lib/placements/types";
import type {
  PlacementCandidateOption,
  PlacementVacancyOption,
} from "@/lib/placements/queries";

import { PlacementRecordFormFields } from "./placement-record-form-fields";

export function PlacementEditDialog({
  row,
  candidates,
  vacancies,
}: {
  row: PlacementListRowUi;
  candidates: PlacementCandidateOption[];
  vacancies: PlacementVacancyOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState<PlacementActionState | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const result = await updatePlacement(null, fd);
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
        className="gap-1.5"
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
            <DialogTitle>Edit placement</DialogTitle>
            <DialogDescription>
              Update assignment dates, status, and rates. Changes apply immediately
              after you save.
            </DialogDescription>
          </DialogHeader>
          <form key={formKey} onSubmit={onSubmit} className="space-y-4">
            <PlacementRecordFormFields
              placementId={row.id}
              candidates={candidates}
              vacancies={vacancies}
              defaults={{
                candidateId: row.candidateId,
                vacancyId: row.vacancyId,
                companyId: row.companyId,
                startDateValue: row.startDateValue,
                endDateValue: row.endDateValue,
                statusValue: row.statusValue,
                rateClientAmount: row.rateClientAmount,
                rateCandidateAmount: row.rateCandidateAmount,
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

