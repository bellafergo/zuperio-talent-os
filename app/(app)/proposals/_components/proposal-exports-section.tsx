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
  const formatted = new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
  return {
    label: "Listo",
    detail: `Última generación exitosa: ${formatted} UTC`,
  };
}

export function ProposalExportsSection({ proposal }: { proposal: ProposalDetailUi }) {
  const pdfStatus = formatExportTimestamp(proposal.proposalPdfExportedAt);
  const cvStatus = formatExportTimestamp(proposal.candidateCvExportedAt);

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
        <ProposalPdfDownloadButton proposalId={proposal.id} />
        {proposal.candidateId ? (
          <ProposalCvDownloadButton candidateId={proposal.candidateId} />
        ) : null}
      </div>
    </SectionCard>
  );
}
