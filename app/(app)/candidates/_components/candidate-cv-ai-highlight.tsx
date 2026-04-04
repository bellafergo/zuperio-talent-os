"use client";

import * as React from "react";
import { ClipboardCopyIcon, RefreshCwIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/layout";
import type { CvHighlightResult } from "@/app/api/ai/cv-highlight/route";

type Props = {
  candidateId: string;
  vacancyId: string | null;
  vacancyTitle: string | null;
  cvRawText: string | null;
  aiConfigured: boolean;
};

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: CvHighlightResult }
  | { status: "error"; message: string };

function scoreColor(score: number): string {
  if (score <= 4) return "text-destructive";
  if (score <= 7) return "text-yellow-600 dark:text-yellow-400";
  return "text-green-600 dark:text-green-400";
}

function scoreBg(score: number): string {
  if (score <= 4) return "bg-destructive/10 border-destructive/20";
  if (score <= 7) return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800";
  return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800";
}

export function CandidateCvAiHighlight({
  candidateId,
  vacancyId,
  vacancyTitle,
  cvRawText,
  aiConfigured,
}: Props) {
  const [state, setState] = React.useState<State>({ status: "idle" });
  const [copied, setCopied] = React.useState(false);

  const canRun = Boolean(vacancyId && cvRawText && aiConfigured);

  async function run() {
    if (!vacancyId) return;
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/ai/cv-highlight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, vacancyId }),
      });
      const data = (await res.json()) as { ok: boolean; result?: CvHighlightResult; error?: string };
      if (!data.ok || !data.result) {
        setState({ status: "error", message: data.error ?? "Error desconocido" });
        return;
      }
      setState({ status: "done", result: data.result });
    } catch {
      setState({ status: "error", message: "No se pudo conectar con el servidor de IA." });
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  }

  if (!vacancyId) return null;

  return (
    <SectionCard
      title="Análisis de CV para la vacante"
      description={`Resumen de experiencia relevante generado por IA${vacancyTitle ? ` para "${vacancyTitle}"` : ""}.`}
    >
      {state.status === "idle" || state.status === "error" ? (
        <div className="flex flex-col gap-3">
          {state.status === "error" ? (
            <p className="text-sm text-destructive">{state.message}</p>
          ) : null}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={run}
              disabled={!canRun}
              title={
                !aiConfigured
                  ? "IA no configurada (ANTHROPIC_API_KEY)"
                  : !cvRawText
                    ? "El candidato no tiene CV con texto extraído"
                    : undefined
              }
              className="gap-1.5"
            >
              <SparklesIcon className="size-3.5" aria-hidden />
              {state.status === "error" ? "Reintentar análisis" : `Analizar para${vacancyTitle ? ` "${vacancyTitle}"` : " la vacante"}`}
            </Button>
            {!aiConfigured ? (
              <span className="text-xs text-muted-foreground">IA no configurada</span>
            ) : !cvRawText ? (
              <span className="text-xs text-muted-foreground">Sin texto de CV extraído</span>
            ) : null}
          </div>
        </div>
      ) : null}

      {state.status === "loading" ? (
        <div className="space-y-3">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <p className="text-xs text-muted-foreground pt-1">Claude está analizando el CV…</p>
        </div>
      ) : null}

      {state.status === "done" ? (
        <div className="space-y-5">
          {/* Score + summary header */}
          <div className={`flex items-start gap-4 rounded-lg border p-4 ${scoreBg(state.result.matchScore)}`}>
            <div className="flex flex-col items-center shrink-0">
              <span className={`text-3xl font-bold tabular-nums ${scoreColor(state.result.matchScore)}`}>
                {state.result.matchScore}
              </span>
              <span className="text-xs text-muted-foreground">/ 10</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium mb-1">Resumen ejecutivo</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{state.result.summary}</p>
            </div>
          </div>

          {/* Highlights */}
          {state.result.highlights.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Experiencias relevantes</p>
              <div className="space-y-3">
                {state.result.highlights.map((h, i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                    <p className="text-sm font-medium">{h.role}</p>
                    <p className="text-xs text-primary/80 font-medium">{h.relevance}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{h.paraphrase}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Gaps */}
          {state.result.gaps.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Posibles brechas</p>
              <ul className="space-y-1">
                {state.result.gaps.map((g, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-destructive shrink-0">·</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => copyToClipboard(state.result.summary)}
            >
              <ClipboardCopyIcon className="size-3.5" aria-hidden />
              {copied ? "Copiado" : "Copiar resumen"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={run}
            >
              <RefreshCwIcon className="size-3.5" aria-hidden />
              Regenerar
            </Button>
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}
