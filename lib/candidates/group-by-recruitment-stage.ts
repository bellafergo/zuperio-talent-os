import type { CandidateRecruitmentStage } from "@/generated/prisma/enums";

import { CANDIDATE_RECRUITMENT_STAGE_ORDER } from "./constants";
import type { CandidateUi } from "./types";

const STAGE_SET = new Set<string>(CANDIDATE_RECRUITMENT_STAGE_ORDER);

/**
 * Buckets filtered candidates into fixed stage columns. Unknown stages map to NUEVO.
 */
export function groupCandidatesByRecruitmentStage(
  candidates: CandidateUi[],
): Map<CandidateRecruitmentStage, CandidateUi[]> {
  const map = new Map<CandidateRecruitmentStage, CandidateUi[]>();
  for (const stage of CANDIDATE_RECRUITMENT_STAGE_ORDER) {
    map.set(stage, []);
  }
  for (const c of candidates) {
    const stage =
      typeof c.recruitmentStage === "string" && STAGE_SET.has(c.recruitmentStage)
        ? c.recruitmentStage
        : ("NUEVO" as CandidateRecruitmentStage);
    map.get(stage)!.push(c);
  }
  return map;
}
