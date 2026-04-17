"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Recovery UI for App Router `error.tsx` on operational detail routes.
 */
export function DetailRouteError({
  error,
  reset,
  backHref,
  backLabel,
  contextTitle,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  backHref: string;
  backLabel: string;
  /** Short phrase, e.g. "esta propuesta" / "este candidato" */
  contextTitle: string;
}) {
  useEffect(() => {
    console.error(`[detail-route-error] ${contextTitle}`, error);
  }, [error, contextTitle]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-lg font-semibold text-foreground">
          No se pudo cargar {contextTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          Ocurrió un error al mostrar esta página. Puede reintentar o volver al
          listado.
        </p>
        {process.env.NODE_ENV === "development" && error.message ? (
          <p className="font-mono text-xs text-muted-foreground">{error.message}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => reset()}>
          Reintentar
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
