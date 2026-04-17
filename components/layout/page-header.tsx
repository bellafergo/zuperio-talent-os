import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function PageHeader({
  variant = "list",
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Back",
  actions,
  meta,
  className,
}: {
  variant?: "list" | "detail";
  eyebrow?: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  const titleBlock = (
    <div className="min-w-0 space-y-2">
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem] sm:leading-tight">
        {title}
      </h1>
      {description ? (
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {meta ? (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">{meta}</div>
      ) : null}
    </div>
  );

  if (variant === "detail") {
    return (
      <div className={cn("space-y-6", className)}>
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
            {backLabel}
          </Link>
        ) : null}
        <div className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          {titleBlock}
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6",
        className,
      )}
    >
      {titleBlock}
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
