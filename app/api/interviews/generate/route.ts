import { NextResponse } from "next/server";

import { auth } from "@/auth";
import type { VacancySeniority } from "@/generated/prisma/enums";
import {
  formatAiSectionsToPlainText,
  normalizeAiInterviewSections,
} from "@/lib/interviews/format-ai-output";
import { prisma } from "@/lib/prisma";
import { prismaSeniorityToUi } from "@/lib/vacancies/mappers";
import { isCandidateInVacancyProcess } from "@/lib/vacancies/is-candidate-in-vacancy-process";

export const runtime = "nodejs";

const MAX_EXP_CHARS = 4_000;

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
      return NextResponse.json(
        { ok: false, error: "Debes iniciar sesión." },
        { status: 401 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Solicitud inválida." },
        { status: 400 },
      );
    }

    const o = body as Record<string, unknown>;
    const candidateId =
      typeof o.candidateId === "string" ? o.candidateId.trim() : "";
    const vacancyId = typeof o.vacancyId === "string" ? o.vacancyId.trim() : "";
    if (!candidateId || !vacancyId) {
      return NextResponse.json(
        { ok: false, error: "Faltan candidateId o vacancyId." },
        { status: 400 },
      );
    }

    const allowed = await isCandidateInVacancyProcess(candidateId, vacancyId);
    if (!allowed) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Este candidato no está en proceso para esta vacante (postulación activa o pipeline).",
        },
        { status: 403 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          code: "AI_NOT_CONFIGURED",
          error:
            "La generación con IA no está configurada en el servidor (OPENAI_API_KEY).",
        },
        { status: 503 },
      );
    }

    const model =
      process.env.OPENAI_INTERVIEW_MODEL?.trim() || "gpt-4o-mini";

    const [vacancy, candidate] = await Promise.all([
      prisma.vacancy.findUnique({
        where: { id: vacancyId },
        select: {
          title: true,
          seniority: true,
          skills: true,
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
      prisma.candidate.findUnique({
        where: { id: candidateId },
        select: {
          firstName: true,
          lastName: true,
          role: true,
          seniority: true,
          skills: true,
          cvWorkExperienceText: true,
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
    ]);

    if (!vacancy || !candidate) {
      return NextResponse.json(
        { ok: false, error: "Vacante o candidato no encontrado." },
        { status: 404 },
      );
    }

    const candName =
      `${candidate.firstName} ${candidate.lastName}`.trim() || "—";
    const candSeniority =
      prismaSeniorityToUi[candidate.seniority as VacancySeniority];
    const vacSeniority =
      prismaSeniorityToUi[vacancy.seniority as VacancySeniority];

    const reqLines = vacancy.skillRequirements.map((r) => {
      const yrs =
        r.minimumYears != null ? ` (mín. ${r.minimumYears}a)` : "";
      const tag = r.required ? "requerido" : "deseable";
      return `- ${r.skill.name}${yrs} [${tag}]`;
    });

    const skillNames = candidate.structuredSkills
      .map((s) => {
        const y =
          s.yearsExperience != null ? `, ${s.yearsExperience}a` : "";
        const lv = s.level?.trim() ? `, ${s.level}` : "";
        return `${s.skill.name}${y}${lv}`;
      })
      .join("; ");

    const expSnippet = candidate.cvWorkExperienceText
      ?.trim()
      .slice(0, MAX_EXP_CHARS);

    const contextBlock = [
      `Candidato: ${candName}`,
      `Rol declarado candidato: ${candidate.role}`,
      `Senioridad candidato: ${candSeniority}`,
      `Skills texto legado candidato: ${candidate.skills?.trim() || "—"}`,
      `Skills estructuradas (resumen): ${skillNames || "—"}`,
      `Experiencia laboral (extracto CV, puede estar truncado):\n${expSnippet || "—"}`,
      "",
      `Vacante: ${vacancy.title}`,
      `Senioridad vacante: ${vacSeniority}`,
      `Skills vacante (texto): ${vacancy.skills?.trim() || "—"}`,
      `Alcance / resumen rol: ${vacancy.roleSummary?.trim() || "—"}`,
      `Requisitos estructurados:\n${reqLines.length ? reqLines.join("\n") : "—"}`,
    ].join("\n");

    const system = `Eres un entrevistador senior en consultoría TI. Devuelve SOLO un objeto JSON válido (sin markdown) con estas claves y cardinalidades:
- "technical": array de exactamente 5 strings, preguntas técnicas concretas en español.
- "experienceValidation": array de exactamente 3 strings, preguntas para validar experiencia real (STAR).
- "scenario": array de exactamente 3 strings, casos o simulaciones breves.
- "riskFit": array de exactamente 3 strings, riesgos de rol, alineación, stakeholders o señales de alerta.
Las preguntas deben citar implícitamente el contexto (stack, seniority, requisitos) sin inventar certificaciones que no aparezcan en el contexto.`;

    const userMsg = `Contexto para la entrevista:\n\n${contextBlock}\n\nGenera el JSON descrito.`;

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 55_000);
    let res: Response;
    try {
      res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.35,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: userMsg },
          ],
        }),
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(t);
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn("[interviews/generate] OpenAI HTTP", res.status, errText.slice(0, 500));
      return NextResponse.json(
        {
          ok: false,
          error:
            "El servicio de IA no respondió correctamente. Intenta de nuevo más tarde.",
        },
        { status: 502 },
      );
    }

    const completion = (await res.json()) as {
      choices?: { message?: { content?: string | null } }[];
    };
    const rawContent = completion.choices?.[0]?.message?.content;
    if (!rawContent?.trim()) {
      return NextResponse.json(
        { ok: false, error: "La IA no devolvió contenido usable." },
        { status: 502 },
      );
    }

    let parsed: unknown;
    try {
      parsed = extractJsonObject(rawContent);
    } catch {
      return NextResponse.json(
        { ok: false, error: "No se pudo interpretar la respuesta de la IA." },
        { status: 502 },
      );
    }

    const sections = normalizeAiInterviewSections(parsed);
    if (!sections) {
      return NextResponse.json(
        { ok: false, error: "Formato de respuesta de la IA inesperado." },
        { status: 502 },
      );
    }

    const total =
      sections.technical.length +
      sections.experienceValidation.length +
      sections.scenario.length +
      sections.riskFit.length;
    if (total === 0) {
      return NextResponse.json(
        { ok: false, error: "La IA no generó preguntas." },
        { status: 502 },
      );
    }

    const formattedText = formatAiSectionsToPlainText(sections);

    return NextResponse.json({
      ok: true,
      sections,
      formattedText,
      model,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { ok: false, error: "Tiempo de espera agotado al generar con IA." },
        { status: 504 },
      );
    }
    console.error("[interviews/generate]", err);
    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo generar las preguntas. El resto de la aplicación sigue disponible.",
      },
      { status: 500 },
    );
  }
}
