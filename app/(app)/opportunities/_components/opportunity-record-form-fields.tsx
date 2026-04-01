"use client";

import {
  OpportunityStage as StageConst,
  type OpportunityStage,
} from "@/generated/prisma/enums";
import type {
  OpportunityCompanyOption,
  OpportunityOwnerOption,
} from "@/lib/opportunities/queries";
import { cn } from "@/lib/utils";

import { CurrencySelect } from "@/components/currency-select";
import { Input } from "@/components/ui/input";

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
);

const STAGE_LABELS: Record<OpportunityStage, string> = {
  PROSPECTING: "Prospecting",
  QUALIFICATION: "Qualification",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed won",
  CLOSED_LOST: "Closed lost",
};

export type OpportunityFormDefaults = {
  title: string;
  companyId: string;
  ownerId: string | null;
  stageValue: OpportunityStage;
  valueAmount: number | null;
  currency: string;
};

export function OpportunityRecordFormFields({
  opportunityId,
  companies,
  owners,
  defaults,
  fieldErrors,
}: {
  opportunityId?: string;
  companies: OpportunityCompanyOption[];
  owners: OpportunityOwnerOption[];
  defaults?: OpportunityFormDefaults;
  fieldErrors?: Record<string, string>;
}) {
  const stageOrder = Object.values(StageConst) as OpportunityStage[];

  return (
    <div className="grid gap-4">
      {opportunityId ? (
        <input type="hidden" name="opportunityId" value={opportunityId} />
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor={opportunityId ? `edit-title-${opportunityId}` : "new-title"}
          className="text-sm font-medium"
        >
          Title <span className="text-destructive">*</span>
        </label>
        <Input
          id={opportunityId ? `edit-title-${opportunityId}` : "new-title"}
          name="title"
          required
          maxLength={200}
          defaultValue={defaults?.title ?? ""}
          aria-invalid={Boolean(fieldErrors?.title)}
        />
        {fieldErrors?.title ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.title}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Company <span className="text-destructive">*</span>
        </label>
        <select
          name="companyId"
          required
          className={selectClass}
          defaultValue={defaults?.companyId ?? ""}
          aria-invalid={Boolean(fieldErrors?.companyId)}
        >
          <option value="" disabled>
            Select a company…
          </option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {fieldErrors?.companyId ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.companyId}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Owner</label>
        <select
          name="ownerId"
          className={selectClass}
          defaultValue={defaults?.ownerId ?? ""}
          aria-invalid={Boolean(fieldErrors?.ownerId)}
        >
          <option value="">No owner</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name?.trim() || o.email}
            </option>
          ))}
        </select>
        {fieldErrors?.ownerId ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.ownerId}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Stage <span className="text-destructive">*</span>
        </label>
        <select
          name="stage"
          required
          className={selectClass}
          defaultValue={defaults?.stageValue ?? "PROSPECTING"}
          aria-invalid={Boolean(fieldErrors?.stage)}
        >
          {stageOrder.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s]}
            </option>
          ))}
        </select>
        {fieldErrors?.stage ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.stage}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Value</label>
          <Input
            name="value"
            type="number"
            inputMode="decimal"
            min={0}
            step={1}
            defaultValue={defaults?.valueAmount != null ? String(defaults.valueAmount) : ""}
            aria-invalid={Boolean(fieldErrors?.value)}
          />
          {fieldErrors?.value ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.value}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Moneda</label>
          <CurrencySelect
            defaultValue={defaults?.currency ?? "MXN"}
            aria-invalid={Boolean(fieldErrors?.currency)}
          />
          {fieldErrors?.currency ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.currency}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

