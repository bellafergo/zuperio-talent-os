import type {
  CompanyOption,
  OpportunityFilterState,
  OpportunityListRow,
  OwnerOption,
} from "./types";

export function filterOpportunities(
  rows: OpportunityListRow[],
  filters: OpportunityFilterState,
): OpportunityListRow[] {
  const q = filters.query.trim().toLowerCase();

  return rows.filter((r) => {
    if (q) {
      const haystack =
        `${r.title} ${r.companyName} ${r.ownerName} ${r.stage} ${r.valueLabel}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.stage !== "all" && r.stage !== filters.stage) return false;
    if (filters.companyId !== "all" && r.companyId !== filters.companyId)
      return false;
    if (filters.ownerId !== "all") {
      if (!r.ownerId || r.ownerId !== filters.ownerId) return false;
    }
    return true;
  });
}

export function companyOptionsFromOpportunities(
  rows: OpportunityListRow[],
): CompanyOption[] {
  const byId = new Map<string, string>();
  for (const r of rows) {
    byId.set(r.companyId, r.companyName);
  }
  return [...byId.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function ownerOptionsFromOpportunities(
  rows: OpportunityListRow[],
): OwnerOption[] {
  const byId = new Map<string, string>();
  for (const r of rows) {
    if (r.ownerId) {
      byId.set(r.ownerId, r.ownerName);
    }
  }
  return [...byId.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
