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
        placeholder="Buscar empresas, ubicación o industria…"
        value={filters.query}
        onChange={(e) => patch({ query: e.target.value })}
        type="search"
        aria-label="Buscar empresas"
        className="max-w-md"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <FilterSelect
          label="Estado"
          value={filters.status}
          onValueChange={(status) => patch({ status })}
          placeholder="Todos los estados"
          options={[
            { value: "all", label: "Todos los estados" },
            ...COMPANY_STATUSES.map((s) => ({
              value: s,
              label: s,
            })),
          ]}
        />
        <FilterSelect
          label="Industria"
          value={filters.industry}
          onValueChange={(industry) => patch({ industry })}
          placeholder="Todas las industrias"
          options={[
            { value: "all", label: "Todas las industrias" },
            ...industries.map((i) => ({ value: i, label: i })),
          ]}
        />
        <FilterSelect
          label="Responsable"
          value={filters.owner}
          onValueChange={(owner) => patch({ owner })}
          placeholder="Todos los responsables"
          options={[
            { value: "all", label: "Todos los responsables" },
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
