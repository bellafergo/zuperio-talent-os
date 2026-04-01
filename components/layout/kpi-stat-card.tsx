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
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <Card
      size="sm"
      className={cn("shadow-sm ring-1 ring-foreground/5", className)}
    >
      <CardHeader className="pb-2">
        <CardDescription className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </CardDescription>
        <CardTitle className="text-xl font-semibold tabular-nums tracking-tight text-foreground sm:text-2xl">
          {value}
        </CardTitle>
        {hint ? (
          <p className="text-xs leading-snug text-muted-foreground">{hint}</p>
        ) : null}
      </CardHeader>
    </Card>
  );
}
