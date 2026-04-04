"use client";

import { FileUpIcon, LinkIcon, PencilIcon, ScrollTextIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/layout";
import type { CandidateAvailabilityUi } from "@/lib/candidates/types";
import { cn } from "@/lib/utils";

function clickElementById(id: string) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.click();
}

function scrollToSection(id: string) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const SECTION_RECLUTAMIENTO = "candidate-section-reclutamiento";
const SECTION_CV = "candidate-section-cv";
const TRIGGER_EDIT = "candidate-detail-edit-trigger";
const TRIGGER_PROPOSAL = "candidate-detail-proposal-trigger";

export function CandidateSuggestedActions({
  canManage,
  canProposals,
  hasEditData,
  hasCvFile,
  pipelineVacancyId,
  availabilityStatus,
}: {
  canManage: boolean;
  canProposals: boolean;
  hasEditData: boolean;
  hasCvFile: boolean;
  pipelineVacancyId: string | null;
  availabilityStatus: CandidateAvailabilityUi;
}) {
  const hasLinkedVacancy = Boolean(pipelineVacancyId?.trim());
  const showEdit = canManage && hasEditData;
  const showProposal = canProposals;
  const showCvNav = canManage;
  const emphasizeVacancy = showEdit && !hasLinkedVacancy;
  const emphasizeCv = showCvNav && !hasCvFile;
  const availabilityBlocked = availabilityStatus === "No disponible";

  const editLabel = !hasLinkedVacancy ? "Vincular a vacante / editar ficha" : "Editar candidato";

  const proposalButton = showProposal ? (
    <Button
      key="proposal"
      type="button"
      variant={showEdit || showCvNav ? "outline" : "default"}
      size="sm"
      className="justify-start gap-2 sm:min-w-0"
      onClick={() => clickElementById(TRIGGER_PROPOSAL)}
    >
      <SparklesIcon className="size-4 shrink-0 opacity-80" aria-hidden />
      Crear propuesta
    </Button>
  ) : null;

  const editButton = showEdit ? (
    <Button
      key="edit"
      type="button"
      variant={emphasizeVacancy ? "default" : "outline"}
      size="sm"
      className={cn(
        "justify-start gap-2 sm:min-w-0",
        emphasizeVacancy && "ring-2 ring-primary/35",
      )}
      onClick={() => clickElementById(TRIGGER_EDIT)}
    >
      {!hasLinkedVacancy ? (
        <LinkIcon className="size-4 shrink-0 opacity-80" aria-hidden />
      ) : (
        <PencilIcon className="size-4 shrink-0 opacity-80" aria-hidden />
      )}
      {editLabel}
    </Button>
  ) : null;

  const cvButton = showCvNav ? (
    <Button
      key="cv"
      type="button"
      variant={emphasizeCv ? "default" : "outline"}
      size="sm"
      className={cn(
        "justify-start gap-2 sm:min-w-0",
        emphasizeCv && "ring-2 ring-primary/35",
      )}
      onClick={() => scrollToSection(SECTION_CV)}
    >
      <FileUpIcon className="size-4 shrink-0 opacity-80" aria-hidden />
      {hasCvFile ? "Reemplazar CV (abajo)" : "Subir CV (abajo)"}
    </Button>
  ) : null;

  const availButton = (
    <Button
      key="avail"
      type="button"
      variant="outline"
      size="sm"
      className="justify-start gap-2 sm:min-w-0"
      onClick={() => scrollToSection(SECTION_RECLUTAMIENTO)}
    >
      <ScrollTextIcon className="size-4 shrink-0 opacity-80" aria-hidden />
      Revisar disponibilidad
    </Button>
  );

  /** Priority: missing CV → missing vacancy link → rest (stable, no extra logic). */
  const orderedActions = [
    ...(emphasizeCv && cvButton ? [cvButton] : []),
    ...(emphasizeVacancy && editButton ? [editButton] : []),
    ...(showProposal ? [proposalButton] : []),
    ...(showEdit && !emphasizeVacancy && editButton ? [editButton] : []),
    ...(showCvNav && !emphasizeCv && cvButton ? [cvButton] : []),
    availButton,
  ];

  return (
    <SectionCard
      title="Acciones sugeridas"
      description="Atajos a las mismas acciones del encabezado y secciones de la ficha. Si un botón no responde, usa los controles superiores."
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{orderedActions}</div>

      {availabilityBlocked ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Disponibilidad actual: no disponible. Aún puedes editar la ficha, subir CV o crear una
          propuesta si tu rol lo permite.
        </p>
      ) : null}
    </SectionCard>
  );
}
