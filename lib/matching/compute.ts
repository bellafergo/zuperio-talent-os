import type {
  CandidateAvailabilityStatus,
  MatchRecommendation,
  VacancySeniority,
} from "@/generated/prisma/enums";

import { parseSkillTags } from "@/lib/candidates/mappers";

import {
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

function normalizeSkillToken(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\.{2,}/g, ".");
}

function skillSetFromCsv(csv: string): Set<string> {
  const set = new Set<string>();
  for (const raw of parseSkillTags(csv)) {
    const n = normalizeSkillToken(raw);
    if (n) set.add(n);
  }
  return set;
}

function meaningfulTokens(text: string): string[] {
  const parts = text
    .toLowerCase()
    .split(/[^a-z0-9+.#]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
  return [...new Set(parts)];
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) {
    if (b.has(x)) inter += 1;
  }
  const union = a.size + b.size - inter;
  return union > 0 ? inter / union : 0;
}

function recommendationFromScore(score: number): MatchRecommendation {
  if (score >= MATCH_SCORE_STRONG_MIN) return "STRONG_MATCH";
  if (score >= MATCH_SCORE_PARTIAL_MIN) return "PARTIAL_MATCH";
  return "LOW_MATCH";
}

function truncateNote(s: string, max = 280): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export type MatchCandidateInput = {
  seniority: VacancySeniority;
  availabilityStatus: CandidateAvailabilityStatus;
  role: string;
  skills: string;
};

export type MatchVacancyInput = {
  seniority: VacancySeniority;
  title: string;
  skills: string | null;
  roleSummary: string | null;
};

export type ComputedMatch = {
  score: number;
  seniorityMatch: boolean;
  availabilityMatch: boolean;
  skillsMatchNotes: string | null;
  recommendation: MatchRecommendation;
};

function seniorityBlock(
  c: VacancySeniority,
  v: VacancySeniority,
): { points: number; match: boolean; phrase: string } {
  const diff = Math.abs(seniorityIndex(c) - seniorityIndex(v));
  if (diff === 0) {
    return {
      points: MATCH_WEIGHTS.seniorityMax,
      match: true,
      phrase: "Seniority aligns exactly.",
    };
  }
  if (diff === 1) {
    return {
      points: Math.round(MATCH_WEIGHTS.seniorityMax * 0.72),
      match: true,
      phrase: "Seniority is adjacent (close enough for many mandates).",
    };
  }
  if (diff === 2) {
    return {
      points: Math.round(MATCH_WEIGHTS.seniorityMax * 0.34),
      match: false,
      phrase: "Seniority gap is noticeable.",
    };
  }
  return {
    points: 0,
    match: false,
    phrase: "Seniority is far from the target level.",
  };
}

function availabilityBlock(
  status: CandidateAvailabilityStatus,
): { points: number; match: boolean; phrase: string } {
  switch (status) {
    case "AVAILABLE":
      return {
        points: MATCH_WEIGHTS.availabilityMax,
        match: true,
        phrase: "Availability: ready for new work.",
      };
    case "IN_PROCESS":
      return {
        points: Math.round(MATCH_WEIGHTS.availabilityMax * 0.6),
        match: true,
        phrase: "Availability: in process — confirm dates before submission.",
      };
    case "ASSIGNED":
      return {
        points: Math.round(MATCH_WEIGHTS.availabilityMax * 0.2),
        match: false,
        phrase: "Availability: currently assigned.",
      };
    case "NOT_AVAILABLE":
      return {
        points: 0,
        match: false,
        phrase: "Availability: not available for new mandates.",
      };
  }
}

function skillsBlock(
  candidateSkills: string,
  vacancySkills: string | null,
): { points: number; phrase: string; examples: string[] } {
  const candSet = skillSetFromCsv(candidateSkills);
  const vacSet = skillSetFromCsv(vacancySkills ?? "");

  if (vacSet.size === 0 || candSet.size === 0) {
    return {
      points: 0,
      phrase:
        vacSet.size === 0
          ? "No vacancy skill tags on file."
          : "Candidate has no parsed skills.",
      examples: [],
    };
  }

  const inter: string[] = [];
  for (const s of vacSet) {
    if (candSet.has(s)) inter.push(s);
  }

  const jac = jaccard(candSet, vacSet);
  const points = Math.round(jac * MATCH_WEIGHTS.skillsMax);
  const examples = inter.slice(0, 4);
  const phrase =
    inter.length === 0
      ? "No overlapping skills between vacancy tags and candidate profile."
      : `Skills: ${inter.length} overlap${inter.length === 1 ? "" : "s"} with the requisition.`;

  return { points, phrase, examples };
}

function roleOverlapBlock(
  candidateRole: string,
  candidateSkills: string,
  vacTitle: string,
  vacSummary: string | null,
): { points: number; phrase: string } {
  const tokens = meaningfulTokens(`${vacTitle} ${vacSummary ?? ""}`);
  if (tokens.length === 0) {
    return { points: 0, phrase: "" };
  }
  const haystack = `${candidateRole} ${candidateSkills}`.toLowerCase();
  const hits = tokens.filter((t) => haystack.includes(t));
  const ratio = hits.length / tokens.length;
  const points = Math.round(ratio * MATCH_WEIGHTS.roleOverlapMax);
  const phrase =
    points >= MATCH_WEIGHTS.roleOverlapMax * 0.5
      ? "Role/title wording aligns with the candidate profile."
      : hits.length > 0
        ? "Some role keywords appear in the candidate profile."
        : "Limited role/title keyword overlap.";
  return { points, phrase };
}

/**
 * Deterministic v1 score: seniority + availability + skill Jaccard + title/role token overlap.
 * No network calls; same inputs always yield the same output.
 */
export function computeCandidateVacancyMatch(
  candidate: MatchCandidateInput,
  vacancy: MatchVacancyInput,
): ComputedMatch {
  const s = seniorityBlock(candidate.seniority, vacancy.seniority);
  const a = availabilityBlock(candidate.availabilityStatus);
  const k = skillsBlock(candidate.skills, vacancy.skills);
  const r = roleOverlapBlock(
    candidate.role,
    candidate.skills,
    vacancy.title,
    vacancy.roleSummary,
  );

  const raw = s.points + a.points + k.points + r.points;
  const score = Math.max(0, Math.min(100, raw));

  const parts = [s.phrase, a.phrase, k.phrase];
  if (k.examples.length > 0) {
    parts.push(`Examples: ${k.examples.join(", ")}.`);
  }
  if (r.phrase) parts.push(r.phrase);

  const skillsMatchNotes = truncateNote(parts.join(" "));

  return {
    score,
    seniorityMatch: s.match,
    availabilityMatch: a.match,
    skillsMatchNotes,
    recommendation: recommendationFromScore(score),
  };
}
