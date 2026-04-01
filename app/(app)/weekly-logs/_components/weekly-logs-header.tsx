import type { WeeklyLogPlacementOption } from "@/lib/weekly-logs/types";

import { WeeklyLogsNewWeeklyLogDialog } from "./weekly-logs-new-weekly-log-dialog";

export function WeeklyLogsHeader({
  canManage,
  placements,
}: {
  canManage: boolean;
  placements: WeeklyLogPlacementOption[];
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Weekly Logs
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Weekly status updates tied to active placements. Logs are stored in PostgreSQL
          and reviewed internally.
        </p>
      </div>
      {canManage ? <WeeklyLogsNewWeeklyLogDialog placements={placements} /> : null}
    </div>
  );
}

