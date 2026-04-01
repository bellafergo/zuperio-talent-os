import { prisma } from "@/lib/prisma";

import { computeStructuredCandidateVacancyMatch } from "./compute";

/**
 * Recomputes every candidate × vacancy pair from structured skills + core attributes.
 * Upserts rows when score > 0; deletes when 0.
 */
export async function syncAllCandidateVacancyMatches(): Promise<number> {
  const [candidates, vacancies, activePlacements] = await Promise.all([
    prisma.candidate.findMany({
      include: {
        structuredSkills: {
          select: {
            skillId: true,
            yearsExperience: true,
            skill: { select: { name: true } },
          },
        },
      },
    }),
    prisma.vacancy.findMany({
      include: {
        skillRequirements: {
          select: { skillId: true, required: true, minimumYears: true },
        },
      },
    }),
    prisma.placement.findMany({
      where: { status: "ACTIVE" },
      select: { candidateId: true, vacancyId: true },
    }),
  ]);

  const activeVacanciesByCandidate = new Map<string, string[]>();
  for (const p of activePlacements) {
    const list = activeVacanciesByCandidate.get(p.candidateId) ?? [];
    list.push(p.vacancyId);
    activeVacanciesByCandidate.set(p.candidateId, list);
  }

  function busyOnOtherVacancy(
    candidateId: string,
    vacancyId: string,
  ): boolean {
    const list = activeVacanciesByCandidate.get(candidateId) ?? [];
    return list.some((vid) => vid !== vacancyId);
  }

  let written = 0;

  for (const c of candidates) {
    for (const v of vacancies) {
      const computed = computeStructuredCandidateVacancyMatch(
        {
          seniority: c.seniority,
          availabilityStatus: c.availabilityStatus,
          role: c.role,
          skills: c.structuredSkills.map((cs) => ({
            skillId: cs.skillId,
            skillName: cs.skill.name,
            yearsExperience: cs.yearsExperience,
          })),
        },
        {
          seniority: v.seniority,
          title: v.title,
          roleSummary: v.roleSummary,
          requirements: v.skillRequirements.map((r) => ({
            skillId: r.skillId,
            required: r.required,
            minimumYears: r.minimumYears,
          })),
        },
        {
          busyOnOtherVacancy: busyOnOtherVacancy(c.id, v.id),
        },
      );

      if (computed.score <= 0) {
        await prisma.candidateVacancyMatch.deleteMany({
          where: { candidateId: c.id, vacancyId: v.id },
        });
        continue;
      }

      await prisma.candidateVacancyMatch.upsert({
        where: {
          candidateId_vacancyId: { candidateId: c.id, vacancyId: v.id },
        },
        create: {
          candidateId: c.id,
          vacancyId: v.id,
          score: computed.score,
          recommendation: computed.recommendation,
          explanation: computed.explanation,
        },
        update: {
          score: computed.score,
          recommendation: computed.recommendation,
          explanation: computed.explanation,
        },
      });
      written += 1;
    }
  }

  return written;
}
