import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KPIStatCard({
  label,
  value,
  hint,
  className,
  /** Stronger frame for hero metrics in demos and dashboards. */
  emphasis = false,
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
  emphasis?: boolean;
}) {
  return (
    <Card
      size="sm"
      className={cn(
        "shadow-sm ring-1 ring-foreground/5",
        emphasis &&
          "border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-transparent to-transparent ring-primary/10",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <CardDescription className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </CardDescription>
        <CardTitle
          className={cn(
            "font-semibold tabular-nums tracking-tight text-foreground",
            emphasis ? "text-2xl sm:text-[1.65rem]" : "text-xl sm:text-2xl",
          )}
        >
          {value}
        </CardTitle>
        {hint ? (
          <p className="text-xs leading-snug text-muted-foreground">{hint}</p>
        ) : null}
      </CardHeader>
    </Card>
  );
}
