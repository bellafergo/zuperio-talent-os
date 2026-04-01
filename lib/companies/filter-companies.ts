import type { Company, CompanyFilterState } from "./types";

export function filterCompanies(
  companies: Company[],
  filters: CompanyFilterState,
): Company[] {
  const q = filters.query.trim().toLowerCase();

  return companies.filter((c) => {
    if (q) {
      const haystack = `${c.name} ${c.location} ${c.industry}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.status !== "all" && c.status !== filters.status) return false;
    if (filters.industry !== "all" && c.industry !== filters.industry)
      return false;
    if (filters.owner !== "all" && c.owner !== filters.owner) return false;
    return true;
  });
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function industriesFromCompanies(companies: Company[]): string[] {
  return uniqueSorted(companies.map((c) => c.industry));
}

export function ownersFromCompanies(companies: Company[]): string[] {
  return uniqueSorted(companies.map((c) => c.owner));
}
