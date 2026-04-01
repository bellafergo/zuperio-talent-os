"use client";

import * as React from "react";

import {
  WeeklyLogStatus as StatusConst,
  type WeeklyLogStatus,
} from "@/generated/prisma/enums";
import { Input } from "@/components/ui/input";
import type { WeeklyLogPlacementOption } from "@/lib/weekly-logs/types";
import { cn } from "@/lib/utils";

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
);

const STATUS_LABELS: Record<WeeklyLogStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  RETURNED: "Returned",
};

export type WeeklyLogFormDefaults = {
  placementId: string;
  weekStartValue: string;
  weekEndValue: string;
  statusValue: WeeklyLogStatus;
  hoursTotalAmount: number | null;
  summary: string | null;
  achievements: string | null;
  blockers: string | null;
};

export function WeeklyLogRecordFormFields({
  weeklyLogId,
  placements,
  defaults,
  fieldErrors,
}: {
  weeklyLogId?: string;
  placements: WeeklyLogPlacementOption[];
  defaults?: WeeklyLogFormDefaults;
  fieldErrors?: Record<string, string>;
}) {
  const statusOrder = React.useMemo(
    () => Object.values(StatusConst) as WeeklyLogStatus[],
    [],
  );

  return (
    <div className="grid gap-4">
      {weeklyLogId ? (
        <input type="hidden" name="weeklyLogId" value={weeklyLogId} />
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Placement <span className="text-destructive">*</span>
        </label>
        <select
          name="placementId"
          required
          className={selectClass}
          defaultValue={defaults?.placementId ?? ""}
          aria-invalid={Boolean(fieldErrors?.placementId)}
        >
          <option value="" disabled>
            Select a placement…
          </option>
          {placements.map((p) => (
            <option key={p.id} value={p.id}>
              {p.candidateName} · {p.companyName} · {p.vacancyTitle}
            </option>
          ))}
        </select>
        {fieldErrors?.placementId ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.placementId}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Week start <span className="text-destructive">*</span>
          </label>
          <Input
            name="weekStart"
            type="date"
            required
            defaultValue={defaults?.weekStartValue ?? ""}
            aria-invalid={Boolean(fieldErrors?.weekStart)}
          />
          {fieldErrors?.weekStart ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.weekStart}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Week end <span className="text-destructive">*</span>
          </label>
          <Input
            name="weekEnd"
            type="date"
            required
            defaultValue={defaults?.weekEndValue ?? ""}
            aria-invalid={Boolean(fieldErrors?.weekEnd)}
          />
          {fieldErrors?.weekEnd ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.weekEnd}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Status <span className="text-destructive">*</span>
          </label>
          <select
            name="status"
            required
            className={selectClass}
            defaultValue={defaults?.statusValue ?? "DRAFT"}
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Hours total</label>
          <Input
            name="hoursTotal"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.25}
            defaultValue={
              defaults?.hoursTotalAmount != null ? String(defaults.hoursTotalAmount) : ""
            }
            aria-invalid={Boolean(fieldErrors?.hoursTotal)}
          />
          {fieldErrors?.hoursTotal ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.hoursTotal}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Summary</label>
        <textarea
          name="summary"
          rows={3}
          defaultValue={defaults?.summary ?? ""}
          className={cn(
            "w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-input/30",
          )}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Achievements</label>
        <textarea
          name="achievements"
          rows={3}
          defaultValue={defaults?.achievements ?? ""}
          className={cn(
            "w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-input/30",
          )}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Blockers</label>
        <textarea
          name="blockers"
          rows={3}
          defaultValue={defaults?.blockers ?? ""}
          className={cn(
            "w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-input/30",
          )}
        />
      </div>
    </div>
  );
}

