import type {
  CandidateAvailabilityStatus,
  VacancySeniority,
} from "@/generated/prisma/enums";

import {
  computeSkillCoverageOnlyMatch,
  mapCandidateSkillsForMatch,
  type ComputedMatch,
  type MatchCandidateStructuredInput,
  type MatchPlacementContext,
  type MatchVacancyStructuredInput,
  type VacancyRequirementForMatch,
} from "./compute";

/** Row-level fit label (deterministic, explainable). */
export type ComparisonRowMatchLevel = "MET" | "PARTIAL" | "GAP" | "OPEN";

export type ComparisonMatrixRow = {
  id: string;
  category: "skills" | "context";
  requirement: string;
  candidateValue: string;
  matchLevel: ComparisonRowMatchLevel;
  /** Unused for skill-only scoring; kept for PDF helpers that read points ratios. */
  pointsLabel: string | null;
  note: string;
};

const SENIORITY_LABELS: Record<VacancySeniority, string> = {
  INTERN: "Interno",
  JUNIOR: "Junior",
  MID: "Mid",
  SENIOR: "Senior",
  LEAD: "Lead",
  PRINCIPAL: "Principal",
};

const AVAILABILITY_LABELS: Record<CandidateAvailabilityStatus, string> = {
  AVAILABLE: "Disponible",
  IN_PROCESS: "En proceso",
  ASSIGNED: "Asignado",
  NOT_AVAILABLE: "No disponible",
};

const NO_REQUIRED_FALLBACK: ComputedMatch = {
  score: 0,
  recommendation: "LOW_MATCH",
  explanation:
    "La vacante no tiene skills marcados como requeridos. Defina requisitos estructurados para calcular el match por cobertura.",
};

function buildSkillRequirementRows(
  requirements: VacancyRequirementForMatch[],
  candidate: MatchCandidateStructuredInput,
  skillNameById: Map<string, string>,
): ComparisonMatrixRow[] {
  const map = mapCandidateSkillsForMatch(candidate.skills);
  const required = requirements.filter((r) => r.required);
  const optional = requirements.filter((r) => !r.required);

  if (required.length === 0 && optional.length === 0) {
    return [
      {
        id: "skills-none",
        category: "skills",
        requirement: "Skills requeridos (vacante)",
        candidateValue: "—",
        matchLevel: "OPEN",
        pointsLabel: null,
        note: "Agrega al menos un skill requerido para activar el match por cobertura.",
      },
    ];
  }

  const sorted = [...required, ...optional].sort((a, b) => {
    if (a.required !== b.required) return a.required ? -1 : 1;
    const na = skillNameById.get(a.skillId)?.trim() || a.skillId;
    const nb = skillNameById.get(b.skillId)?.trim() || b.skillId;
    return na.localeCompare(nb);
  });

  return sorted.map((r) => {
    const name = skillNameById.get(r.skillId)?.trim() || r.skillId;
    const reqLabel = `${name} · ${r.required ? "Requerido" : "Deseable"}${
      r.minimumYears != null ? ` · mín. ${r.minimumYears} años` : ""
    }`;

    const entry = map.get(r.skillId);
    const has = entry != null;
    const years = entry?.years ?? null;

    let candidateValue: string;
    if (!has) {
      candidateValue = "No en perfil";
    } else if (years != null) {
      candidateValue = `${years} años`;
    } else {
      candidateValue = "En perfil (años no indicados)";
    }

    let matchLevel: ComparisonRowMatchLevel;
    let note: string;

    if (r.required) {
      if (!has) {
        matchLevel = "GAP";
        note = "Skill requerido ausente en el perfil estructurado.";
      } else if (
        r.minimumYears != null &&
        (years == null || years < r.minimumYears)
      ) {
        matchLevel = "PARTIAL";
        note =
          years == null
            ? "Cubre el skill; falta acreditar años frente al mínimo."
            : `Cubre el skill; años por debajo del mínimo (${years} < ${r.minimumYears}).`;
      } else {
        matchLevel = "MET";
        note =
          r.minimumYears != null
            ? `Cumple presencia y mínimo de ${r.minimumYears} años.`
            : "Cumple presencia del skill requerido.";
      }
    } else if (!has) {
      matchLevel = "OPEN";
      note = "Deseable — no afecta el porcentaje de cobertura.";
    } else if (
      r.minimumYears != null &&
      (years == null || years < r.minimumYears)
    ) {
      matchLevel = "PARTIAL";
      note = "Deseable presente; años por debajo del mínimo indicado.";
    } else {
      matchLevel = "MET";
      note = "Deseable cubierto.";
    }

    return {
      id: `skill-${r.skillId}-${r.required ? "req" : "opt"}`,
      category: "skills",
      requirement: reqLabel,
      candidateValue,
      matchLevel,
      pointsLabel: null,
      note,
    };
  });
}

function buildContextRow(
  candidate: MatchCandidateStructuredInput,
  vacancy: MatchVacancyStructuredInput,
  placement: MatchPlacementContext,
): ComparisonMatrixRow {
  const busyNote = placement.busyOnOtherVacancy
    ? " Asignación activa en otra vacante (contexto operativo)."
    : "";

  return {
    id: "context",
    category: "context",
    requirement: "Contexto (no suma al % de cobertura)",
    candidateValue: [
      `Senioridad: ${SENIORITY_LABELS[candidate.seniority]}`,
      AVAILABILITY_LABELS[candidate.availabilityStatus],
      candidate.role.trim() || "—",
    ].join(" · "),
    matchLevel: "OPEN",
    pointsLabel: null,
    note: `Vacante · nivel ${SENIORITY_LABELS[vacancy.seniority]} · ${vacancy.title.trim()}.${busyNote}`,
  };
}

export type CandidateVacancyComparisonMatrix = {
  rows: ComparisonMatrixRow[];
  computedMatch: ComputedMatch;
  /** True cuando hay ≥1 skill requerido y aplica el score por cobertura. */
  skillMatchActive: boolean;
};

/**
 * Matriz de detalle + puntaje global (mismo motor que sync).
 */
export function buildCandidateVacancyComparisonMatrix(
  candidate: MatchCandidateStructuredInput,
  vacancy: MatchVacancyStructuredInput,
  placement: MatchPlacementContext,
  requirementSkillNames: Map<string, string>,
): CandidateVacancyComparisonMatrix {
  const skillComputed = computeSkillCoverageOnlyMatch(
    vacancy.requirements,
    candidate.skills,
  );
  const skillMatchActive = skillComputed != null;
  const computedMatch = skillComputed ?? NO_REQUIRED_FALLBACK;

  const skillRows = buildSkillRequirementRows(
    vacancy.requirements,
    candidate,
    requirementSkillNames,
  );

  const contextRow = buildContextRow(candidate, vacancy, placement);

  return {
    rows: [...skillRows, contextRow],
    computedMatch,
    skillMatchActive,
  };
}
