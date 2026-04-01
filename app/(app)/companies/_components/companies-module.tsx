"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  filterCompanies,
  industriesFromCompanies,
  ownersFromCompanies,
} from "@/lib/companies/filter-companies";
import type { Company, CompanyFilterState } from "@/lib/companies/types";

import { CompaniesDataTable } from "./companies-data-table";
import { CompaniesEmptyState } from "./companies-empty-state";
import { CompaniesToolbar } from "./companies-toolbar";

const defaultFilters: CompanyFilterState = {
  query: "",
  status: "all",
  industry: "all",
  owner: "all",
};

export function CompaniesModule({ companies }: { companies: Company[] }) {
  const [filters, setFilters] = useState<CompanyFilterState>(defaultFilters);

  const industries = useMemo(
    () => industriesFromCompanies(companies),
    [companies],
  );
  const owners = useMemo(() => ownersFromCompanies(companies), [companies]);

  const filtered = useMemo(
    () => filterCompanies(companies, filters),
    [companies, filters],
  );

  const clearFilters = () => setFilters(defaultFilters);

  const catalogEmpty = companies.length === 0;
  const noMatches = !catalogEmpty && filtered.length === 0;

  return (
    <div className="space-y-6">
      {!catalogEmpty && (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-medium">Filters</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <CompaniesToolbar
              filters={filters}
              onFiltersChange={setFilters}
              industries={industries}
              owners={owners}
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
              <CompaniesEmptyState variant="no-catalog" />
            </div>
          ) : noMatches ? (
            <div className="pt-6">
              <CompaniesEmptyState
                variant="no-matches"
                onClearFilters={clearFilters}
              />
            </div>
          ) : (
            <div className="-mx-4 max-w-[calc(100%+2rem)] sm:mx-0 sm:max-w-none">
              <CompaniesDataTable companies={filtered} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
