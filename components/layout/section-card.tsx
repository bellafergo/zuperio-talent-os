import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  description,
  children,
  className,
  headerAction,
  contentClassName,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  contentClassName?: string;
}) {
  return (
    <Card
      className={cn("shadow-sm ring-1 ring-foreground/5", className)}
    >
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            {description ? (
              <CardDescription className="text-pretty">{description}</CardDescription>
            ) : null}
          </div>
          {headerAction ? (
            <div className="shrink-0 pt-0.5">{headerAction}</div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className={cn("pt-4", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
