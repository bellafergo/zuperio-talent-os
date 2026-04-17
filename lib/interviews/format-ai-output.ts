import type { AiInterviewSections } from "./types";

export function normalizeAiInterviewSections(raw: unknown): AiInterviewSections | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const strings = (k: string): string[] => {
    const v = o[k];
    if (!Array.isArray(v)) return [];
    return v
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .map((s) => s.trim());
  };
  return {
    technical: strings("technical"),
    experienceValidation: strings("experienceValidation"),
    scenario: strings("scenario"),
    riskFit: strings("riskFit"),
  };
}

export function formatAiSectionsToPlainText(s: AiInterviewSections): string {
  const lines: string[] = [];
  const block = (title: string, items: string[]) => {
    lines.push(title);
    lines.push("");
    if (items.length === 0) {
      lines.push("—");
    } else {
      items.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
    }
    lines.push("");
  };
  block("Preguntas técnicas (IA)", s.technical);
  block("Validación de experiencia (IA)", s.experienceValidation);
  block("Escenarios / casos (IA)", s.scenario);
  block("Riesgo / encaje cultural y rol (IA)", s.riskFit);
  return lines.join("\n").trim();
}
