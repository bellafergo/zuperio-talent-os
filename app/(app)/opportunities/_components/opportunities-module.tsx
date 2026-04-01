"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  companyOptionsFromOpportunities,
  filterOpportunities,
  ownerOptionsFromOpportunities,
} from "@/lib/opportunities/filter-opportunities";
import type {
  OpportunityFilterState,
  OpportunityListRow,
} from "@/lib/opportunities/types";

import { OpportunitiesDataTable } from "./opportunities-data-table";
import { OpportunitiesEmptyState } from "./opportunities-empty-state";
import { OpportunitiesToolbar } from "./opportunities-toolbar";

const defaultFilters: OpportunityFilterState = {
  query: "",
  stage: "all",
  companyId: "all",
  ownerId: "all",
};

export function OpportunitiesModule({
  opportunities,
}: {
  opportunities: OpportunityListRow[];
}) {
  const [filters, setFilters] = useState<OpportunityFilterState>(defaultFilters);

  const companyOptions = useMemo(
    () => companyOptionsFromOpportunities(opportunities),
    [opportunities],
  );
  const ownerOptions = useMemo(
    () => ownerOptionsFromOpportunities(opportunities),
    [opportunities],
  );

  const filtered = useMemo(
    () => filterOpportunities(opportunities, filters),
    [opportunities, filters],
  );

  const clearFilters = () => setFilters(defaultFilters);

  const catalogEmpty = opportunities.length === 0;
  const noMatches = !catalogEmpty && filtered.length === 0;

  return (
    <div className="space-y-6">
      {!catalogEmpty && (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-medium">Filters</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <OpportunitiesToolbar
              filters={filters}
              onFiltersChange={setFilters}
              companies={companyOptions}
              owners={ownerOptions}
            />
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium">Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {catalogEmpty ? (
            <div className="pt-6">
              <OpportunitiesEmptyState variant="no-catalog" />
            </div>
          ) : noMatches ? (
            <div className="pt-6">
              <OpportunitiesEmptyState
                variant="no-matches"
                onClearFilters={clearFilters}
              />
            </div>
          ) : (
            <div className="-mx-4 max-w-[calc(100%+2rem)] sm:mx-0 sm:max-w-none">
              <OpportunitiesDataTable opportunities={filtered} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
