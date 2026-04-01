import type { CompanyOption, ContactFilterState, ContactListRow } from "./types";

export function filterContacts(
  contacts: ContactListRow[],
  filters: ContactFilterState,
): ContactListRow[] {
  const q = filters.query.trim().toLowerCase();

  return contacts.filter((c) => {
    if (q) {
      const haystack =
        `${c.displayName} ${c.title} ${c.companyName} ${c.email} ${c.phone}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.status !== "all" && c.status !== filters.status) return false;
    if (filters.companyId !== "all" && c.companyId !== filters.companyId)
      return false;
    return true;
  });
}

export function companyOptionsFromContacts(
  contacts: ContactListRow[],
): CompanyOption[] {
  const byId = new Map<string, string>();
  for (const c of contacts) {
    byId.set(c.companyId, c.companyName);
  }
  return [...byId.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
