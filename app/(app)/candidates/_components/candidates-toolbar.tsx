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
        placeholder="Search name, role, skills, seniority, or availability…"
        value={filters.query}
        onChange={(e) => patch({ query: e.target.value })}
        type="search"
        aria-label="Search candidates"
        className="max-w-md"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <FilterSelect
          label="Seniority"
          value={filters.seniority}
          onValueChange={(seniority) => patch({ seniority })}
          placeholder="All levels"
          options={[
            { value: "all", label: "All levels" },
            ...CANDIDATE_SENIORITIES.map((s) => ({ value: s, label: s })),
          ]}
        />
        <FilterSelect
          label="Availability"
          value={filters.availabilityStatus}
          onValueChange={(availabilityStatus) =>
            patch({ availabilityStatus })
          }
          placeholder="All statuses"
          options={[
            { value: "all", label: "All statuses" },
            ...CANDIDATE_AVAILABILITY.map((s) => ({ value: s, label: s })),
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
