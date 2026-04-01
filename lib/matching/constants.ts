/** Weighted components sum to 100. */
export const MATCH_WEIGHTS = {
  seniorityMax: 35,
  availabilityMax: 25,
  skillsMax: 30,
  roleOverlapMax: 10,
} as const;

/** Inclusive minimum score for each recommendation band. */
export const MATCH_SCORE_STRONG_MIN = 72;
export const MATCH_SCORE_PARTIAL_MIN = 45;
