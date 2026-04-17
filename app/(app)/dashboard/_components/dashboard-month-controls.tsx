import Link from "next/link";

const MONTH_LABELS: { value: number; label: string }[] = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

function yearOptions(centerYear: number): number[] {
  const out: number[] = [];
  for (let y = centerYear - 3; y <= centerYear + 2; y++) {
    if (y >= 2020 && y <= 2035) out.push(y);
  }
  return out.length > 0 ? out : [centerYear];
}

export function DashboardMonthControls({
  year,
  month,
  periodLabel,
  isDirector,
}: {
  year: number;
  month: number;
  periodLabel: string;
  isDirector: boolean;
}) {
  const q = `month=${month}&year=${year}`;
  const years = yearOptions(year);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/25 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Periodo operativo
        </p>
        <p className="text-sm font-medium text-foreground capitalize">{periodLabel}</p>
      </div>
      <form
        method="get"
        action="/dashboard"
        className="flex flex-wrap items-end gap-3"
      >
        <div className="space-y-1">
          <label htmlFor="dash-month" className="text-xs text-muted-foreground">
            Mes
          </label>
          <select
            id="dash-month"
            name="month"
            defaultValue={month}
            className="h-9 min-w-[9.5rem] rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            {MONTH_LABELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="dash-year" className="text-xs text-muted-foreground">
            Año
          </label>
          <select
            id="dash-year"
            name="year"
            defaultValue={year}
            className="h-9 min-w-[5.5rem] rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm font-medium hover:bg-muted/60 dark:bg-input/30"
        >
          Ver
        </button>
      </form>
      {isDirector ? (
        <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3 sm:border-t-0 sm:pt-0">
          <span className="w-full text-xs text-muted-foreground sm:w-auto sm:self-center">
            Reportes (Dirección)
          </span>
          <Link
            href={`/api/dashboard/export-closures?${q}`}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted/60"
          >
            CSV cierres
          </Link>
          <Link
            href={`/api/dashboard/export-hires?${q}`}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted/60"
          >
            CSV contrataciones
          </Link>
        </div>
      ) : null}
    </div>
  );
}
