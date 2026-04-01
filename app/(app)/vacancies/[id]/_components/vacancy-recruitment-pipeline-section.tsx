import Link from "next/link";

import { ApplicationStageBadge } from "@/components/application-stage-badge";
import { ApplicationStatusBadge } from "@/components/application-status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VacancyPipelineRowUi } from "@/lib/vacancy-applications/types";

import { VacancyApplicationEditDialog } from "./vacancy-application-edit-dialog";

export function VacancyRecruitmentPipelineSection({
  applications,
  canManage,
}: {
  applications: VacancyPipelineRowUi[];
  canManage: boolean;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-medium">Recruitment pipeline</CardTitle>
        <CardDescription>
          Candidates in this vacancy’s process. Separate from match scores and
          placements.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {applications.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No applications on file for this vacancy.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[200px]">Candidate</TableHead>
                <TableHead className="w-[160px]">Stage</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead>Source</TableHead>
                {canManage ? <TableHead className="w-[110px]" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((a) => (
                <TableRow key={a.applicationId}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/candidates/${a.candidateId}`}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      {a.candidateName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <ApplicationStageBadge stage={a.stage} />
                  </TableCell>
                  <TableCell>
                    <ApplicationStatusBadge status={a.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {a.sourceLabel}
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <VacancyApplicationEditDialog row={a} />
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
