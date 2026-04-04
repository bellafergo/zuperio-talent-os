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
import { createProposal, type ProposalActionState } from "@/lib/proposals/actions";
import type {
  ProposalCandidateOption,
  ProposalCompanyOption,
  ProposalOpportunityOption,
  ProposalVacancyOption,
} from "@/lib/proposals/types";

import { ProposalRecordFormFields } from "./proposal-record-form-fields";

export function ProposalsNewProposalDialog({
  companies,
  opportunities,
  vacancies,
  candidates,
}: {
  companies: ProposalCompanyOption[];
  opportunities: ProposalOpportunityOption[];
  vacancies: ProposalVacancyOption[];
  candidates: ProposalCandidateOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState<ProposalActionState | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const result = await createProposal(null, fd);
      setState(result);
      if (result.ok) {
        setOpen(false);
        form.reset();
        if (result.proposalId) {
          router.push(`/proposals/${result.proposalId}`);
        } else {
          router.refresh();
        }
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
          Nueva propuesta
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
        showCloseButton
      >
        <DialogHeader className="shrink-0 space-y-2 px-4 pt-4 pb-2 pr-14">
          <DialogTitle>Nueva propuesta</DialogTitle>
          <DialogDescription>
            Constructor manual. Precios deterministas; textos editables sin IA.
          </DialogDescription>
        </DialogHeader>
        <form
          key={formKey}
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-2 pr-3">
            <div className="space-y-4">
              <ProposalRecordFormFields
                companies={companies}
                opportunities={opportunities}
                vacancies={vacancies}
                candidates={candidates}
                fieldErrors={state?.ok === false ? state.fieldErrors : undefined}
              />

              {state?.ok === false && state.message ? (
                <p className="text-sm text-destructive" role="alert">
                  {state.message}
                </p>
              ) : null}
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 mt-0 shrink-0 gap-2 border-t bg-background px-4 pt-3 pb-4 sm:flex-row sm:justify-end sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={pending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Crear propuesta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

