import { prisma } from "@/lib/prisma";

/**
 * True if the candidate is linked to the vacancy via an ACTIVE application
 * or pipeline (pipelineVacancyId). Used to authorize interview AI context.
 */
export async function isCandidateInVacancyProcess(
  candidateId: string,
  vacancyId: string,
): Promise<boolean> {
  const cid = candidateId.trim();
  const vid = vacancyId.trim();
  if (!cid || !vid) return false;

  try {
    const app = await prisma.vacancyApplication.findFirst({
      where: {
        candidateId: cid,
        vacancyId: vid,
        status: "ACTIVE",
      },
      select: { id: true },
    });
    if (app) return true;

    const pipe = await prisma.candidate.findFirst({
      where: { id: cid, pipelineVacancyId: vid },
      select: { id: true },
    });
    return Boolean(pipe);
  } catch (err) {
    console.warn("[isCandidateInVacancyProcess] failed", err);
    return false;
  }
}
