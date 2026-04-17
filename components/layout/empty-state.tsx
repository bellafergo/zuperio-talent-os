import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
  variant = "standalone",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  /** `embedded` = inside a bordered shell (no extra dashed frame). */
  variant?: "standalone" | "embedded";
}) {
  if (variant === "embedded") {
    return (
      <div className={cn("px-2 py-10 text-center", className)}>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 px-6 py-14 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
