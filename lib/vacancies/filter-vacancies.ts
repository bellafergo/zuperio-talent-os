import type {
  CompanyOption,
  OpportunityOption,
  VacancyFilterState,
  VacancyListRow,
} from "./types";

export function filterVacancies(
  rows: VacancyListRow[],
  filters: VacancyFilterState,
): VacancyListRow[] {
  const q = filters.query.trim().toLowerCase();

  return rows.filter((r) => {
    if (q) {
      const haystack =
        `${r.title} ${r.companyName} ${r.opportunityTitle} ${r.seniority} ${r.status} ${r.targetRateLabel} ${r.skillsLine ?? ""} ${r.roleSummaryLine ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.status !== "all" && r.status !== filters.status) return false;
    if (filters.companyId !== "all" && r.companyId !== filters.companyId)
      return false;
    if (
      filters.opportunityId !== "all" &&
      r.opportunityId !== filters.opportunityId
    )
      return false;
    if (filters.seniority !== "all" && r.seniority !== filters.seniority)
      return false;
    return true;
  });
}

export function companyOptionsFromVacancies(
  rows: VacancyListRow[],
): CompanyOption[] {
  const byId = new Map<string, string>();
  for (const r of rows) {
    byId.set(r.companyId, r.companyName);
  }
  return [...byId.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function opportunityOptionsFromVacancies(
  rows: VacancyListRow[],
): OpportunityOption[] {
  const byId = new Map<string, string>();
  for (const r of rows) {
    byId.set(r.opportunityId, r.opportunityTitle);
  }
  return [...byId.entries()]
    .map(([id, title]) => ({ id, title }))
    .sort((a, b) => a.title.localeCompare(b.title));
}
