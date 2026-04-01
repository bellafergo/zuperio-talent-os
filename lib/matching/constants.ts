/** Weighted components sum to 100 (structured skills v1). */
export const MATCH_WEIGHTS = {
  skillsMax: 40,
  seniorityMax: 25,
  availabilityMax: 20,
  roleOverlapMax: 15,
} as const;

/** Inclusive minimum score for each recommendation band. */
export const MATCH_SCORE_STRONG_MIN = 72;
export const MATCH_SCORE_PARTIAL_MIN = 45;

/** When candidate has an ACTIVE placement on another vacancy, cap availability points. */
export const MATCH_AVAILABILITY_CAP_WHEN_BUSY_ELSEWHERE = 4;
