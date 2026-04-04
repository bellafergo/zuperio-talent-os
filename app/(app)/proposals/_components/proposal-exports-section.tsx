"use client";

import { SectionCard } from "@/components/layout";
import type { ProposalDetailUi } from "@/lib/proposals/types";

import { ProposalCvDownloadButton } from "./proposal-cv-download-button";
import { ProposalPdfDownloadButton } from "./proposal-pdf-download-button";

function formatExportTimestamp(iso: string | null): { label: string; detail: string } {
  if (!iso) {
    return {
      label: "Sin exportación registrada",
      detail:
        "Aún no se ha generado correctamente un PDF desde la app (o es un registro antiguo). Usa «Descargar PDF» para crear el archivo; al terminar, aquí verás la fecha.",
    };
  }
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return {
        label: "Listo",
        detail: "Última generación registrada (fecha no legible).",
      };
    }
    const formatted = new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(d);
    return {
      label: "Listo",
      detail: `Última generación exitosa: ${formatted} UTC`,
    };
  } catch {
    return {
      label: "Listo",
      detail: "Última generación registrada (error al formatear fecha).",
    };
  }
}

export function ProposalExportsSection({ proposal }: { proposal: ProposalDetailUi }) {
  const proposalId =
    typeof proposal?.id === "string" && proposal.id.trim() ? proposal.id.trim() : "";
  const pdfIso =
    proposal?.proposalPdfExportedAt === null ||
    typeof proposal?.proposalPdfExportedAt === "string"
      ? proposal.proposalPdfExportedAt
      : null;
  const cvIso =
    proposal?.candidateCvExportedAt === null ||
    typeof proposal?.candidateCvExportedAt === "string"
      ? proposal.candidateCvExportedAt
      : null;
  const pdfStatus = formatExportTimestamp(pdfIso);
  const cvStatus = formatExportTimestamp(cvIso);

  if (!proposalId) {
    return (
      <p className="text-sm text-muted-foreground">
        No se pudo mostrar exportaciones: identificador de propuesta no válido.
      </p>
    );
  }

  return (
    <SectionCard
      title="Documentos para el cliente"
      description="Vista previa en esta pestaña; la descarga ejecuta la misma plantilla en el servidor (sin IA)."
    >
      <div className="mb-6 grid gap-4 rounded-xl border border-border/80 bg-muted/20 p-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Propuesta económica (PDF)
          </p>
          <p className="text-sm font-medium text-foreground">{pdfStatus.label}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {pdfStatus.detail}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            CV del candidato (PDF)
          </p>
          <p className="text-sm font-medium text-foreground">
            {proposal.candidateId ? cvStatus.label : "Sin candidato"}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {proposal.candidateId
              ? cvStatus.detail
              : "Vincula un candidato a la propuesta para habilitar el CV."}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <ProposalPdfDownloadButton proposalId={proposalId} />
        {typeof proposal.candidateId === "string" && proposal.candidateId.trim() ? (
          <ProposalCvDownloadButton candidateId={proposal.candidateId.trim()} />
        ) : null}
      </div>
    </SectionCard>
  );
}
