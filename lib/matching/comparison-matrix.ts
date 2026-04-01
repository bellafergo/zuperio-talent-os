import type {
  CandidateAvailabilityStatus,
  VacancySeniority,
} from "@/generated/prisma/enums";

import { MATCH_WEIGHTS } from "./constants";
import {
  computeStructuredCandidateVacancyMatch,
  mapCandidateSkillsForMatch,
  structuredAvailabilityContribution,
  structuredRoleOverlapContribution,
  structuredSeniorityContribution,
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
  category: "skills" | "seniority" | "availability" | "role";
  requirement: string;
  candidateValue: string;
  matchLevel: ComparisonRowMatchLevel;
  /** Optional component points vs max (same weight buckets as the match engine). */
  pointsLabel: string | null;
  note: string;
};

const SENIORITY_LABELS: Record<VacancySeniority, string> = {
  INTERN: "Intern",
  JUNIOR: "Junior",
  MID: "Mid",
  SENIOR: "Senior",
  LEAD: "Lead",
  PRINCIPAL: "Principal",
};

const AVAILABILITY_LABELS: Record<CandidateAvailabilityStatus, string> = {
  AVAILABLE: "Available",
  IN_PROCESS: "In process",
  ASSIGNED: "Assigned",
  NOT_AVAILABLE: "Not available",
};

function dimensionLevel(
  points: number,
  max: number,
): ComparisonRowMatchLevel {
  if (max <= 0) return "OPEN";
  if (points >= max) return "MET";
  if (points <= 0) return "GAP";
  return "PARTIAL";
}

function roleLevel(points: number, max: number): ComparisonRowMatchLevel {
  if (max <= 0) return "OPEN";
  if (points <= 0) return "GAP";
  if (points >= 8) return "MET";
  return "PARTIAL";
}

/**
 * Per-requirement rows: coverage and minimum-years bars align with how
 * `scoreSkillsStructured` counts matches (no change to scoring formulas).
 */
function buildSkillRequirementRows(
  requirements: VacancyRequirementForMatch[],
  candidate: MatchCandidateStructuredInput,
  skillNameById: Map<string, string>,
): ComparisonMatrixRow[] {
  const map = mapCandidateSkillsForMatch(candidate.skills);

  if (requirements.length === 0) {
    return [
      {
        id: "skills-none",
        category: "skills",
        requirement: "Structured skill requirements (vacancy)",
        candidateValue: "—",
        matchLevel: "OPEN",
        pointsLabel: `0 / ${MATCH_WEIGHTS.skillsMax}`,
        note:
          "No structured requirements on this vacancy; the engine awards no skill points.",
      },
    ];
  }

  const sorted = [...requirements].sort((a, b) => {
    if (a.required !== b.required) return a.required ? -1 : 1;
    const na = skillNameById.get(a.skillId)?.trim() || a.skillId;
    const nb = skillNameById.get(b.skillId)?.trim() || b.skillId;
    return na.localeCompare(nb);
  });

  return sorted.map((r) => {
    const name = skillNameById.get(r.skillId)?.trim() || r.skillId;
    const reqLabel = `${name} · ${r.required ? "Required" : "Optional"}${
      r.minimumYears != null ? ` · min ${r.minimumYears} yrs` : ""
    }`;

    const entry = map.get(r.skillId);
    const has = entry != null;
    const years = entry?.years ?? null;

    let candidateValue: string;
    if (!has) {
      candidateValue = "Not on profile";
    } else if (years != null) {
      candidateValue = `${years} yrs`;
    } else {
      candidateValue = "On profile (years not set)";
    }

    let matchLevel: ComparisonRowMatchLevel;
    let note: string;

    if (r.required) {
      if (!has) {
        matchLevel = "GAP";
        note = "Required skill missing from structured profile.";
      } else if (
        r.minimumYears != null &&
        (years == null || years < r.minimumYears)
      ) {
        matchLevel = "PARTIAL";
        note =
          years == null
            ? "Years not recorded; minimum bar not demonstrated."
            : `Below minimum (${years} < ${r.minimumYears} yrs).`;
      } else {
        matchLevel = "MET";
        note =
          r.minimumYears != null
            ? `Meets or exceeds minimum (${r.minimumYears} yrs).`
            : "Required skill present on profile.";
      }
    } else if (!has) {
      matchLevel = "OPEN";
      note = "Optional — not listed; does not block fit.";
    } else if (
      r.minimumYears != null &&
      (years == null || years < r.minimumYears)
    ) {
      matchLevel = "PARTIAL";
      note = "Optional skill present but below stated minimum years.";
    } else {
      matchLevel = "MET";
      note = "Optional skill present.";
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

export type CandidateVacancyComparisonMatrix = {
  rows: ComparisonMatrixRow[];
  computedMatch: ComputedMatch;
};

/**
 * Full matrix + overall score from a single `computeStructuredCandidateVacancyMatch` call
 * so the total always matches stored match rows / list explanations.
 */
export function buildCandidateVacancyComparisonMatrix(
  candidate: MatchCandidateStructuredInput,
  vacancy: MatchVacancyStructuredInput,
  placement: MatchPlacementContext,
  requirementSkillNames: Map<string, string>,
): CandidateVacancyComparisonMatrix {
  const computedMatch = computeStructuredCandidateVacancyMatch(
    candidate,
    vacancy,
    placement,
  );

  const skillRows = buildSkillRequirementRows(
    vacancy.requirements,
    candidate,
    requirementSkillNames,
  );

  const sen = structuredSeniorityContribution(
    candidate.seniority,
    vacancy.seniority,
  );
  const seniorityRow: ComparisonMatrixRow = {
    id: "seniority",
    category: "seniority",
    requirement: `Vacancy level: ${SENIORITY_LABELS[vacancy.seniority]}`,
    candidateValue: SENIORITY_LABELS[candidate.seniority],
    matchLevel: dimensionLevel(sen.points, sen.max),
    pointsLabel: `${sen.points} / ${sen.max}`,
    note: sen.phrase,
  };

  const av = structuredAvailabilityContribution(
    candidate.availabilityStatus,
    placement.busyOnOtherVacancy,
  );
  const availabilityRow: ComparisonMatrixRow = {
    id: "availability",
    category: "availability",
    requirement: "Availability for new work",
    candidateValue: AVAILABILITY_LABELS[candidate.availabilityStatus],
    matchLevel: dimensionLevel(av.points, av.max),
    pointsLabel: `${av.points} / ${av.max}`,
    note: av.phrase,
  };

  const skillNames = candidate.skills.map((s) => s.skillName);
  const role = structuredRoleOverlapContribution(
    candidate.role,
    skillNames,
    vacancy.title,
    vacancy.roleSummary,
  );
  const roleRow: ComparisonMatrixRow = {
    id: "role",
    category: "role",
    requirement: `Role / title fit vs “${vacancy.title.trim()}”`,
    candidateValue: candidate.role.trim() || "—",
    matchLevel: roleLevel(role.points, role.max),
    pointsLabel: `${role.points} / ${role.max}`,
    note: role.phrase || "No role keywords extracted from vacancy title/summary.",
  };

  return {
    rows: [...skillRows, seniorityRow, availabilityRow, roleRow],
    computedMatch,
  };
}
