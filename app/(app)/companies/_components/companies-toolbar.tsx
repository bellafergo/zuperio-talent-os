"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { CompanyFilterState } from "@/lib/companies/types";
import { COMPANY_STATUSES } from "@/lib/companies/constants";

type CompaniesToolbarProps = {
  filters: CompanyFilterState;
  onFiltersChange: (next: CompanyFilterState) => void;
  industries: string[];
  owners: string[];
};

export function CompaniesToolbar({
  filters,
  onFiltersChange,
  industries,
  owners,
}: CompaniesToolbarProps) {
  const patch = (partial: Partial<CompanyFilterState>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search companies, location, or industry…"
        value={filters.query}
        onChange={(e) => patch({ query: e.target.value })}
        type="search"
        aria-label="Search companies"
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
            ...COMPANY_STATUSES.map((s) => ({
              value: s,
              label: s,
            })),
          ]}
        />
        <FilterSelect
          label="Industry"
          value={filters.industry}
          onValueChange={(industry) => patch({ industry })}
          placeholder="All industries"
          options={[
            { value: "all", label: "All industries" },
            ...industries.map((i) => ({ value: i, label: i })),
          ]}
        />
        <FilterSelect
          label="Owner"
          value={filters.owner}
          onValueChange={(owner) => patch({ owner })}
          placeholder="All owners"
          options={[
            { value: "all", label: "All owners" },
            ...owners.map((o) => ({ value: o, label: o })),
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
