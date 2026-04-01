"use client";

import { DownloadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function ProposalCvDownloadButton({
  candidateId,
}: {
  candidateId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/cv-pdf`, {
        credentials: "include",
      });
      if (!res.ok) {
        let message = res.statusText;
        try {
          const j = (await res.json()) as { error?: string };
          if (j.error) message = j.error;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition");
      let name = `Zuperio-CV-${candidateId}.pdf`;
      const m = cd?.match(/filename="([^"]+)"/i) ?? cd?.match(/filename=([^;]+)/i);
      if (m?.[1]) name = m[1].trim();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo generar el CV");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">CV en PDF</p>
        <p className="text-xs text-muted-foreground">
          Misma plantilla que la vista de impresión del candidato (skills,
          experiencia, notas).
        </p>
      </div>
      <div className="flex flex-col items-stretch gap-2 sm:items-end">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={onClick}
          className="gap-1.5"
        >
          <DownloadIcon className="size-3.5" aria-hidden />
          {pending ? "Generando…" : "Descargar CV (PDF)"}
        </Button>
        {error ? (
          <p className="max-w-[min(100%,420px)] text-right text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
