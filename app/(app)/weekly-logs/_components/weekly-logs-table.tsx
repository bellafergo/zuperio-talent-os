import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WeeklyLogListRowUi, WeeklyLogPlacementOption } from "@/lib/weekly-logs/types";

import { WeeklyLogEditDialog } from "./weekly-log-edit-dialog";
import { WeeklyLogStatusBadge } from "./weekly-log-status-badge";

export function WeeklyLogsTable({
  rows,
  canManage,
  placements,
}: {
  rows: WeeklyLogListRowUi[];
  canManage: boolean;
  placements: WeeklyLogPlacementOption[];
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center text-sm text-muted-foreground">
        No weekly logs yet. Create the first update for an active placement.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="max-w-[180px]">Candidate</TableHead>
          <TableHead>Company</TableHead>
          <TableHead className="max-w-[220px]">Role</TableHead>
          <TableHead className="w-[220px]">Week</TableHead>
          <TableHead className="w-[110px]">Status</TableHead>
          <TableHead className="w-[100px] text-right">Hours</TableHead>
          {canManage ? <TableHead className="w-[110px]" /> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-medium">{r.candidateName}</TableCell>
            <TableCell className="text-muted-foreground">{r.companyName}</TableCell>
            <TableCell className="text-muted-foreground">
              <span className="line-clamp-2">{r.vacancyTitle}</span>
            </TableCell>
            <TableCell className="text-muted-foreground">{r.weekLabel}</TableCell>
            <TableCell>
              <WeeklyLogStatusBadge status={r.status} />
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {r.hoursTotalAmount == null ? "—" : r.hoursTotalAmount.toString()}
            </TableCell>
            {canManage ? (
              <TableCell className="text-right">
                <WeeklyLogEditDialog row={r} placements={placements} />
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

