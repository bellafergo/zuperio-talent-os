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
          Deterministic v1 scores from seniority, availability, skills overlap,
          and role keywords. Database-backed.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {matches.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No scored matches for this vacancy. Ensure vacancy skills are set and
            run seed or a match sync.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[180px]">Candidate</TableHead>
                <TableHead className="max-w-[160px]">Role</TableHead>
                <TableHead className="w-[88px]">Seniority</TableHead>
                <TableHead className="w-[64px] text-right">Score</TableHead>
                <TableHead className="w-[120px]">Match</TableHead>
                <TableHead className="max-w-[240px]">Note</TableHead>
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
                  <TableCell className="text-muted-foreground">
                    <span className="line-clamp-2">{m.candidateRole}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.candidateSeniority}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {m.score}
                  </TableCell>
                  <TableCell>
                    <MatchRecommendationBadge
                      recommendation={m.recommendation}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.skillsMatchNotes ? (
                      <span
                        className="line-clamp-2 text-sm"
                        title={m.skillsMatchNotes}
                      >
                        {m.skillsMatchNotes}
                      </span>
                    ) : (
                      "—"
                    )}
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
