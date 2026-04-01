"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CONTACT_STATUSES } from "@/lib/contacts/constants";
import type { CompanyOption, ContactFilterState } from "@/lib/contacts/types";

type ContactsToolbarProps = {
  filters: ContactFilterState;
  onFiltersChange: (next: ContactFilterState) => void;
  companies: CompanyOption[];
};

export function ContactsToolbar({
  filters,
  onFiltersChange,
  companies,
}: ContactsToolbarProps) {
  const patch = (partial: Partial<ContactFilterState>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search name, role, company, email, or phone…"
        value={filters.query}
        onChange={(e) => patch({ query: e.target.value })}
        type="search"
        aria-label="Search contacts"
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
            ...CONTACT_STATUSES.map((s) => ({ value: s, label: s })),
          ]}
        />
        <FilterSelect
          label="Company"
          value={filters.companyId}
          onValueChange={(companyId) => patch({ companyId })}
          placeholder="All companies"
          options={[
            { value: "all", label: "All companies" },
            ...companies.map((co) => ({
              value: co.id,
              label: co.name,
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
