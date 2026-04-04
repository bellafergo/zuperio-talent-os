"use client";

import { PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";

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
import { updateCandidate, type CandidateActionState } from "@/lib/candidates/actions";
import type { CvAutofillProvenanceField } from "@/lib/candidates/cv-autofill-types";
import type { CandidateEditData } from "@/lib/candidates/queries";
import type { CandidateSkillDraft } from "@/lib/candidates/validation";
import type { SkillOption } from "@/lib/skills/queries";
import type { OpenVacancyOptionForCandidateForm } from "@/lib/vacancies/queries";

import { CandidateRecordFormFields } from "./candidate-record-form-fields";

export function CandidateEditDialog({
  candidate,
  skillsCatalog,
  openVacancies = [],
  hideDefaultTrigger = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  candidate: CandidateEditData;
  skillsCatalog: SkillOption[];
  openVacancies?: OpenVacancyOptionForCandidateForm[];
  hideDefaultTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const router = useRouter();
  const autofillFormRef = useRef<HTMLFormElement>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled =
    controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = controlled ? controlledOpen : internalOpen;
  const setOpen = controlled ? controlledOnOpenChange : setInternalOpen;
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState<CandidateActionState | null>(null);
  const [pending, startTransition] = useTransition();
  const [cvAutofill, setCvAutofill] = useState<{
    applyId: number;
    patch: Partial<CandidateEditData>;
    extraSkills: CandidateSkillDraft[];
    provenanceKeys: CvAutofillProvenanceField[];
    skillsAddedLastApply: number;
  }>({
    applyId: 0,
    patch: {},
    extraSkills: [],
    provenanceKeys: [],
    skillsAddedLastApply: 0,
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const result = await updateCandidate(null, fd);
      setState(result);
      if (result.ok) {
        setOpen(false);
        router.refresh();
      }
    });
  }

  function openDialog() {
    setOpen(true);
  }

  return (
    <>
      {!hideDefaultTrigger ? (
        <Button
          id="candidate-detail-edit-trigger"
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={openDialog}
        >
          <PencilIcon className="size-3.5" aria-hidden />
          Editar
        </Button>
      ) : null}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            setFormKey((k) => k + 1);
            setState(null);
            setCvAutofill({
              applyId: 0,
              patch: {},
              extraSkills: [],
              provenanceKeys: [],
              skillsAddedLastApply: 0,
            });
          }
        }}
      >
        <DialogContent
          className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
          showCloseButton
        >
          <DialogHeader className="shrink-0 space-y-2 px-4 pt-4 pb-2 pr-14">
            <DialogTitle>Editar candidato</DialogTitle>
            <DialogDescription>
              Actualiza el perfil, datos de contacto y competencias estructuradas.
            </DialogDescription>
          </DialogHeader>
          <form
            ref={autofillFormRef}
            key={formKey}
            onSubmit={onSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-2 pr-3">
              <div className="space-y-4">
                <CandidateRecordFormFields
                  skillsCatalog={skillsCatalog}
                  defaults={candidate}
                  candidateId={candidate.id}
                  openVacancies={openVacancies}
                  formResetKey={formKey}
                  enableCvSection
                  autofillFormRef={autofillFormRef}
                  cvAutofillApplyId={cvAutofill.applyId}
                  cvAutofillPatch={cvAutofill.patch}
                  cvAutofillExtraSkills={cvAutofill.extraSkills}
                  cvAutofillProvenanceKeys={cvAutofill.provenanceKeys}
                  cvAutofillSkillsAddedLastApply={cvAutofill.skillsAddedLastApply}
                  onCvAutofillApplied={(payload) => {
                    setCvAutofill((prev) => {
                      if (payload.applyValues) {
                        return {
                          applyId: prev.applyId + 1,
                          patch: { ...prev.patch, ...payload.patch },
                          extraSkills: payload.extraStructuredSkills,
                          provenanceKeys: [
                            ...new Set([
                              ...prev.provenanceKeys,
                              ...payload.provenanceKeys,
                            ]),
                          ],
                          skillsAddedLastApply: payload.structuredSkillsAddedCount,
                        };
                      }
                      return {
                        ...prev,
                        skillsAddedLastApply: payload.structuredSkillsAddedCount,
                      };
                    });
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
