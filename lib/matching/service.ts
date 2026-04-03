/**
 * Matching service surface — deterministic structured v1.
 * Implementations: `compute.ts` (pure scoring), `sync.ts` (Prisma persistence).
 */
export {
  computeSkillCoverageOnlyMatch,
  computeStructuredCandidateVacancyMatch,
  type ComputedMatch,
  type MatchCandidateStructuredInput,
  type MatchPlacementContext,
  type MatchVacancyStructuredInput,
} from "./compute";
export { syncAllCandidateVacancyMatches } from "./sync";
