import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DataTableShell({
  children,
  className,
  paddingClassName = "p-4 sm:p-5",
}: {
  children: ReactNode;
  className?: string;
  paddingClassName?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-foreground/5",
        paddingClassName,
        className,
      )}
    >
      {children}
    </div>
  );
}
