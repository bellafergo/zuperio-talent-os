"use client";

import * as React from "react";
import { ClipboardCopyIcon, RefreshCwIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getGenericInterviewGroups,
  genericInterviewTemplateLabelEs,
} from "@/lib/interviews/generic-questions";
import { resolveInterviewTemplateKey } from "@/lib/interviews/role-map";
import type { AiInterviewQuestions } from "@/app/api/ai/interview-questions/route";

type Tab = "template" | "ai";

type AiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; questions: AiInterviewQuestions }
  | { status: "error"; message: string };

type Props = {
  candidateId: string;
  vacancyId: string | null;
  vacancyTitle: string | null;
  candidateRole: string;
  vacancySkillsLine?: string | null;
  cvRawText: string | null;
  aiConfigured: boolean;
};

const CATEGORY_LABELS: Record<keyof AiInterviewQuestions, string> = {
  technical: "Técnicas",
  situational: "Situacionales",
  cultural: "Cultura y encaje",
  roleSpecific: "Específicas del perfil",
};

export function CandidateInterviewQuestions({
  candidateId,
  vacancyId,
  vacancyTitle,
  candidateRole,
  vacancySkillsLine,
  cvRawText,
  aiConfigured,
}: Props) {
  const hasVacancy = Boolean(vacancyId);
  const [tab, setTab] = React.useState<Tab>("template");
  const [aiState, setAiState] = React.useState<AiState>({ status: "idle" });
  const [copied, setCopied] = React.useState(false);

  const templateKey = resolveInterviewTemplateKey({
    candidateRole,
    vacancyTitle: vacancyTitle ?? "",
    vacancySkillsLine,
  });
  const templateGroups = getGenericInterviewGroups(templateKey);
  const templateLabel = genericInterviewTemplateLabelEs(templateKey);

  const canRunAi = Boolean(vacancyId && cvRawText && aiConfigured);

  async function generateAiQuestions() {
    if (!vacancyId) return;
    setAiState({ status: "loading" });
    try {
      const res = await fetch("/api/ai/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, vacancyId }),
      });
      const data = (await res.json()) as { ok: boolean; questions?: AiInterviewQuestions; error?: string };
      if (!data.ok || !data.questions) {
        setAiState({ status: "error", message: data.error ?? "Error desconocido" });
        return;
      }
      setAiState({ status: "done", questions: data.questions });
    } catch {
      setAiState({ status: "error", message: "No se pudo conectar con el servidor de IA." });
    }
  }

  async function copyAllToClipboard() {
    if (aiState.status !== "done") return;
    const q = aiState.questions;
    const lines: string[] = [];
    const section = (title: string, qs: string[]) => {
      if (qs.length === 0) return;
      lines.push(title);
      qs.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
      lines.push("");
    };
    section("Técnicas", q.technical);
    section("Situacionales", q.situational);
    section("Cultura y encaje", q.cultural);
    section("Específicas del perfil", q.roleSpecific);

    try {
      await navigator.clipboard.writeText(lines.join("\n").trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-medium">Preguntas de entrevista</CardTitle>
        <CardDescription>
          Plantilla genérica por rol
          {hasVacancy ? " y preguntas personalizadas con IA para la vacante vinculada" : ""}
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Tab switcher */}
        <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
          <button
            type="button"
            onClick={() => setTab("template")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "template"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Plantilla genérica
          </button>
          <button
            type="button"
            onClick={() => setTab("ai")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1 ${
              tab === "ai"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <SparklesIcon className="size-3" aria-hidden />
            Generadas con IA
          </button>
        </div>

        {/* Template tab */}
        {tab === "template" ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Plantilla: <span className="font-medium">{templateLabel}</span>
            </p>
            {templateGroups.map((group) => (
              <div key={group.id} className="space-y-2">
                <p className="text-sm font-medium">{group.titleEs}</p>
                <ol className="space-y-2 pl-4">
                  {group.questions.map((q, i) => (
                    <li key={i} className="text-sm text-muted-foreground leading-relaxed list-decimal">
                      {q}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        ) : null}

        {/* AI tab */}
        {tab === "ai" ? (
          <div className="space-y-4">
            {!hasVacancy ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                El candidato no tiene vacante vinculada. Vincula una vacante para generar preguntas personalizadas.
              </p>
            ) : aiState.status === "idle" || aiState.status === "error" ? (
              <div className="flex flex-col gap-3">
                {aiState.status === "error" ? (
                  <p className="text-sm text-destructive">{aiState.message}</p>
                ) : null}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateAiQuestions}
                    disabled={!canRunAi}
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
                    {aiState.status === "error" ? "Reintentar" : `Generar preguntas${vacancyTitle ? ` para "${vacancyTitle}"` : ""}`}
                  </Button>
                  {!aiConfigured ? (
                    <span className="text-xs text-muted-foreground">IA no configurada</span>
                  ) : !cvRawText ? (
                    <span className="text-xs text-muted-foreground">Sin texto de CV extraído</span>
                  ) : null}
                </div>
              </div>
            ) : aiState.status === "loading" ? (
              <div className="space-y-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <p className="text-xs text-muted-foreground pt-1">Claude está generando preguntas personalizadas…</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(Object.keys(CATEGORY_LABELS) as (keyof AiInterviewQuestions)[]).map((key) => {
                  const qs = aiState.questions[key];
                  if (qs.length === 0) return null;
                  return (
                    <div key={key} className="space-y-2">
                      <p className="text-sm font-medium">{CATEGORY_LABELS[key]}</p>
                      <ol className="space-y-2 pl-4">
                        {qs.map((q, i) => (
                          <li key={i} className="text-sm text-muted-foreground leading-relaxed list-decimal">
                            {q}
                          </li>
                        ))}
                      </ol>
                    </div>
                  );
                })}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={copyAllToClipboard}
                  >
                    <ClipboardCopyIcon className="size-3.5" aria-hidden />
                    {copied ? "Copiado" : "Copiar todas"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground"
                    onClick={generateAiQuestions}
                  >
                    <RefreshCwIcon className="size-3.5" aria-hidden />
                    Regenerar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
