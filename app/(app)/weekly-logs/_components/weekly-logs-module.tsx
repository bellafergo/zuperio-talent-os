"use client";

import * as React from "react";

import type {
  WeeklyLogListRowUi,
  WeeklyLogPlacementOption,
} from "@/lib/weekly-logs/types";

import { WeeklyLogsFilters, type WeeklyLogsFilterState } from "./weekly-logs-filters";
import { WeeklyLogsSummaryCards } from "./weekly-logs-summary-cards";
import { WeeklyLogsTable } from "./weekly-logs-table";

const DEFAULT_FILTERS: WeeklyLogsFilterState = {
  overdueOnly: false,
  status: "ALL",
};

export function WeeklyLogsModule({
  rows,
  canManage,
  placements,
}: {
  rows: WeeklyLogListRowUi[];
  canManage: boolean;
  placements: WeeklyLogPlacementOption[];
}) {
  const [filters, setFilters] = React.useState<WeeklyLogsFilterState>(DEFAULT_FILTERS);

  const filtered = React.useMemo(() => {
    return rows.filter((r) => {
      if (filters.overdueOnly && !r.isOverdue) return false;
      if (filters.status !== "ALL" && r.statusValue !== filters.status) return false;
      return true;
    });
  }, [rows, filters]);

  const counts = React.useMemo(() => {
    let overdue = 0;
    let submitted = 0;
    let approved = 0;
    for (const r of rows) {
      if (r.isOverdue) overdue += 1;
      if (r.statusValue === "SUBMITTED") submitted += 1;
      if (r.statusValue === "APPROVED") approved += 1;
    }
    return { total: rows.length, overdue, submitted, approved };
  }, [rows]);

  return (
    <div className="space-y-4">
      <WeeklyLogsSummaryCards {...counts} />
      <WeeklyLogsFilters value={filters} onChange={setFilters} />
      <WeeklyLogsTable rows={filtered} canManage={canManage} placements={placements} />
    </div>
  );
}

