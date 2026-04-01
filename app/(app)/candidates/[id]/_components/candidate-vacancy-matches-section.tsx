import Link from "next/link";

import { MatchRecommendationBadge } from "@/components/match-recommendation-badge";
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
import type { CandidateMatchRowUi } from "@/lib/matching/types";

export function CandidateVacancyMatchesSection({
  matches,
}: {
  matches: CandidateMatchRowUi[];
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-medium">Matching vacancies</CardTitle>
        <CardDescription>
          Open roles ranked by the same v1 matching rules used across the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {matches.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No scored vacancy matches for this candidate yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[220px]">Vacancy</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="w-[64px] text-right">Score</TableHead>
                <TableHead className="w-[120px]">Match</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((m) => (
                <TableRow key={m.matchId}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/vacancies/${m.vacancyId}`}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      <span className="line-clamp-2">{m.vacancyTitle}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.companyName}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {m.score}
                  </TableCell>
                  <TableCell>
                    <MatchRecommendationBadge
                      recommendation={m.recommendation}
                    />
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
