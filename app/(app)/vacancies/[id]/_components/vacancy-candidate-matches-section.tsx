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
import type { VacancyMatchRowUi } from "@/lib/matching/types";

export function VacancyCandidateMatchesSection({
  matches,
}: {
  matches: VacancyMatchRowUi[];
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-medium">Candidate matches</CardTitle>
        <CardDescription>
          Structured skills vs vacancy requirements, seniority, availability, and
          role fit — deterministic, no AI. Re-sync after changing skills or reqs.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {matches.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No scored matches. Add structured requirements and candidate skills,
            then run seed or match sync.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[200px]">Candidate</TableHead>
                <TableHead className="w-[64px] text-right">Score</TableHead>
                <TableHead className="w-[120px]">Match</TableHead>
                <TableHead className="w-[88px]">Matrix</TableHead>
                <TableHead className="min-w-[240px]">Explanation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((m) => (
                <TableRow key={m.matchId}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/candidates/${m.candidateId}`}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      {m.candidateName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {m.score}
                  </TableCell>
                  <TableCell>
                    <MatchRecommendationBadge
                      recommendation={m.recommendation}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/matching/compare/${m.matchId}`}
                      className="text-sm text-foreground underline-offset-4 hover:underline"
                    >
                      Matrix
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <span
                      className="line-clamp-3 text-sm leading-relaxed"
                      title={m.explanation}
                    >
                      {m.explanation}
                    </span>
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
