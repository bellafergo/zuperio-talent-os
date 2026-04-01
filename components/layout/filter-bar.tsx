import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Groups filters/search controls with a consistent treatment. */
export function FilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2.5",
        className,
      )}
    >
      {children}
    </div>
  );
}
