import { auth } from "@/auth";
import { canManageWeeklyLogs } from "@/lib/auth/weekly-log-access";
import {
  listPlacementsForWeeklyLogForm,
  listWeeklyLogsForUi,
} from "@/lib/weekly-logs/queries";

import { WeeklyLogsHeader } from "./_components/weekly-logs-header";
import { WeeklyLogsModule } from "./_components/weekly-logs-module";

export const dynamic = "force-dynamic";

export default async function WeeklyLogsPage() {
  const session = await auth();
  const canManage = canManageWeeklyLogs(session?.user?.role);

  const [rows, placements] = await Promise.all([
    listWeeklyLogsForUi(),
    canManage ? listPlacementsForWeeklyLogForm() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-8">
      <WeeklyLogsHeader canManage={canManage} placements={placements} />
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ring-foreground/5 sm:p-5">
        <WeeklyLogsModule rows={rows} canManage={canManage} placements={placements} />
      </div>
    </div>
  );
}
