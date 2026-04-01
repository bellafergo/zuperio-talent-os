"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  VACANCY_SENIORITIES,
  VACANCY_STATUSES,
} from "@/lib/vacancies/constants";
import type {
  CompanyOption,
  OpportunityOption,
  VacancyFilterState,
} from "@/lib/vacancies/types";

type VacanciesToolbarProps = {
  filters: VacancyFilterState;
  onFiltersChange: (next: VacancyFilterState) => void;
  companies: CompanyOption[];
  opportunities: OpportunityOption[];
};

export function VacanciesToolbar({
  filters,
  onFiltersChange,
  companies,
  opportunities,
}: VacanciesToolbarProps) {
  const patch = (partial: Partial<VacancyFilterState>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search vacancy, company, opportunity, seniority, or status…"
        value={filters.query}
        onChange={(e) => patch({ query: e.target.value })}
        type="search"
        aria-label="Search vacancies"
        className="max-w-md"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <FilterSelect
          label="Status"
          value={filters.status}
          onValueChange={(status) => patch({ status })}
          placeholder="All statuses"
          options={[
            { value: "all", label: "All statuses" },
            ...VACANCY_STATUSES.map((s) => ({ value: s, label: s })),
          ]}
        />
        <FilterSelect
          label="Company"
          value={filters.companyId}
          onValueChange={(companyId) => patch({ companyId })}
          placeholder="All companies"
          options={[
            { value: "all", label: "All companies" },
            ...companies.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <FilterSelect
          label="Opportunity"
          value={filters.opportunityId}
          onValueChange={(opportunityId) => patch({ opportunityId })}
          placeholder="All opportunities"
          options={[
            { value: "all", label: "All opportunities" },
            ...opportunities.map((o) => ({
              value: o.id,
              label: o.title,
            })),
          ]}
        />
        <FilterSelect
          label="Seniority"
          value={filters.seniority}
          onValueChange={(seniority) => patch({ seniority })}
          placeholder="All levels"
          options={[
            { value: "all", label: "All levels" },
            ...VACANCY_SENIORITIES.map((s) => ({ value: s, label: s })),
          ]}
        />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onValueChange,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex min-w-[min(100%,12rem)] flex-1 flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger size="sm" className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position="popper">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
