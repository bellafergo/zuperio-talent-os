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
import type { CandidateApplicationRowUi } from "@/lib/vacancy-applications/types";

export function CandidateApplicationsSection({
  applications,
}: {
  applications: CandidateApplicationRowUi[];
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-medium">Applications</CardTitle>
        <CardDescription>
          Vacancy pipelines this candidate is or was in (independent from
          matching and placements).
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {applications.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No vacancy applications on file.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[220px]">Vacancy</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="w-[160px]">Stage</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((a) => (
                <TableRow key={a.applicationId}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/vacancies/${a.vacancyId}`}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      <span className="line-clamp-2">{a.vacancyTitle}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Link
                      href={`/companies/${a.companyId}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {a.companyName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <ApplicationStageBadge stage={a.stage} />
                  </TableCell>
                  <TableCell>
                    <ApplicationStatusBadge status={a.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
