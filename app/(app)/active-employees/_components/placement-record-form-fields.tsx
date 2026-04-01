"use client";

import * as React from "react";

import {
  PlacementStatus as StatusConst,
  type PlacementStatus,
} from "@/generated/prisma/enums";
import { Input } from "@/components/ui/input";
import type {
  PlacementCandidateOption,
  PlacementVacancyOption,
} from "@/lib/placements/queries";
import { cn } from "@/lib/utils";

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
);

const STATUS_LABELS: Record<PlacementStatus, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export type PlacementFormDefaults = {
  candidateId: string;
  vacancyId: string;
  companyId: string;
  startDateValue: string;
  endDateValue: string | null;
  statusValue: PlacementStatus;
  rateClientAmount: number | null;
  rateCandidateAmount: number | null;
};

export function PlacementRecordFormFields({
  placementId,
  candidates,
  vacancies,
  defaults,
  fieldErrors,
}: {
  placementId?: string;
  candidates: PlacementCandidateOption[];
  vacancies: PlacementVacancyOption[];
  defaults?: PlacementFormDefaults;
  fieldErrors?: Record<string, string>;
}) {
  const vacancyById = React.useMemo(() => {
    const m = new Map<string, PlacementVacancyOption>();
    for (const v of vacancies) m.set(v.id, v);
    return m;
  }, [vacancies]);

  const [vacancyId, setVacancyId] = React.useState<string>(defaults?.vacancyId ?? "");
  const inferredCompany = vacancyId ? vacancyById.get(vacancyId) ?? null : null;
  const companyId = inferredCompany?.companyId ?? defaults?.companyId ?? "";

  const statusOrder = Object.values(StatusConst) as PlacementStatus[];

  return (
    <div className="grid gap-4">
      {placementId ? (
        <input type="hidden" name="placementId" value={placementId} />
      ) : null}

      <input type="hidden" name="companyId" value={companyId} />

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Candidate <span className="text-destructive">*</span>
        </label>
        <select
          name="candidateId"
          required
          className={selectClass}
          defaultValue={defaults?.candidateId ?? ""}
          aria-invalid={Boolean(fieldErrors?.candidateId)}
        >
          <option value="" disabled>
            Select a candidate…
          </option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {fieldErrors?.candidateId ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.candidateId}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Vacancy <span className="text-destructive">*</span>
        </label>
        <select
          name="vacancyId"
          required
          className={selectClass}
          value={vacancyId}
          onChange={(e) => setVacancyId(e.target.value)}
          aria-invalid={Boolean(fieldErrors?.vacancyId)}
        >
          <option value="" disabled>
            Select a vacancy…
          </option>
          {vacancies.map((v) => (
            <option key={v.id} value={v.id}>
              {v.companyName} — {v.title}
            </option>
          ))}
        </select>
        {fieldErrors?.vacancyId ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.vacancyId}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Company <span className="text-destructive">*</span>
        </label>
        <Input
          value={inferredCompany?.companyName ?? (defaults?.companyId ? "Selected" : "")}
          placeholder={vacancyId ? "" : "Select a vacancy to infer company"}
          readOnly
          aria-invalid={Boolean(fieldErrors?.companyId)}
        />
        {fieldErrors?.companyId ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.companyId}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Start date <span className="text-destructive">*</span>
          </label>
          <Input
            name="startDate"
            type="date"
            required
            defaultValue={defaults?.startDateValue ?? ""}
            aria-invalid={Boolean(fieldErrors?.startDate)}
          />
          {fieldErrors?.startDate ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.startDate}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">End date</label>
          <Input
            name="endDate"
            type="date"
            defaultValue={defaults?.endDateValue ?? ""}
            aria-invalid={Boolean(fieldErrors?.endDate)}
          />
          {fieldErrors?.endDate ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.endDate}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Status <span className="text-destructive">*</span>
        </label>
        <select
          name="status"
          required
          className={selectClass}
          defaultValue={defaults?.statusValue ?? "ACTIVE"}
          aria-invalid={Boolean(fieldErrors?.status)}
        >
          {statusOrder.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        {fieldErrors?.status ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.status}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Client rate</label>
          <Input
            name="rateClient"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            defaultValue={
              defaults?.rateClientAmount != null ? String(defaults.rateClientAmount) : ""
            }
            aria-invalid={Boolean(fieldErrors?.rateClient)}
          />
          {fieldErrors?.rateClient ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.rateClient}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Candidate rate</label>
          <Input
            name="rateCandidate"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            defaultValue={
              defaults?.rateCandidateAmount != null
                ? String(defaults.rateCandidateAmount)
                : ""
            }
            aria-invalid={Boolean(fieldErrors?.rateCandidate)}
          />
          {fieldErrors?.rateCandidate ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.rateCandidate}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

