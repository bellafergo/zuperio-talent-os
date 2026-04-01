"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type WeeklyLogsFilterState = {
  overdueOnly: boolean;
  status: "ALL" | "DRAFT" | "SUBMITTED" | "APPROVED" | "RETURNED";
};

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
);

export function WeeklyLogsFilters({
  value,
  onChange,
}: {
  value: WeeklyLogsFilterState;
  onChange: (next: WeeklyLogsFilterState) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={value.overdueOnly ? "default" : "outline"}
            size="sm"
            onClick={() => onChange({ ...value, overdueOnly: !value.overdueOnly })}
          >
            Overdue
          </Button>
          <p className="text-xs text-muted-foreground">
            Shows logs past the deadline and not submitted/approved.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-xs font-medium text-muted-foreground">Status</p>
        <select
          className={selectClass}
          value={value.status}
          onChange={(e) =>
            onChange({
              ...value,
              status: e.target.value as WeeklyLogsFilterState["status"],
            })
          }
        >
          <option value="ALL">All</option>
          <option value="DRAFT">Draft</option>
          <option value="RETURNED">Returned</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="APPROVED">Approved</option>
        </select>
      </div>
    </div>
  );
}

