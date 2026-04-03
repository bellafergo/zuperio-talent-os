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
import { updateCandidate, type CandidateActionState } from "@/lib/candidates/actions";
import type { CandidateEditData } from "@/lib/candidates/queries";
import type { SkillOption } from "@/lib/skills/queries";

import { CandidateRecordFormFields } from "./candidate-record-form-fields";

export function CandidateEditDialog({
  candidate,
  skillsCatalog,
}: {
  candidate: CandidateEditData;
  skillsCatalog: SkillOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState<CandidateActionState | null>(null);
  const [pending, startTransition] = useTransition();

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
        <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90dvh] overflow-hidden" showCloseButton>
          <DialogHeader className="shrink-0">
            <DialogTitle>Editar candidato</DialogTitle>
            <DialogDescription>
              Actualiza el perfil, datos de contacto y competencias estructuradas.
            </DialogDescription>
          </DialogHeader>
          <form key={formKey} onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto -mx-4 px-4 py-1">
              <div className="space-y-4 pb-2">
                <CandidateRecordFormFields
                  skillsCatalog={skillsCatalog}
                  defaults={candidate}
                  candidateId={candidate.id}
                  fieldErrors={state?.ok === false ? state.fieldErrors : undefined}
                />
                {state?.ok === false && state.message ? (
                  <p className="text-sm text-destructive" role="alert">
                    {state.message}
                  </p>
                ) : null}
              </div>
            </div>
            <DialogFooter className="shrink-0 sm:justify-end gap-2 sm:gap-2">
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={pending}>
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

