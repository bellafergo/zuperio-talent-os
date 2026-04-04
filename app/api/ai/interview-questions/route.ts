import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { prisma } from "@/lib/prisma";
import { prismaSeniorityToUi } from "@/lib/vacancies/mappers";
import type { VacancySeniority } from "@/generated/prisma/enums";

export const runtime = "nodejs";

const MAX_CV_CHARS = 4_000;
const MODEL = "claude-sonnet-4-5";

const SYSTEM_PROMPT = `Eres un especialista en reclutamiento técnico para staff augmentation en México.
Genera preguntas de entrevista específicas y profundas para evaluar si este
candidato es apto para esta vacante.

Las preguntas deben:
- Ser específicas al historial del candidato (mencionar tecnologías o contextos del CV)
- Evaluar competencias clave para la vacante
- Incluir preguntas situacionales (cuéntame de una vez que...)
- Incluir preguntas técnicas relevantes al rol
- Estar en español

Responde SOLO con JSON válido:
{
  "technical": ["pregunta 1", "pregunta 2", "pregunta 3"],
  "situational": ["pregunta 1", "pregunta 2", "pregunta 3"],
  "cultural": ["pregunta 1", "pregunta 2"],
  "roleSpecific": ["pregunta específica basada en el CV 1", "pregunta 2"]
}

Máximo 3 preguntas por categoría (2 para cultural). Que sean preguntas que realmente
ayuden a descubrir si el candidato puede desempeñar esta vacante.`;

export type AiInterviewQuestions = {
  technical: string[];
  situational: string[];
  cultural: string[];
  roleSpecific: string[];
};

function normalizeAiInterviewQuestions(raw: unknown): AiInterviewQuestions | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const strings = (k: string, max: number): string[] => {
    const v = o[k];
    if (!Array.isArray(v)) return [];
    return v
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .map((s) => s.trim())
      .slice(0, max);
  };
  return {
    technical: strings("technical", 3),
    situational: strings("situational", 3),
    cultural: strings("cultural", 2),
    roleSpecific: strings("roleSpecific", 3),
  };
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
          structuredSkills: {
            select: {
              yearsExperience: true,
              level: true,
              skill: { select: { name: true } },
            },
            orderBy: { id: "asc" },
          },
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

    const vacSkillLines = vacancy.skillRequirements
      .map((r) => {
        const yrs = r.minimumYears != null ? ` (mín. ${r.minimumYears}a)` : "";
        return `  - ${r.skill.name}${yrs} [${r.required ? "requerido" : "deseable"}]`;
      })
      .join("\n");

    const candSkillLines = candidate.structuredSkills
      .map((s) => {
        const y = s.yearsExperience != null ? `, ${s.yearsExperience}a` : "";
        const lv = s.level?.trim() ? `, ${s.level}` : "";
        return `${s.skill.name}${y}${lv}`;
      })
      .join("; ");

    const userMsg = [
      `Candidato: ${candName}`,
      `Rol: ${candidate.role}, Senioridad: ${candSeniority}`,
      `Skills candidato: ${candSkillLines || "—"}`,
      "",
      `Vacante: ${vacancy.title}`,
      `Senioridad vacante: ${vacSeniority}`,
      `Alcance del rol: ${vacancy.roleSummary?.trim() || "—"}`,
      `Requisitos:\n${vacSkillLines || "  —"}`,
      "",
      "Extracto de experiencia laboral (CV):",
      cvText,
    ].join("\n");

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      temperature: 0.4,
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

    const questions = normalizeAiInterviewQuestions(parsed);
    if (!questions) {
      return NextResponse.json(
        { ok: false, error: "Formato de respuesta de la IA inesperado." },
        { status: 502 },
      );
    }

    const total =
      questions.technical.length +
      questions.situational.length +
      questions.cultural.length +
      questions.roleSpecific.length;

    if (total === 0) {
      return NextResponse.json(
        { ok: false, error: "La IA no generó preguntas." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, questions });
  } catch (err) {
    console.error("[ai/interview-questions]", err);
    return NextResponse.json(
      { ok: false, error: "No se pudo generar las preguntas. El resto de la aplicación sigue disponible." },
      { status: 500 },
    );
  }
}
