"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { filterCandidates } from "@/lib/candidates/filter-candidates";
import type { CandidateFilterState, CandidateUi } from "@/lib/candidates/types";

import { CandidatesDataTable } from "./candidates-data-table";
import { CandidatesEmptyState } from "./candidates-empty-state";
import { CandidatesToolbar } from "./candidates-toolbar";

const defaultFilters: CandidateFilterState = {
  query: "",
  seniority: "all",
  availabilityStatus: "all",
  pipelineIntent: "all",
  linkedVacancy: "all",
};

export function CandidatesModule({ candidates }: { candidates: CandidateUi[] }) {
  const [filters, setFilters] = useState<CandidateFilterState>(defaultFilters);

  const filtered = useMemo(
    () => filterCandidates(candidates, filters),
    [candidates, filters],
  );

  const clearFilters = () => setFilters(defaultFilters);

  const catalogEmpty = candidates.length === 0;
  const noMatches = !catalogEmpty && filtered.length === 0;

  return (
    <div className="space-y-6">
      {!catalogEmpty && (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-medium">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <CandidatesToolbar
              filters={filters}
              onFiltersChange={setFilters}
            />
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium">Banco de talento</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {catalogEmpty ? (
            <div className="pt-6">
              <CandidatesEmptyState variant="no-catalog" />
            </div>
          ) : noMatches ? (
            <div className="pt-6">
              <CandidatesEmptyState
                variant="no-matches"
                onClearFilters={clearFilters}
              />
            </div>
          ) : (
            <div className="-mx-4 max-w-[calc(100%+2rem)] sm:mx-0 sm:max-w-none">
              <CandidatesDataTable candidates={filtered} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
