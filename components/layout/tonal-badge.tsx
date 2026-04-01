import type { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-border bg-muted/40 text-foreground",
  success:
    "border-emerald-600/25 bg-emerald-50/90 text-emerald-950 dark:border-emerald-500/25 dark:bg-emerald-950/40 dark:text-emerald-50",
  warning:
    "border-amber-600/25 bg-amber-50/90 text-amber-950 dark:border-amber-500/25 dark:bg-amber-950/40 dark:text-amber-50",
  danger:
    "border-rose-600/25 bg-rose-50/90 text-rose-950 dark:border-rose-500/25 dark:bg-rose-950/40 dark:text-rose-50",
  info: "border-sky-600/25 bg-sky-50/90 text-sky-950 dark:border-sky-500/25 dark:bg-sky-950/40 dark:text-sky-50",
} as const;

export function TonalBadge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<typeof Badge> & { tone?: keyof typeof tones }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", tones[tone], className)}
      {...props}
    />
  );
}
