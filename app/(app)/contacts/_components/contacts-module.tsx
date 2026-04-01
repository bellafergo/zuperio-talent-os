"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  companyOptionsFromContacts,
  filterContacts,
} from "@/lib/contacts/filter-contacts";
import type { ContactFilterState, ContactListRow } from "@/lib/contacts/types";

import { ContactsDataTable } from "./contacts-data-table";
import { ContactsEmptyState } from "./contacts-empty-state";
import { ContactsToolbar } from "./contacts-toolbar";

const defaultFilters: ContactFilterState = {
  query: "",
  status: "all",
  companyId: "all",
};

export function ContactsModule({ contacts }: { contacts: ContactListRow[] }) {
  const [filters, setFilters] = useState<ContactFilterState>(defaultFilters);

  const companyOptions = useMemo(
    () => companyOptionsFromContacts(contacts),
    [contacts],
  );

  const filtered = useMemo(
    () => filterContacts(contacts, filters),
    [contacts, filters],
  );

  const clearFilters = () => setFilters(defaultFilters);

  const catalogEmpty = contacts.length === 0;
  const noMatches = !catalogEmpty && filtered.length === 0;

  return (
    <div className="space-y-6">
      {!catalogEmpty && (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-medium">Filters</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ContactsToolbar
              filters={filters}
              onFiltersChange={setFilters}
              companies={companyOptions}
            />
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium">Directory</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {catalogEmpty ? (
            <div className="pt-6">
              <ContactsEmptyState variant="no-catalog" />
            </div>
          ) : noMatches ? (
            <div className="pt-6">
              <ContactsEmptyState
                variant="no-matches"
                onClearFilters={clearFilters}
              />
            </div>
          ) : (
            <div className="-mx-4 max-w-[calc(100%+2rem)] sm:mx-0 sm:max-w-none">
              <ContactsDataTable contacts={filtered} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
