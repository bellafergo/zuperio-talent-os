import type { CandidateFilterState, CandidateUi } from "./types";

export function filterCandidates(
  rows: CandidateUi[],
  filters: CandidateFilterState,
): CandidateUi[] {
  const q = filters.query.trim().toLowerCase();

  return rows.filter((r) => {
    if (q) {
      const haystack =
        `${r.displayName} ${r.role} ${r.skills} ${r.seniority} ${r.availabilityStatus} ${r.email} ${r.currentCompany}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.seniority !== "all" && r.seniority !== filters.seniority)
      return false;
    if (
      filters.availabilityStatus !== "all" &&
      r.availabilityStatus !== filters.availabilityStatus
    )
      return false;
    return true;
  });
}
