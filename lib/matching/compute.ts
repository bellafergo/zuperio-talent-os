import type {
  CandidateAvailabilityStatus,
  MatchRecommendation,
  VacancySeniority,
} from "@/generated/prisma/enums";

import {
  MATCH_AVAILABILITY_CAP_WHEN_BUSY_ELSEWHERE,
  MATCH_SCORE_PARTIAL_MIN,
  MATCH_SCORE_STRONG_MIN,
  MATCH_WEIGHTS,
} from "./constants";

const SENIORITY_ORDER: VacancySeniority[] = [
  "INTERN",
  "JUNIOR",
  "MID",
  "SENIOR",
  "LEAD",
  "PRINCIPAL",
];

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "into",
  "team",
  "role",
  "senior",
  "junior",
  "mid",
  "lead",
  "principal",
  "intern",
  "part",
  "time",
  "full",
  "stack",
  "remote",
  "tools",
]);

function seniorityIndex(s: VacancySeniority): number {
  return SENIORITY_ORDER.indexOf(s);
}

function meaningfulTokens(text: string): string[] {
  const parts = text
    .toLowerCase()
    .split(/[^a-z0-9+.#]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
  return [...new Set(parts)];
}

function recommendationFromScore(score: number): MatchRecommendation {
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
  /** Catalog display name, for role overlap text only. */
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

export type MatchPlacementContext = {
  /** Candidate has ACTIVE placement on a vacancy other than the one scored. */
  busyOnOtherVacancy: boolean;
};

export type ComputedMatch = {
  score: number;
  recommendation: MatchRecommendation;
  explanation: string;
};

/** Lookup used by structured scoring and the comparison matrix (same shape). */
export function mapCandidateSkillsForMatch(skills: CandidateSkillForMatch[]) {
  const m = new Map<string, { years: number | null; name: string }>();
  for (const s of skills) {
    m.set(s.skillId, { years: s.yearsExperience, name: s.skillName });
  }
  return m;
}

/**
 * Skills: up to 40 pts from required coverage + minimum-years bonus; optional-only fallback.
 */
function scoreSkillsStructured(
  requirements: VacancyRequirementForMatch[],
  skills: CandidateSkillForMatch[],
): { points: number; parts: string[] } {
  const map = mapCandidateSkillsForMatch(skills);
  const required = requirements.filter((r) => r.required);
  const optional = requirements.filter((r) => !r.required);
  const parts: string[] = [];

  if (required.length > 0) {
    const matchedReq = required.filter((r) => map.has(r.skillId));
    const ratio = matchedReq.length / required.length;
    const base = Math.round(ratio * 32);
    parts.push(
      `Required skills: ${matchedReq.length}/${required.length} covered (${Math.round(ratio * 100)}%).`,
    );

    const applicableMin = required.filter(
      (r) => r.minimumYears != null && map.has(r.skillId),
    );
    let bonus = 0;
    if (applicableMin.length > 0) {
      let satisfied = 0;
      for (const r of applicableMin) {
        const y = map.get(r.skillId)?.years;
        if (y != null && y >= (r.minimumYears ?? 0)) satisfied += 1;
      }
      bonus = Math.round((satisfied / applicableMin.length) * 8);
      parts.push(
        `Minimum years: ${satisfied}/${applicableMin.length} satisfied where specified.`,
      );
    } else {
      bonus = Math.round(ratio * 8);
      parts.push(
        "No minimum-year bars on matched skills; small pro-rated bonus applied.",
      );
    }

    return { points: Math.min(40, base + bonus), parts };
  }

  if (optional.length > 0) {
    const matched = optional.filter((r) => map.has(r.skillId));
    const ratio = matched.length / optional.length;
    const pts = Math.round(ratio * 40);
    parts.push(
      `No required skills on requisition; nice-to-have overlap ${matched.length}/${optional.length}.`,
    );
    return { points: Math.min(40, pts), parts };
  }

  parts.push("No structured requirements on this vacancy; skills score 0.");
  return { points: 0, parts };
}

function scoreSeniority(
  c: VacancySeniority,
  v: VacancySeniority,
): { points: number; phrase: string } {
  const diff = Math.abs(seniorityIndex(c) - seniorityIndex(v));
  const max = MATCH_WEIGHTS.seniorityMax;
  if (diff === 0) {
    return { points: max, phrase: "Seniority matches the role level." };
  }
  if (diff === 1) {
    return {
      points: Math.round(max * 0.72),
      phrase: "Seniority is one step from target (often acceptable).",
    };
  }
  if (diff === 2) {
    return {
      points: Math.round(max * 0.36),
      phrase: "Seniority is two steps from target.",
    };
  }
  return { points: 0, phrase: "Seniority is far from the vacancy level." };
}

function scoreAvailability(
  status: CandidateAvailabilityStatus,
): { points: number; phrase: string } {
  const max = MATCH_WEIGHTS.availabilityMax;
  switch (status) {
    case "AVAILABLE":
      return { points: max, phrase: "Availability: open for new work." };
    case "IN_PROCESS":
      return {
        points: Math.round(max * 0.6),
        phrase: "Availability: in process — confirm capacity before submit.",
      };
    case "ASSIGNED":
      return {
        points: Math.round(max * 0.2),
        phrase: "Availability: marked assigned.",
      };
    case "NOT_AVAILABLE":
      return { points: 0, phrase: "Availability: not available." };
  }
}

function scoreRoleOverlap(
  candidateRole: string,
  skillNames: string[],
  vacTitle: string,
  vacSummary: string | null,
): { points: number; phrase: string } {
  const tokens = meaningfulTokens(`${vacTitle} ${vacSummary ?? ""}`);
  if (tokens.length === 0) {
    return { points: 0, phrase: "" };
  }
  const haystack =
    `${candidateRole} ${skillNames.join(" ")}`.toLowerCase();
  const hits = tokens.filter((t) => haystack.includes(t));
  const ratio = hits.length / tokens.length;
  const points = Math.round(ratio * MATCH_WEIGHTS.roleOverlapMax);
  const phrase =
    points >= 8
      ? "Role/title aligns with profile and structured skills."
      : hits.length > 0
        ? "Some role keywords overlap the profile."
        : "Limited role/title overlap.";
  return { points, phrase };
}

/**
 * Deterministic structured v1: VacancyRequirement vs CandidateSkill, seniority,
 * availability (capped if busy elsewhere on an ACTIVE placement), role tokens vs role + skill names.
 * Does not read legacy CSV skill fields.
 */
export function computeStructuredCandidateVacancyMatch(
  candidate: MatchCandidateStructuredInput,
  vacancy: MatchVacancyStructuredInput,
  placement: MatchPlacementContext,
): ComputedMatch {
  const k = scoreSkillsStructured(vacancy.requirements, candidate.skills);
  const s = scoreSeniority(candidate.seniority, vacancy.seniority);
  let a = scoreAvailability(candidate.availabilityStatus);
  if (placement.busyOnOtherVacancy) {
    a = {
      points: Math.min(a.points, MATCH_AVAILABILITY_CAP_WHEN_BUSY_ELSEWHERE),
      phrase: `${a.phrase} Active placement on another account — availability capped.`,
    };
  }
  const skillNames = candidate.skills.map((x) => x.skillName);
  const r = scoreRoleOverlap(
    candidate.role,
    skillNames,
    vacancy.title,
    vacancy.roleSummary,
  );

  const raw = k.points + s.points + a.points + r.points;
  const score = Math.max(0, Math.min(100, raw));

  const explParts = [...k.parts, s.phrase, a.phrase];
  if (r.phrase) explParts.push(r.phrase);

  return {
    score,
    recommendation: recommendationFromScore(score),
    explanation: truncateExplanation(explParts.join(" ")),
  };
}

/** Same availability points/phrases as `computeStructuredCandidateVacancyMatch` (incl. placement cap). */
export function structuredAvailabilityContribution(
  status: CandidateAvailabilityStatus,
  busyOnOtherVacancy: boolean,
): { points: number; phrase: string; max: number } {
  let a = scoreAvailability(status);
  if (busyOnOtherVacancy) {
    a = {
      points: Math.min(a.points, MATCH_AVAILABILITY_CAP_WHEN_BUSY_ELSEWHERE),
      phrase: `${a.phrase} Active placement on another account — availability capped.`,
    };
  }
  return { ...a, max: MATCH_WEIGHTS.availabilityMax };
}

/** Same seniority points/phrases as structured match. */
export function structuredSeniorityContribution(
  candidateSeniority: VacancySeniority,
  vacancySeniority: VacancySeniority,
): { points: number; phrase: string; max: number } {
  const s = scoreSeniority(candidateSeniority, vacancySeniority);
  return { ...s, max: MATCH_WEIGHTS.seniorityMax };
}

/** Same role overlap points/phrases as structured match. */
export function structuredRoleOverlapContribution(
  candidateRole: string,
  skillNames: string[],
  vacTitle: string,
  vacSummary: string | null,
): { points: number; phrase: string; max: number } {
  const r = scoreRoleOverlap(candidateRole, skillNames, vacTitle, vacSummary);
  return { ...r, max: MATCH_WEIGHTS.roleOverlapMax };
}
