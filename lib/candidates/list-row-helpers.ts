import type {
  CandidateEditData,
  CandidateEditDataJson,
} from "./queries";
import type { CandidateUi } from "./types";

export function reviveCandidateEditDataFromJson(
  j: CandidateEditDataJson,
): CandidateEditData {
  return {
    ...j,
    availabilityStartDate: j.availabilityStartDate
      ? new Date(j.availabilityStartDate)
      : null,
    cvUploadedAt: j.cvUploadedAt ? new Date(j.cvUploadedAt) : null,
  };
}

/** Proposal prefill text from list row (aligned with detail `buildCandidateProposalProfileSummary`). */
export function buildProposalProfileSummaryForListRow(row: CandidateUi): string {
  const name = row.displayName?.trim();
  const roleLine = [row.role?.trim(), `${row.seniority}`.trim()]
    .filter(Boolean)
    .join(" · ");
  const head = [name, roleLine].filter(Boolean).join(" — ");
  const lines: string[] = [];
  if (head) lines.push(head);
  const vt = row.pipelineVacancyLine?.trim();
  if (vt && vt !== "—") {
    lines.push(`Vacante: ${vt}`);
  }
  return lines.join("\n");
}
