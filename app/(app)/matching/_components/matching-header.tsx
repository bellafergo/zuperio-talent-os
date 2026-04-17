import { PageHeader } from "@/components/layout";

export function MatchingHeader({ pairCount }: { pairCount: number }) {
  return (
    <PageHeader
      variant="list"
      eyebrow="Matching de talento"
      title="Matching"
      description="Pares candidato–vacante puntuados con skills estructurados, seniority, disponibilidad (incl. colocaciones activas) y palabras clave del rol. Sin IA: mismas entradas, mismo score."
      meta={
        <span className="text-sm tabular-nums text-muted-foreground">
          {pairCount === 0
            ? "Sin pares puntuados"
            : `${pairCount.toLocaleString("es-MX")} ${pairCount === 1 ? "par" : "pares"} puntuados`}
        </span>
      }
    />
  );
}
