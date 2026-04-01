import type { ProposalDetailUi } from "./types";

export function slugPart(raw: string, maxLen: number): string {
  const s = raw
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen);
  return s || "document";
}

/** Stable download filename for the economic proposal PDF (simple or detailed format). */
export function proposalEconomicPdfFilename(proposal: ProposalDetailUi): string {
  const company = slugPart(proposal.companyName, 24);
  const who = slugPart(
    proposal.candidateName !== "—" ? proposal.candidateName : proposal.vacancyTitle,
    24,
  );
  return `Zuperio-Economic-Proposal-${company}-${who}.pdf`;
}

export function proposalCandidateCvPdfFilename(proposal: ProposalDetailUi): string {
  const company = slugPart(proposal.companyName, 24);
  const who = slugPart(
    proposal.candidateName !== "—" ? proposal.candidateName : proposal.vacancyTitle,
    24,
  );
  return `Zuperio-Candidate-CV-${company}-${who}.pdf`;
}
