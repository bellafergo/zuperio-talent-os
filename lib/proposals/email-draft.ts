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
  /** True after at least one successful server-side economic proposal PDF export. */
  ready: boolean;
  /** ISO timestamp of last successful export (economic PDF only for v1). */
  lastExportedAt: string | null;
  /** Authenticated relative URL to download/regenerate the economic PDF, or null for not-yet-built assets. */
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
  const pdfDownloadPath = `/api/proposals/${proposal.id}/pdf`;

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
    "Attachments:",
    `• ${economicName} — economic proposal (generate from the proposal Preview tab → Download PDF)`,
    `• ${cvName} — Zuperio-branded CV from the candidate profile (PDF export not implemented yet)`,
    proposal.proposalPdfExportedAt
      ? `Last economic PDF export (UTC): ${proposal.proposalPdfExportedAt}`
      : "Economic PDF has not been exported yet from Zuperio.",
    "",
    `Download economic PDF (when logged in): ${pdfDownloadPath}`,
    "",
    `Prepared by: ${ctx.preparedByDisplay}`,
    "",
    "Kind regards,",
    "Zuperio",
  ].join("\n");

  const economicReady = proposal.proposalPdfExportedAt != null;

  const attachments: ProposalEmailAttachmentPlaceholder[] = [
    {
      kind: "ECONOMIC_PROPOSAL_PDF",
      label: "Economic proposal (PDF)",
      filenameSuggestion: economicName,
      mimeType: "application/pdf",
      ready: economicReady,
      lastExportedAt: proposal.proposalPdfExportedAt,
      downloadHref: pdfDownloadPath,
    },
    {
      kind: "CANDIDATE_CV_PDF",
      label: "Candidate CV (Zuperio format, PDF)",
      filenameSuggestion: cvName,
      mimeType: "application/pdf",
      ready: false,
      lastExportedAt: null,
      downloadHref: null,
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
