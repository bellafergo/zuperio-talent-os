"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  companyOptionsFromVacancies,
  filterVacancies,
  opportunityOptionsFromVacancies,
} from "@/lib/vacancies/filter-vacancies";
import type { VacancyFilterState, VacancyListRow } from "@/lib/vacancies/types";

import { VacanciesDataTable } from "./vacancies-data-table";
import { VacanciesEmptyState } from "./vacancies-empty-state";
import { VacanciesToolbar } from "./vacancies-toolbar";

const defaultFilters: VacancyFilterState = {
  query: "",
  status: "all",
  companyId: "all",
  opportunityId: "all",
  seniority: "all",
};

export function VacanciesModule({ vacancies }: { vacancies: VacancyListRow[] }) {
  const [filters, setFilters] = useState<VacancyFilterState>(defaultFilters);

  const companyOptions = useMemo(
    () => companyOptionsFromVacancies(vacancies),
    [vacancies],
  );
  const opportunityOptions = useMemo(
    () => opportunityOptionsFromVacancies(vacancies),
    [vacancies],
  );

  const filtered = useMemo(
    () => filterVacancies(vacancies, filters),
    [vacancies, filters],
  );

  const clearFilters = () => setFilters(defaultFilters);

  const catalogEmpty = vacancies.length === 0;
  const noMatches = !catalogEmpty && filtered.length === 0;

  return (
    <div className="space-y-6">
      {!catalogEmpty && (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-medium">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <VacanciesToolbar
              filters={filters}
              onFiltersChange={setFilters}
              companies={companyOptions}
              opportunities={opportunityOptions}
            />
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium">Vacantes</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {catalogEmpty ? (
            <div className="pt-6">
              <VacanciesEmptyState variant="no-catalog" />
            </div>
          ) : noMatches ? (
            <div className="pt-6">
              <VacanciesEmptyState
                variant="no-matches"
                onClearFilters={clearFilters}
              />
            </div>
          ) : (
            <div className="-mx-4 max-w-[calc(100%+2rem)] sm:mx-0 sm:max-w-none">
              <VacanciesDataTable vacancies={filtered} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
