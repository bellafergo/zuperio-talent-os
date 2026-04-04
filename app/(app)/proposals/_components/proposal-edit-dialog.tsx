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
import { updateProposal, type ProposalActionState } from "@/lib/proposals/actions";
import type {
  ProposalCandidateOption,
  ProposalCompanyOption,
  ProposalDetailUi,
  ProposalOpportunityOption,
  ProposalVacancyOption,
} from "@/lib/proposals/types";

import { ProposalRecordFormFields } from "./proposal-record-form-fields";

export function ProposalEditDialog({
  proposal,
  companies,
  opportunities,
  vacancies,
  candidates,
}: {
  proposal: ProposalDetailUi;
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
      const result = await updateProposal(null, fd);
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
        Editar
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
        <DialogContent
          className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
          showCloseButton
        >
          <DialogHeader className="shrink-0 space-y-2 px-4 pt-4 pb-2 pr-14">
            <DialogTitle>Editar propuesta</DialogTitle>
            <DialogDescription>
              Actualiza selección, precios y textos. Los importes se recalculan al
              guardar.
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
                  proposalId={proposal.id}
                  companies={companies}
                  opportunities={opportunities}
                  vacancies={vacancies}
                  candidates={candidates}
                  defaults={{
                    companyId: proposal.companyId,
                    opportunityId: proposal.opportunityId,
                    vacancyId: proposal.vacancyId,
                    candidateId: proposal.candidateId,
                    typeValue: proposal.typeValue,
                    formatValue: proposal.formatValue,
                    statusValue: proposal.statusValue,
                    currency: proposal.currency,
                    validityDays: proposal.validityDays,
                    executiveSummary: proposal.executiveSummary ?? "",
                    profileSummary: proposal.profileSummary ?? "",
                    scopeNotes: proposal.scopeNotes ?? "",
                    commercialNotes: proposal.commercialNotes ?? "",
                    monthlyHours: proposal.pricing?.monthlyHours ?? 160,
                    candidateNetSalary: proposal.pricing?.candidateNetSalary ?? null,
                    schemeValue: proposal.pricing?.schemeValue ?? "MIXED",
                    marginPercent: proposal.pricing?.marginPercent ?? null,
                    employerLoadPercent: proposal.pricing?.employerLoadPercent ?? null,
                    bonuses: proposal.pricing?.bonuses ?? null,
                    benefits: proposal.pricing?.benefits ?? null,
                    operatingExpenses: proposal.pricing?.operatingExpenses ?? null,
                    discountPercent: proposal.pricing?.discountPercent ?? null,
                    estimatedDurationMonths:
                      proposal.pricing?.estimatedDurationMonths ?? 6,
                    vatPercent: proposal.pricing?.vatPercent ?? null,
                    fullImssGrossFactor:
                      proposal.pricing?.fullImssGrossFactor ?? null,
                  }}
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
                {pending ? "Guardando…" : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

