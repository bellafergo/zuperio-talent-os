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
  CANDIDATE_AVAILABILITY,
  CANDIDATE_LINKED_VACANCY_FILTER_OPTIONS,
  CANDIDATE_PIPELINE_INTENT_FILTER_OPTIONS,
  CANDIDATE_SENIORITIES,
} from "@/lib/candidates/constants";
import type { CandidateFilterState } from "@/lib/candidates/types";

type CandidatesToolbarProps = {
  filters: CandidateFilterState;
  onFiltersChange: (next: CandidateFilterState) => void;
};

export function CandidatesToolbar({
  filters,
  onFiltersChange,
}: CandidatesToolbarProps) {
  const patch = (partial: Partial<CandidateFilterState>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por nombre, rol, skills, senioridad o disponibilidad…"
        value={filters.query}
        onChange={(e) => patch({ query: e.target.value })}
        type="search"
        aria-label="Buscar candidatos"
        className="max-w-md"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <FilterSelect
          label="Senioridad"
          value={filters.seniority}
          onValueChange={(seniority) => patch({ seniority })}
          placeholder="Todos los niveles"
          options={[
            { value: "all", label: "Todos los niveles" },
            ...CANDIDATE_SENIORITIES.map((s) => ({ value: s, label: s })),
          ]}
        />
        <FilterSelect
          label="Disponibilidad"
          value={filters.availabilityStatus}
          onValueChange={(availabilityStatus) =>
            patch({ availabilityStatus })
          }
          placeholder="Todos los estados"
          options={[
            { value: "all", label: "Todos los estados" },
            ...CANDIDATE_AVAILABILITY.map((s) => ({ value: s, label: s })),
          ]}
        />
        <FilterSelect
          label="Contexto de reclutamiento"
          value={filters.pipelineIntent}
          onValueChange={(pipelineIntent) => patch({ pipelineIntent })}
          placeholder="Todos los contextos"
          options={CANDIDATE_PIPELINE_INTENT_FILTER_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
        />
        <FilterSelect
          label="Vacante vinculada"
          value={filters.linkedVacancy}
          onValueChange={(linkedVacancy) => patch({ linkedVacancy })}
          placeholder="Todas"
          options={[...CANDIDATE_LINKED_VACANCY_FILTER_OPTIONS]}
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
