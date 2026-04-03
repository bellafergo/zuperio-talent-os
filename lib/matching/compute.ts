import type {
  CandidateAvailabilityStatus,
  MatchRecommendation,
  VacancySeniority,
} from "@/generated/prisma/enums";

import {
  MATCH_SCORE_PARTIAL_MIN,
  MATCH_SCORE_STRONG_MIN,
} from "./constants";

function recommendationFromSkillCoverageScore(score: number): MatchRecommendation {
  if (score >= MATCH_SCORE_STRONG_MIN) return "STRONG_MATCH";
  if (score >= MATCH_SCORE_PARTIAL_MIN) return "PARTIAL_MATCH";
  return "LOW_MATCH";
}

function truncateExplanation(s: string, max = 320): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

// --- Public input shapes (plain data; no Prisma in signatures) ----------------

export type CandidateSkillForMatch = {
  skillId: string;
  /** Catalog display name (UI / matrices). */
  skillName: string;
  yearsExperience: number | null;
};

export type VacancyRequirementForMatch = {
  skillId: string;
  required: boolean;
  minimumYears: number | null;
};

export type MatchCandidateStructuredInput = {
  seniority: VacancySeniority;
  availabilityStatus: CandidateAvailabilityStatus;
  role: string;
  skills: CandidateSkillForMatch[];
};

export type MatchVacancyStructuredInput = {
  seniority: VacancySeniority;
  title: string;
  roleSummary: string | null;
  requirements: VacancyRequirementForMatch[];
};

/** Retained for API compatibility; skill score does not use placement context. */
export type MatchPlacementContext = {
  busyOnOtherVacancy: boolean;
};

export type ComputedMatch = {
  score: number;
  recommendation: MatchRecommendation;
  explanation: string;
};

export type SkillCoverageBreakdownItem = {
  skillId: string;
  skillName: string;
};

/** Lookup used by scoring and the comparison matrix (same shape). */
export function mapCandidateSkillsForMatch(skills: CandidateSkillForMatch[]) {
  const m = new Map<string, { years: number | null; name: string }>();
  for (const s of skills) {
    m.set(s.skillId, { years: s.yearsExperience, name: s.skillName });
  }
  return m;
}

/**
 * Core rule: score = round((skills requeridos cubiertos / total requeridos) * 100).
 * Cubierto = el candidato tiene el skill en perfil (presencia). Años mínimos no cambian el %.
 * Sin skills requeridos → null (no match).
 */
export function computeSkillCoverageOnlyMatch(
  requirements: VacancyRequirementForMatch[],
  skills: CandidateSkillForMatch[],
): ComputedMatch | null {
  const required = requirements.filter((r) => r.required);
  if (required.length === 0) return null;

  const map = mapCandidateSkillsForMatch(skills);
  const metCount = required.filter((r) => map.has(r.skillId)).length;
  const score = Math.round((metCount / required.length) * 100);

  const explanation = `Cobertura de skills requeridos: ${metCount}/${required.length} (${score}%). Cálculo determinista por presencia en el perfil; sin IA.`;

  return {
    score,
    recommendation: recommendationFromSkillCoverageScore(score),
    explanation: truncateExplanation(explanation),
  };
}

export function buildSkillCoverageBreakdown(
  requirements: VacancyRequirementForMatch[],
  skills: CandidateSkillForMatch[],
  skillNameById: Map<string, string>,
): {
  met: SkillCoverageBreakdownItem[];
  missing: SkillCoverageBreakdownItem[];
} {
  const required = requirements.filter((r) => r.required);
  const map = mapCandidateSkillsForMatch(skills);
  const met: SkillCoverageBreakdownItem[] = [];
  const missing: SkillCoverageBreakdownItem[] = [];
  for (const r of required) {
    const skillName = skillNameById.get(r.skillId)?.trim() || r.skillId;
    const item = { skillId: r.skillId, skillName };
    if (map.has(r.skillId)) met.push(item);
    else missing.push(item);
  }
  return { met, missing };
}

/**
 * Deterministic match: solo cobertura de skills requeridos (0–100 entero).
 * Otros campos del input se ignoran para el puntaje; la matriz de comparación añade contexto.
 */
export function computeStructuredCandidateVacancyMatch(
  candidate: MatchCandidateStructuredInput,
  vacancy: MatchVacancyStructuredInput,
  _placement: MatchPlacementContext,
): ComputedMatch | null {
  return computeSkillCoverageOnlyMatch(vacancy.requirements, candidate.skills);
}
