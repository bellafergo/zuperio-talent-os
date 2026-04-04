/**
 * Shown while the candidate detail `page` resolves (core query + secondary data).
 */
export default function CandidateDetailLoading() {
  return (
    <div
      className="space-y-8"
      aria-busy="true"
      aria-live="polite"
      aria-label="Cargando detalle de candidato"
    >
      <div className="space-y-3">
        <div className="h-8 max-w-sm animate-pulse rounded-md bg-muted" />
        <div className="h-4 max-w-xl animate-pulse rounded-md bg-muted" />
        <div className="h-6 w-28 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border border-border/60 bg-muted/30"
          />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-xl border border-border/60 bg-muted/30" />
      <div className="h-32 animate-pulse rounded-xl border border-border/60 bg-muted/30" />
    </div>
  );
}
