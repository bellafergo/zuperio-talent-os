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
        <CardTitle className="text-base font-medium">Candidatos con coincidencia</CardTitle>
        <CardDescription>
          Skills estructurados vs requisitos de la vacante, seniority, disponibilidad
          y fit de rol — determinista, sin IA. Resincroniza al cambiar skills o requisitos.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {matches.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sin coincidencias puntuadas. Agrega requisitos estructurados y skills
            de candidatos para calcular scores.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[200px]">Candidato</TableHead>
                <TableHead className="w-[64px] text-right">Puntaje</TableHead>
                <TableHead className="w-[120px]">Coincidencia</TableHead>
                <TableHead className="w-[88px]">Matriz</TableHead>
                <TableHead className="min-w-[240px]">Explicación</TableHead>
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
                      Matriz
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
