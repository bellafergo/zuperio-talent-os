/**
 * Shown while the proposal detail `page` resolves (core query + secondary data).
 * Keeps layout shell from `(app)`; this replaces only the segment default.
 */
export default function ProposalDetailLoading() {
  return (
    <div
      className="space-y-8"
      aria-busy="true"
      aria-live="polite"
      aria-label="Cargando detalle de propuesta"
    >
      <div className="space-y-3">
        <div className="h-3 w-28 animate-pulse rounded-md bg-muted" />
        <div className="h-8 max-w-md animate-pulse rounded-md bg-muted" />
        <div className="h-4 max-w-2xl animate-pulse rounded-md bg-muted" />
        <div className="flex flex-wrap gap-2 pt-1">
          <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
      <div className="h-36 animate-pulse rounded-xl border border-border/60 bg-muted/30" />
      <div className="h-72 animate-pulse rounded-xl border border-border/60 bg-muted/30" />
    </div>
  );
}
