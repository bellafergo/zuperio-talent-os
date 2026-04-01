import type { ProposalDetailUi } from "./types";

export type ProposalEmailAttachmentPlaceholder = {
  kind: "ECONOMIC_PROPOSAL_PDF" | "CANDIDATE_CV_PDF";
  label: string;
  filenameSuggestion: string;
  mimeType: "application/pdf";
  /** True when a generated file exists in storage; always false until export ships. */
  ready: boolean;
};

export type ProposalEmailDraft = {
  recipientName: string;
  recipientEmail: string;
  subject: string;
  bodyPlainText: string;
  attachments: ProposalEmailAttachmentPlaceholder[];
};

function slugPart(raw: string, maxLen: number): string {
  const s = raw
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen);
  return s || "document";
}

function attachmentFilename(
  proposal: ProposalDetailUi,
  suffix: string,
): string {
  const company = slugPart(proposal.companyName, 24);
  const who = slugPart(
    proposal.candidateName !== "—" ? proposal.candidateName : proposal.vacancyTitle,
    24,
  );
  return `Zuperio-${suffix}-${company}-${who}.pdf`;
}

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
    "Attachments to include when sending (prepare from Zuperio templates):",
    `• ${attachmentFilename(proposal, "Economic-Proposal")} — economic proposal (use Preview → Print / PDF)`,
    `• ${attachmentFilename(proposal, "Candidate-CV")} — Zuperio-branded CV from the candidate profile`,
    "",
    `Prepared by: ${ctx.preparedByDisplay}`,
    "",
    "Kind regards,",
    "Zuperio",
  ].join("\n");

  const attachments: ProposalEmailAttachmentPlaceholder[] = [
    {
      kind: "ECONOMIC_PROPOSAL_PDF",
      label: "Economic proposal (PDF)",
      filenameSuggestion: attachmentFilename(proposal, "Economic-Proposal"),
      mimeType: "application/pdf",
      ready: false,
    },
    {
      kind: "CANDIDATE_CV_PDF",
      label: "Candidate CV (Zuperio format, PDF)",
      filenameSuggestion: attachmentFilename(proposal, "Candidate-CV"),
      mimeType: "application/pdf",
      ready: false,
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
