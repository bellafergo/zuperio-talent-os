import type { CandidateFilterState, CandidateUi } from "./types";

export function filterCandidates(
  rows: CandidateUi[],
  filters: CandidateFilterState,
): CandidateUi[] {
  const q = filters.query.trim().toLowerCase();

  return rows.filter((r) => {
    if (q) {
      const haystack =
        `${r.displayName} ${r.role} ${r.skills} ${r.seniority} ${r.availabilityStatus} ${r.availabilityBadgeLabel} ${r.email} ${r.currentCompany} ${r.pipelineContextLabel} ${r.pipelineVacancyLine}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.seniority !== "all" && r.seniority !== filters.seniority)
      return false;
    if (
      filters.availabilityStatus !== "all" &&
      r.availabilityStatus !== filters.availabilityStatus
    )
      return false;
    if (
      filters.pipelineIntent !== "all" &&
      r.pipelineIntent !== filters.pipelineIntent
    ) {
      return false;
    }
    if (filters.linkedVacancy === "yes" && !r.pipelineVacancyId) return false;
    if (filters.linkedVacancy === "no" && r.pipelineVacancyId) return false;
    return true;
  });
}
