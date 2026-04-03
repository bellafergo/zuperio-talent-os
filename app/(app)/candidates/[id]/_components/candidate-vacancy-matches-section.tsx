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
        <CardTitle className="text-base font-medium">Vacantes con match</CardTitle>
        <CardDescription>
          Puntaje = porcentaje de skills requeridos de la vacante que el candidato
          tiene en su perfil estructurado (determinista, sin IA). Alto ≥90%,
          medio ≥70%, bajo &lt;70%.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {matches.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sin matches aún. Asegúrate de que la vacante tenga skills{" "}
            <span className="font-medium">requeridos</span> y el candidato skills
            estructurados; luego sincroniza matching.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[200px]">Vacante</TableHead>
                <TableHead>Empresa</TableHead>
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
                      href={`/vacancies/${m.vacancyId}`}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      <span className="line-clamp-2">{m.vacancyTitle}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.companyName}
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
