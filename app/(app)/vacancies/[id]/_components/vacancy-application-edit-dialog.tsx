"use client";

import * as React from "react";
import { PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  VacancyApplicationStage as StageConst,
  VacancyApplicationStatus as StatusConst,
  type VacancyApplicationStage,
  type VacancyApplicationStatus,
} from "@/generated/prisma/enums";
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
  updateVacancyApplication,
  type ApplicationActionState,
} from "@/lib/vacancy-applications/actions";
import type { VacancyPipelineRowUi } from "@/lib/vacancy-applications/types";
import { cn } from "@/lib/utils";

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
);

const STAGE_LABELS: Record<VacancyApplicationStage, string> = {
  NEW: "New",
  PRE_SCREEN: "Pre-screen",
  INTERNAL_INTERVIEW: "Internal interview",
  CLIENT_INTERVIEW: "Client interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const STATUS_LABELS: Record<VacancyApplicationStatus, string> = {
  ACTIVE: "Active",
  CLOSED: "Closed",
};

export function VacancyApplicationEditDialog({
  row,
}: {
  row: VacancyPipelineRowUi;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [formKey, setFormKey] = React.useState(0);
  const [state, setState] = React.useState<ApplicationActionState | null>(null);
  const [pending, startTransition] = React.useTransition();

  const stageOrder = Object.values(StageConst) as VacancyApplicationStage[];
  const statusOrder = Object.values(StatusConst) as VacancyApplicationStatus[];

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const result = await updateVacancyApplication(null, fd);
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
        <DialogContent className="sm:max-w-lg" showCloseButton>
          <DialogHeader>
            <DialogTitle>Edit application</DialogTitle>
            <DialogDescription>
              Update stage, status, and metadata for this candidate in the vacancy
              pipeline.
            </DialogDescription>
          </DialogHeader>
          <form key={formKey} onSubmit={onSubmit} className="space-y-4">
            <input type="hidden" name="applicationId" value={row.applicationId} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Stage</label>
                <select
                  name="stage"
                  className={selectClass}
                  defaultValue={uiStageToPrisma(row.stage)}
                  aria-invalid={Boolean(state?.ok === false && state.fieldErrors?.stage)}
                >
                  {stageOrder.map((s) => (
                    <option key={s} value={s}>
                      {STAGE_LABELS[s]}
                    </option>
                  ))}
                </select>
                {state?.ok === false && state.fieldErrors?.stage ? (
                  <p className="text-sm text-destructive" role="alert">
                    {state.fieldErrors.stage}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  name="status"
                  className={selectClass}
                  defaultValue={uiStatusToPrisma(row.status)}
                  aria-invalid={Boolean(state?.ok === false && state.fieldErrors?.status)}
                >
                  {statusOrder.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                {state?.ok === false && state.fieldErrors?.status ? (
                  <p className="text-sm text-destructive" role="alert">
                    {state.fieldErrors.status}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <Input
                name="source"
                defaultValue={row.source ?? ""}
                aria-invalid={Boolean(state?.ok === false && state.fieldErrors?.source)}
              />
              {state?.ok === false && state.fieldErrors?.source ? (
                <p className="text-sm text-destructive" role="alert">
                  {state.fieldErrors.source}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                name="notes"
                defaultValue={row.notes ?? ""}
                rows={4}
                className={cn(
                  "w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none",
                  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                  "dark:bg-input/30",
                )}
              />
            </div>

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
                {pending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function uiStageToPrisma(stage: VacancyPipelineRowUi["stage"]): VacancyApplicationStage {
  switch (stage) {
    case "New":
      return "NEW";
    case "Pre-screen":
      return "PRE_SCREEN";
    case "Internal interview":
      return "INTERNAL_INTERVIEW";
    case "Client interview":
      return "CLIENT_INTERVIEW";
    case "Offer":
      return "OFFER";
    case "Hired":
      return "HIRED";
    case "Rejected":
      return "REJECTED";
    case "Withdrawn":
      return "WITHDRAWN";
  }
}

function uiStatusToPrisma(status: VacancyPipelineRowUi["status"]): VacancyApplicationStatus {
  return status === "Active" ? "ACTIVE" : "CLOSED";
}

