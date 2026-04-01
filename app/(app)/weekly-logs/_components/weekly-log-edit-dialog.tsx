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
import {
  updateWeeklyLog,
  type WeeklyLogActionState,
} from "@/lib/weekly-logs/actions";
import type { WeeklyLogListRowUi, WeeklyLogPlacementOption } from "@/lib/weekly-logs/types";

import { WeeklyLogRecordFormFields } from "./weekly-log-record-form-fields";

export function WeeklyLogEditDialog({
  row,
  placements,
}: {
  row: WeeklyLogListRowUi;
  placements: WeeklyLogPlacementOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState<WeeklyLogActionState | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const result = await updateWeeklyLog(null, fd);
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
            <DialogTitle>Edit weekly log</DialogTitle>
            <DialogDescription>
              Update the week, narrative, hours, and status. Changes apply immediately
              after you save.
            </DialogDescription>
          </DialogHeader>
          <form key={formKey} onSubmit={onSubmit} className="space-y-4">
            <WeeklyLogRecordFormFields
              weeklyLogId={row.id}
              placements={placements}
              defaults={{
                placementId: row.placementId,
                weekStartValue: row.weekStartValue,
                weekEndValue: row.weekEndValue,
                statusValue: row.statusValue,
                hoursTotalAmount: row.hoursTotalAmount,
                summary: row.summary,
                achievements: row.achievements,
                blockers: row.blockers,
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

