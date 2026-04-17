"use client";

import { ClipboardCopyIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/layout";
import {
  genericInterviewTemplateLabelEs,
  getGenericInterviewGroups,
} from "@/lib/interviews/generic-questions";
import { resolveInterviewTemplateKey } from "@/lib/interviews/role-map";
import { cn } from "@/lib/utils";

export type VacancyInterviewPrepCandidateOption = {
  id: string;
  displayName: string;
  role: string;
};

function buildGenericCopyText(
  templateLabel: string,
  groups: ReturnType<typeof getGenericInterviewGroups>,
): string {
  const lines: string[] = [
    `Guía genérica — ${templateLabel}`,
    "",
  ];
  for (const g of groups) {
    lines.push(g.titleEs);
    lines.push("");
    g.questions.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
    lines.push("");
  }
  return lines.join("\n").trim();
}

export function VacancyInterviewPrepSection({
  vacancyId,
  vacancyTitle,
  vacancySeniority,
  vacancySkillsLine,
  vacancyRoleSummary,
  requirementNames,
  candidates,
}: {
  vacancyId: string;
  vacancyTitle: string;
  vacancySeniority: string;
  vacancySkillsLine: string | null;
  vacancyRoleSummary: string | null;
  requirementNames: string[];
  candidates: VacancyInterviewPrepCandidateOption[];
}) {
  const [selectedId, setSelectedId] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (selectedId) return;
    const first = candidates[0]?.id;
    if (first) setSelectedId(first);
  }, [candidates, selectedId]);

  const selected = useMemo(
    () => candidates.find((c) => c.id === selectedId),
    [candidates, selectedId],
  );

  const templateKey = resolveInterviewTemplateKey({
    vacancyTitle,
    vacancySkillsLine,
    vacancyRoleSummary,
    vacancySeniority,
    vacancyRequirementNames:
      requirementNames.length > 0 ? requirementNames.join(", ") : null,
    candidateRole: "",
  });

  const groups = getGenericInterviewGroups(templateKey);
  const templateLabel = genericInterviewTemplateLabelEs(templateKey);

  async function copyText(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setAiNotice(`Copiado: ${label}`);
      setTimeout(() => setAiNotice(null), 2500);
    } catch {
      setAiError("No se pudo copiar al portapapeles.");
    }
  }

  async function generateAi() {
    setAiError(null);
    setAiNotice(null);
    if (!selectedId) {
      setAiError("Selecciona un candidato en proceso para generar con IA.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/interviews/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ candidateId: selectedId, vacancyId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        code?: string;
        formattedText?: string;
      };
      if (!res.ok || data.ok === false) {
        setAiText("");
        setAiError(
          data.error ??
            "No se pudieron generar preguntas con IA. Puedes usar la guía genérica.",
        );
        return;
      }
      setAiText(data.formattedText ?? "");
    } catch {
      setAiText("");
      setAiError(
        "Error de red al llamar a la IA. Revisa la conexión e inténtalo de nuevo.",
      );
    } finally {
      setGenerating(false);
    }
  }

  const genericCopy = buildGenericCopyText(templateLabel, groups);
  const rs = vacancyRoleSummary?.trim() ?? "";
  const contextHint = [
    vacancyTitle && `Vacante: ${vacancyTitle}`,
    vacancySeniority && `Senioridad vacante: ${vacancySeniority}`,
    requirementNames.length > 0 &&
      `Requisitos: ${requirementNames.slice(0, 12).join(", ")}${requirementNames.length > 12 ? "…" : ""}`,
    rs && `Alcance: ${rs.slice(0, 200)}${rs.length > 200 ? "…" : ""}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <SectionCard
      title="Preparación de entrevista"
      description="Preguntas genéricas por tipo de rol y, si está configurada la IA, sugerencias adaptadas al candidato y a esta vacante. Nada se guarda automáticamente."
    >
      <div className="space-y-4 text-sm">
        <p className="text-xs text-muted-foreground text-pretty">{contextHint}</p>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground" htmlFor={`interview-cand-${vacancyId}`}>
            Candidato en proceso
          </label>
          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Cuando haya candidatos en la tabla de arriba, podrás elegir uno para contextualizar la guía y usar IA.
            </p>
          ) : (
            <select
              id={`interview-cand-${vacancyId}`}
              className={cn(
                "h-9 w-full max-w-md rounded-lg border border-input bg-background px-3 text-sm",
                "outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              )}
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName} — {c.role}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
          <p className="text-xs font-medium text-foreground">
            Plantilla genérica: {templateLabel}
          </p>
          <p className="mt-1 text-xs text-muted-foreground text-pretty">
            Se elige por el rol del candidato y el título/skills de la vacante. Útil aunque la IA no esté activa.
          </p>
          <div className="mt-3 space-y-4">
            {groups.map((g) => (
              <div key={g.id}>
                <p className="text-xs font-semibold text-foreground/90">{g.titleEs}</p>
                <ul className="mt-1.5 list-inside list-disc space-y-1 text-xs text-muted-foreground">
                  {g.questions.map((q, i) => (
                    <li key={`${g.id}-${i}`} className="text-pretty">
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => void copyText("guía genérica", genericCopy)}
            >
              <ClipboardCopyIcon className="size-3.5" aria-hidden />
              Copiar guía genérica
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-1.5"
              disabled={generating || candidates.length === 0 || !selectedId}
              onClick={() => void generateAi()}
            >
              {generating ? (
                <Loader2Icon className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <SparklesIcon className="size-3.5" aria-hidden />
              )}
              {generating ? "Generando…" : "Generar preguntas con IA"}
            </Button>
            <span className="text-xs text-muted-foreground">
              Requiere OPENAI_API_KEY en el servidor. No persiste en base de datos (v1).
            </span>
          </div>

          {aiError ? (
            <p className="text-sm text-destructive text-pretty" role="alert">
              {aiError}
            </p>
          ) : null}
          {aiNotice ? (
            <p className="text-xs text-muted-foreground" role="status">
              {aiNotice}
            </p>
          ) : null}

          <label className="text-xs font-medium text-muted-foreground" htmlFor={`interview-ai-out-${vacancyId}`}>
            Resultado IA (editable antes de copiar)
          </label>
          <textarea
            id={`interview-ai-out-${vacancyId}`}
            className={cn(
              "min-h-[200px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
              "outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
            )}
            placeholder="Las preguntas generadas aparecerán aquí. Puedes editarlas libremente."
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            spellCheck
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={!aiText.trim()}
              onClick={() => void copyText("texto IA", aiText)}
            >
              <ClipboardCopyIcon className="size-3.5" aria-hidden />
              Copiar texto IA
            </Button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
