import { PageHeader } from "@/components/layout";
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
    <PageHeader
      variant="list"
      title="Weekly logs"
      description="Weekly status updates tied to active placements. Logs are stored in PostgreSQL and reviewed internally."
      actions={
        canManage ? <WeeklyLogsNewWeeklyLogDialog placements={placements} /> : null
      }
    />
  );
}

