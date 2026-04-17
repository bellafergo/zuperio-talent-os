import Link from "next/link";

import { cn } from "@/lib/utils";

export type DetailGridItem = {
  label: string;
  value: string;
  href?: string;
};

export function DetailGrid({
  items,
  className,
  columnsClassName = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  items: DetailGridItem[];
  className?: string;
  columnsClassName?: string;
}) {
  return (
    <div className={cn("grid gap-3", columnsClassName, className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm ring-1 ring-foreground/5"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-1.5 text-sm font-medium leading-snug text-foreground">
            {item.href ? (
              <Link
                href={item.href}
                className="text-foreground underline-offset-4 hover:underline"
              >
                {item.value}
              </Link>
            ) : (
              item.value
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
