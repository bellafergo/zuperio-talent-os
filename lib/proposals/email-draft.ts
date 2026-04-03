import {
  proposalCandidateCvPdfFilename,
  proposalEconomicPdfFilename,
} from "./pdf-filename";
import type { ProposalDetailUi } from "./types";

export type ProposalEmailAttachmentPlaceholder = {
  kind: "ECONOMIC_PROPOSAL_PDF" | "CANDIDATE_CV_PDF";
  label: string;
  /** Short line under the title in the draft UI */
  subtitle: string;
  filenameSuggestion: string;
  mimeType: "application/pdf";
  /** True after at least one successful server-side export for this attachment type. */
  ready: boolean;
  /** ISO timestamp of last successful export. */
  lastExportedAt: string | null;
  /** Authenticated relative URL to download/regenerate PDF, or null if not applicable. */
  downloadHref: string | null;
};

export type ProposalEmailDraft = {
  recipientName: string;
  recipientEmail: string;
  subject: string;
  bodyPlainText: string;
  attachments: ProposalEmailAttachmentPlaceholder[];
};

export type ProposalEmailDraftContext = {
  preparedByDisplay: string;
  recipientDisplayName: string | null;
  recipientEmail: string | null;
  /** Cobertura % (skills requeridos) cuando la vacante tiene requisitos y hay matriz */
  matchScore?: number | null;
  /** Nombre de vacante para copy comercial del párrafo de match */
  vacancyTitleForMatch?: string | null;
};

/**
 * Deterministic, template-based copy for “send proposal”. No AI.
 */
export function buildProposalEmailDraft(
  proposal: ProposalDetailUi,
  ctx: ProposalEmailDraftContext,
): ProposalEmailDraft {
  const recipientName =
    ctx.recipientDisplayName?.trim() || "[Nombre del contacto]";
  const recipientEmail =
    ctx.recipientEmail?.trim() || "[contacto@empresa.com]";

  const roleLabel =
    proposal.vacancyTitle !== "—"
      ? proposal.vacancyTitle
      : proposal.opportunityTitle !== "—"
        ? proposal.opportunityTitle
        : "el perfil acordado";

  const candidateLine =
    proposal.candidateName !== "—"
      ? proposal.candidateName
      : "[Asigne candidato en la propuesta]";

  const rateLine = proposal.finalMonthlyRateLabel;
  const rateVatLine = proposal.finalMonthlyRateWithVATLabel;

  const economicName = proposalEconomicPdfFilename(proposal);
  const cvName = proposalCandidateCvPdfFilename(proposal);
  const proposalPdfPath = `/api/proposals/${proposal.id}/pdf`;
  const cvPdfPath = proposal.candidateId
    ? `/api/candidates/${proposal.candidateId}/cv-pdf`
    : null;

  const matchSuffix =
    ctx.matchScore != null ? ` · Match ${ctx.matchScore}%` : "";

  const subject = `Propuesta comercial · ${roleLabel} · Zuperio${matchSuffix}`;

  const vacRef =
    ctx.vacancyTitleForMatch?.trim() && ctx.vacancyTitleForMatch !== "—"
      ? ` «${ctx.vacancyTitleForMatch.trim()}»`
      : "";

  const matchParagraph =
    ctx.matchScore != null
      ? `Consideramos un match del ${ctx.matchScore}% con la vacante${vacRef}, calculado por cobertura de skills requeridos (determinista, sin IA).`
      : "";

  const bodyPlainText = [
    `Estimado/a ${recipientName},`,
    "",
    `Le compartimos nuestra propuesta comercial para ${candidateLine}, orientada a ${roleLabel} con ${proposal.companyName}.`,
    matchParagraph,
    "",
    `Formato de propuesta: ${proposal.format} (${proposal.pricing?.scheme ?? "esquema en archivo"}).`,
    `Tarifa mensual comercial (sin IVA): ${rateLine}`,
    `Tarifa mensual indicativa (con IVA): ${rateVatLine}`,
    `Vigencia: ${proposal.validityDays} días desde emisión.`,
    "",
    "Adjuntos (PDF):",
    `• ${economicName} — propuesta económica`,
    proposal.candidateId
      ? `• ${cvName} — CV Zuperio`
      : `• ${cvName} — asigne un candidato para habilitar el CV en PDF`,
    "",
    "Los archivos se generan al enviar o al descargar desde la ficha de la propuesta (misma plantilla que el PDF de cliente).",
    "",
    proposal.proposalPdfExportedAt
      ? `Última exportación PDF económico (UTC): ${proposal.proposalPdfExportedAt}`
      : "Aún no hay exportación registrada del PDF económico.",
    proposal.candidateId
      ? proposal.candidateCvExportedAt
        ? `Última exportación CV (UTC): ${proposal.candidateCvExportedAt}`
        : "Aún no hay exportación registrada del CV."
      : "",
    "",
    `Elaborado por: ${ctx.preparedByDisplay}`,
    "",
    "Quedamos atentos para una sesión de revisión cuando le sea conveniente.",
    "",
    "Saludos cordiales,",
    "Zuperio · zuperio.com.mx",
  ]
    .filter((line) => line !== "")
    .join("\n");

  const economicReady = proposal.proposalPdfExportedAt != null;
  const cvReady =
    proposal.candidateId != null && proposal.candidateCvExportedAt != null;

  const attachments: ProposalEmailAttachmentPlaceholder[] = [
    {
      kind: "ECONOMIC_PROPOSAL_PDF",
      label: "Propuesta económica",
      subtitle: "Documento comercial para su revisión (PDF)",
      filenameSuggestion: economicName,
      mimeType: "application/pdf",
      ready: economicReady,
      lastExportedAt: proposal.proposalPdfExportedAt,
      downloadHref: proposalPdfPath,
    },
    {
      kind: "CANDIDATE_CV_PDF",
      label: "CV del candidato",
      subtitle: "Formato Zuperio (PDF)",
      filenameSuggestion: cvName,
      mimeType: "application/pdf",
      ready: cvReady,
      lastExportedAt: proposal.candidateCvExportedAt,
      downloadHref: cvPdfPath,
    },
  ];

  return {
    recipientName,
    recipientEmail,
    subject,
    bodyPlainText,
    attachments,
  };
}
