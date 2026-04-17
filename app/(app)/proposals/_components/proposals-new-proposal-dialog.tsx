"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";

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

import {
  ProposalRecordFormFields,
  type ProposalFormDefaults,
} from "./proposal-record-form-fields";

function mergeNewProposalFormDefaults(
  partial?: Partial<ProposalFormDefaults>,
): ProposalFormDefaults | undefined {
  if (!partial || Object.keys(partial).length === 0) return undefined;
  return {
    companyId: "",
    opportunityId: null,
    vacancyId: null,
    candidateId: null,
    typeValue: "STAFF_AUG",
    formatValue: "SIMPLE",
    statusValue: "DRAFT",
    currency: "MXN",
    validityDays: 14,
    executiveSummary: "",
    profileSummary: "",
    scopeNotes: "",
    commercialNotes: "",
    monthlyHours: 160,
    candidateNetSalary: null,
    schemeValue: "MIXED",
    marginPercent: null,
    employerLoadPercent: null,
    bonuses: null,
    benefits: null,
    operatingExpenses: null,
    discountPercent: null,
    estimatedDurationMonths: 6,
    vatPercent: undefined,
    fullImssGrossFactor: undefined,
    ...partial,
  };
}

export function ProposalsNewProposalDialog({
  companies,
  opportunities,
  vacancies,
  candidates,
  formDefaultsPartial,
  trigger,
  /** No trigger UI; parent controls `open` / `onOpenChange` (e.g. candidates list). */
  headless = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  dialogTitle = "Nueva propuesta",
  dialogDescription = "Constructor manual. Precios deterministas; textos editables sin IA.",
}: {
  companies: ProposalCompanyOption[];
  opportunities: ProposalOpportunityOption[];
  vacancies: ProposalVacancyOption[];
  candidates: ProposalCandidateOption[];
  formDefaultsPartial?: Partial<ProposalFormDefaults>;
  trigger?: ReactNode;
  headless?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  dialogTitle?: string;
  dialogDescription?: string;
}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = headless || (controlledOpen !== undefined && controlledOnOpenChange);
  const open = isControlled ? Boolean(controlledOpen) : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;
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

  const mergedDefaults = mergeNewProposalFormDefaults(formDefaultsPartial);

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
      {!headless ? (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button type="button" className="shrink-0 gap-1.5">
              <PlusIcon className="size-4" aria-hidden />
              Nueva propuesta
            </Button>
          )}
        </DialogTrigger>
      ) : null}
      <DialogContent
        className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
        showCloseButton
      >
        <DialogHeader className="shrink-0 space-y-2 px-4 pt-4 pb-2 pr-14">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
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
                defaults={mergedDefaults}
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

