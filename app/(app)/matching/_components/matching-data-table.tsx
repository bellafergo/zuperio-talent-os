"use client";

import Link from "next/link";

import { EmptyState } from "@/components/layout";
import { MatchRecommendationBadge } from "@/components/match-recommendation-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MatchMatrixRowUi } from "@/lib/matching/types";

export function MatchingDataTable({ rows }: { rows: MatchMatrixRowUi[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        variant="embedded"
        title="No scored matches"
        description="Seed the app or run a match sync to populate candidate–vacancy scores."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="max-w-[140px]">Candidate</TableHead>
          <TableHead className="max-w-[160px]">Vacancy</TableHead>
          <TableHead>Company</TableHead>
          <TableHead className="w-[56px] text-right">Score</TableHead>
          <TableHead className="w-[108px]">Match</TableHead>
          <TableHead className="w-[88px]">Matrix</TableHead>
          <TableHead className="min-w-[200px]">Explanation</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.matchId}>
            <TableCell className="font-medium">
              <Link
                href={`/candidates/${r.candidateId}`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                {r.candidateName}
              </Link>
            </TableCell>
            <TableCell>
              <Link
                href={`/vacancies/${r.vacancyId}`}
                className="text-muted-foreground underline-offset-4 hover:underline"
              >
                <span className="line-clamp-2">{r.vacancyTitle}</span>
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {r.companyName}
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {r.score}
            </TableCell>
            <TableCell>
              <MatchRecommendationBadge recommendation={r.recommendation} />
            </TableCell>
            <TableCell>
              <Link
                href={`/matching/compare/${r.matchId}`}
                className="text-sm text-foreground underline-offset-4 hover:underline"
              >
                Compare
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              <span
                className="line-clamp-2 text-sm leading-relaxed"
                title={r.explanation}
              >
                {r.explanation}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
