import Link from "next/link";

import { EmptyState, SectionCard } from "@/components/layout";
import { PlacementStatusBadge } from "@/components/placement-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlacementListRowUi } from "@/lib/placements/types";

export function CompanyPlacementsSection({
  placements,
}: {
  placements: PlacementListRowUi[];
}) {
  return (
    <SectionCard
      title="Placements"
      description="Candidates on assignment with this account (active and historical)."
      contentClassName="pt-4"
    >
      {placements.length === 0 ? (
        <EmptyState
          variant="embedded"
          title="No placements yet"
          description="When candidates are assigned to vacancies for this company, they will appear here."
        />
      ) : (
        <div className="-mx-4 max-w-[calc(100%+2rem)] sm:mx-0 sm:max-w-none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[180px]">Candidate</TableHead>
                <TableHead className="max-w-[220px]">Role</TableHead>
                <TableHead className="w-[120px]">Start date</TableHead>
                <TableHead className="w-[110px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placements.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/candidates/${r.candidateId}`}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      {r.candidateName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Link
                      href={`/vacancies/${r.vacancyId}`}
                      className="underline-offset-4 hover:underline"
                    >
                      <span className="line-clamp-2">{r.vacancyTitle}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.startDateLabel}
                  </TableCell>
                  <TableCell>
                    <PlacementStatusBadge status={r.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SectionCard>
  );
}
