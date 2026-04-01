import {
  proposalCandidateCvPdfFilename,
  proposalEconomicPdfFilename,
} from "./pdf-filename";
import type { ProposalDetailUi } from "./types";

export type ProposalEmailAttachmentPlaceholder = {
  kind: "ECONOMIC_PROPOSAL_PDF" | "CANDIDATE_CV_PDF";
  label: string;
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
};

/**
 * Deterministic, template-based copy for a future “send proposal” step.
 * No AI — interpolates saved proposal and CRM fields only.
 */
export function buildProposalEmailDraft(
  proposal: ProposalDetailUi,
  ctx: ProposalEmailDraftContext,
): ProposalEmailDraft {
  const recipientName =
    ctx.recipientDisplayName?.trim() || "[Recipient name]";
  const recipientEmail =
    ctx.recipientEmail?.trim() || "[recipient@company.com]";

  const roleLabel =
    proposal.vacancyTitle !== "—"
      ? proposal.vacancyTitle
      : proposal.opportunityTitle !== "—"
        ? proposal.opportunityTitle
        : "the agreed role";

  const candidateLine =
    proposal.candidateName !== "—"
      ? proposal.candidateName
      : "[Candidate — assign on proposal]";

  const rateLine = proposal.finalMonthlyRateLabel;
  const rateVatLine = proposal.finalMonthlyRateWithVATLabel;

  const economicName = proposalEconomicPdfFilename(proposal);
  const cvName = proposalCandidateCvPdfFilename(proposal);
  const proposalPdfPath = `/api/proposals/${proposal.id}/pdf`;
  const cvPdfPath = proposal.candidateId
    ? `/api/candidates/${proposal.candidateId}/cv-pdf`
    : null;

  const subject = `Commercial proposal — ${proposal.companyName} — ${candidateLine}`;

  const bodyPlainText = [
    `Dear ${recipientName},`,
    "",
    `Please find our commercial proposal for ${candidateLine} to support ${roleLabel} with ${proposal.companyName}.`,
    "",
    `Format: ${proposal.format} (${proposal.pricing?.scheme ?? "pricing scheme on file"}).`,
    `Monthly commercial rate (excl. VAT): ${rateLine}`,
    `Indicative monthly rate (incl. VAT): ${rateVatLine}`,
    `Proposal validity: ${proposal.validityDays} days from issue.`,
    "",
    "Attachments (PDF):",
    `• ${economicName} — economic proposal (${proposalPdfPath})`,
    proposal.candidateId
      ? `• ${cvName} — Zuperio CV (${cvPdfPath})`
      : `• ${cvName} — assign a candidate on the proposal to enable the CV PDF`,
    "",
    proposal.proposalPdfExportedAt
      ? `Last economic PDF export (UTC): ${proposal.proposalPdfExportedAt}`
      : "Economic PDF has not been exported yet.",
    proposal.candidateId
      ? proposal.candidateCvExportedAt
        ? `Last CV PDF export (UTC): ${proposal.candidateCvExportedAt}`
        : "CV PDF has not been exported yet."
      : "",
    "",
    `Prepared by: ${ctx.preparedByDisplay}`,
    "",
    "Kind regards,",
    "Zuperio",
  ]
    .filter((line) => line !== "")
    .join("\n");

  const economicReady = proposal.proposalPdfExportedAt != null;
  const cvReady =
    proposal.candidateId != null && proposal.candidateCvExportedAt != null;

  const attachments: ProposalEmailAttachmentPlaceholder[] = [
    {
      kind: "ECONOMIC_PROPOSAL_PDF",
      label: "Economic proposal (PDF)",
      filenameSuggestion: economicName,
      mimeType: "application/pdf",
      ready: economicReady,
      lastExportedAt: proposal.proposalPdfExportedAt,
      downloadHref: proposalPdfPath,
    },
    {
      kind: "CANDIDATE_CV_PDF",
      label: "Candidate CV (Zuperio format, PDF)",
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
