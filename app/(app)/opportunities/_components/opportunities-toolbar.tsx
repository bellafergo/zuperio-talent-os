"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { OPPORTUNITY_STAGES } from "@/lib/opportunities/constants";
import type {
  CompanyOption,
  OpportunityFilterState,
  OwnerOption,
} from "@/lib/opportunities/types";

type OpportunitiesToolbarProps = {
  filters: OpportunityFilterState;
  onFiltersChange: (next: OpportunityFilterState) => void;
  companies: CompanyOption[];
  owners: OwnerOption[];
};

export function OpportunitiesToolbar({
  filters,
  onFiltersChange,
  companies,
  owners,
}: OpportunitiesToolbarProps) {
  const patch = (partial: Partial<OpportunityFilterState>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar oportunidad, empresa, responsable, etapa o valor…"
        value={filters.query}
        onChange={(e) => patch({ query: e.target.value })}
        type="search"
        aria-label="Buscar oportunidades"
        className="max-w-md"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <FilterSelect
          label="Etapa"
          value={filters.stage}
          onValueChange={(stage) => patch({ stage })}
          placeholder="Todas las etapas"
          options={[
            { value: "all", label: "Todas las etapas" },
            ...OPPORTUNITY_STAGES.map((s) => ({ value: s, label: s })),
          ]}
        />
        <FilterSelect
          label="Empresa"
          value={filters.companyId}
          onValueChange={(companyId) => patch({ companyId })}
          placeholder="Todas las empresas"
          options={[
            { value: "all", label: "Todas las empresas" },
            ...companies.map((co) => ({
              value: co.id,
              label: co.name,
            })),
          ]}
        />
        <FilterSelect
          label="Responsable"
          value={filters.ownerId}
          onValueChange={(ownerId) => patch({ ownerId })}
          placeholder="Todos los responsables"
          options={[
            { value: "all", label: "Todos los responsables" },
            ...owners.map((o) => ({
              value: o.id,
              label: o.name,
            })),
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
