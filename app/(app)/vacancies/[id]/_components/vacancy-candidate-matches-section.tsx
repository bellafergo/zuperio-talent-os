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
        <CardTitle className="text-base font-medium">
          Candidatos con match
        </CardTitle>
        <CardDescription>
          Cobertura de tus skills requeridos vs el perfil estructurado de cada
          candidato. Sin requisitos requeridos no hay puntaje.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {matches.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sin coincidencias puntuadas. Agrega skills{" "}
            <span className="font-medium">requeridos</span> a la vacante y
            sincroniza matching.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[200px]">Candidato</TableHead>
                <TableHead className="w-[88px] text-right">Match</TableHead>
                <TableHead className="w-[120px]">Nivel</TableHead>
                <TableHead className="w-[100px]">Detalle</TableHead>
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
                  <TableCell className="text-right">
                    <span className="tabular-nums text-base font-semibold text-foreground">
                      {m.score}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <MatchRecommendationBadge
                      recommendation={m.recommendation}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/matching/compare/${m.matchId}`}
                      className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      Ver detalle
                    </Link>
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
