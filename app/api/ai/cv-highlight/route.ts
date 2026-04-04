import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { prisma } from "@/lib/prisma";
import { prismaSeniorityToUi } from "@/lib/vacancies/mappers";
import type { VacancySeniority } from "@/generated/prisma/enums";

export const runtime = "nodejs";

const MAX_CV_CHARS = 6_000;
const MODEL = "claude-sonnet-4-5";

const SYSTEM_PROMPT = `Eres un especialista en reclutamiento técnico para staff augmentation.
Tu tarea es analizar el CV de un candidato e identificar y parafrasear
las experiencias laborales más relevantes para una vacante específica.

Responde SOLO con JSON válido con esta estructura exacta:
{
  "summary": "Párrafo ejecutivo de 2-3 oraciones sobre la alineación del candidato con la vacante",
  "highlights": [
    {
      "role": "Título del puesto o proyecto",
      "relevance": "Por qué esta experiencia es relevante para la vacante",
      "paraphrase": "Descripción parafraseada y enfocada en habilidades aplicables"
    }
  ],
  "matchScore": 7,
  "gaps": ["gap 1", "gap 2"]
}

Máximo 4 highlights. matchScore debe ser un número entero del 1 al 10. Si no hay experiencia relevante, retorna highlights: []. gaps puede ser [] si no hay brechas identificadas.`;

export type CvHighlightHighlight = {
  role: string;
  relevance: string;
  paraphrase: string;
};

export type CvHighlightResult = {
  summary: string;
  highlights: CvHighlightHighlight[];
  matchScore: number;
  gaps: string[];
};

function normalizeCvHighlightResult(raw: unknown): CvHighlightResult | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const summary = typeof o.summary === "string" ? o.summary.trim() : "";
  if (!summary) return null;

  const matchScore =
    typeof o.matchScore === "number" &&
    Number.isFinite(o.matchScore) &&
    o.matchScore >= 1 &&
    o.matchScore <= 10
      ? Math.round(o.matchScore)
      : null;
  if (matchScore === null) return null;

  const highlights: CvHighlightHighlight[] = [];
  if (Array.isArray(o.highlights)) {
    for (const h of o.highlights) {
      if (!h || typeof h !== "object") continue;
      const ho = h as Record<string, unknown>;
      const role = typeof ho.role === "string" ? ho.role.trim() : "";
      const relevance = typeof ho.relevance === "string" ? ho.relevance.trim() : "";
      const paraphrase = typeof ho.paraphrase === "string" ? ho.paraphrase.trim() : "";
      if (role && relevance && paraphrase) {
        highlights.push({ role, relevance, paraphrase });
      }
    }
  }

  const gaps: string[] = [];
  if (Array.isArray(o.gaps)) {
    for (const g of o.gaps) {
      if (typeof g === "string" && g.trim()) gaps.push(g.trim());
    }
  }

  return { summary, highlights: highlights.slice(0, 4), matchScore, gaps };
}

function extractJsonObject(text: string): unknown {
  const t = text.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(t);
  const body = fenced ? fenced[1]!.trim() : t;
  return JSON.parse(body) as unknown;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Debes iniciar sesión." }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
    }

    const o = body as Record<string, unknown>;
    const candidateId = typeof o.candidateId === "string" ? o.candidateId.trim() : "";
    const vacancyId = typeof o.vacancyId === "string" ? o.vacancyId.trim() : "";

    if (!candidateId || !vacancyId) {
      return NextResponse.json(
        { ok: false, error: "Faltan candidateId o vacancyId." },
        { status: 400 },
      );
    }

    const anthropic = getAnthropicClient();
    if (!anthropic) {
      return NextResponse.json(
        {
          ok: false,
          code: "AI_NOT_CONFIGURED",
          error: "La generación con IA no está configurada en el servidor (ANTHROPIC_API_KEY).",
        },
        { status: 503 },
      );
    }

    const [candidate, vacancy] = await Promise.all([
      prisma.candidate.findUnique({
        where: { id: candidateId },
        select: {
          firstName: true,
          lastName: true,
          role: true,
          seniority: true,
          cvWorkExperienceText: true,
          cvRawText: true,
        },
      }),
      prisma.vacancy.findUnique({
        where: { id: vacancyId },
        select: {
          title: true,
          seniority: true,
          roleSummary: true,
          skillRequirements: {
            select: {
              required: true,
              minimumYears: true,
              skill: { select: { name: true } },
            },
            orderBy: [{ required: "desc" }, { id: "asc" }],
          },
        },
      }),
    ]);

    if (!candidate || !vacancy) {
      return NextResponse.json(
        { ok: false, error: "Vacante o candidato no encontrado." },
        { status: 404 },
      );
    }

    const cvText = (candidate.cvWorkExperienceText?.trim() || candidate.cvRawText?.trim() || "").slice(0, MAX_CV_CHARS);
    if (!cvText) {
      return NextResponse.json(
        { ok: false, error: "El candidato no tiene CV con texto extraído." },
        { status: 422 },
      );
    }

    const candName = `${candidate.firstName} ${candidate.lastName}`.trim() || "—";
    const candSeniority = prismaSeniorityToUi[candidate.seniority as VacancySeniority];
    const vacSeniority = prismaSeniorityToUi[vacancy.seniority as VacancySeniority];

    const skillLines = vacancy.skillRequirements
      .map((r) => {
        const yrs = r.minimumYears != null ? ` (mín. ${r.minimumYears}a)` : "";
        const tag = r.required ? "requerido" : "deseable";
        return `  - ${r.skill.name}${yrs} [${tag}]`;
      })
      .join("\n");

    const userMsg = [
      `CANDIDATO: ${candName}, ${candidate.role}, ${candSeniority}`,
      `VACANTE: ${vacancy.title}, ${vacSeniority}`,
      `Alcance del rol: ${vacancy.roleSummary?.trim() || "—"}`,
      `Skills requeridos:\n${skillLines || "  —"}`,
      "",
      "CV COMPLETO:",
      cvText,
    ].join("\n");

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
    });

    const rawContent = message.content[0];
    if (!rawContent || rawContent.type !== "text" || !rawContent.text?.trim()) {
      return NextResponse.json(
        { ok: false, error: "La IA no devolvió contenido usable." },
        { status: 502 },
      );
    }

    let parsed: unknown;
    try {
      parsed = extractJsonObject(rawContent.text);
    } catch {
      return NextResponse.json(
        { ok: false, error: "No se pudo interpretar la respuesta de la IA." },
        { status: 502 },
      );
    }

    const result = normalizeCvHighlightResult(parsed);
    if (!result) {
      return NextResponse.json(
        { ok: false, error: "Formato de respuesta de la IA inesperado." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[ai/cv-highlight]", err);
    return NextResponse.json(
      { ok: false, error: "No se pudo generar el análisis. El resto de la aplicación sigue disponible." },
      { status: 500 },
    );
  }
}
