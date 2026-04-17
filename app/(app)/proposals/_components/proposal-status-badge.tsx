import { Badge } from "@/components/ui/badge";
import type { ProposalStatusValue, ProposalStatusUi } from "@/lib/proposals/types";
import { cn } from "@/lib/utils";

const VARIANT: Partial<
  Record<ProposalStatusValue, "default" | "secondary" | "outline" | "destructive">
> = {
  DRAFT: "secondary",
  SENT: "default",
  VIEWED: "outline",
  IN_NEGOTIATION: "outline",
  WON: "default",
  LOST: "destructive",
};

export function ProposalStatusBadge({
  label,
  value,
  className,
}: {
  label: ProposalStatusUi;
  value: ProposalStatusValue;
  className?: string;
}) {
  return (
    <Badge
      variant={VARIANT[value] ?? "secondary"}
      className={cn(
        value === "WON" &&
          "bg-emerald-600 text-white hover:bg-emerald-600/90 dark:bg-emerald-700",
        className,
      )}
    >
      {label}
    </Badge>
  );
}
