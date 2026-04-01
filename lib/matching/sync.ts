import { prisma } from "@/lib/prisma";

import { computeCandidateVacancyMatch } from "./compute";

/**
 * Recomputes every candidate × vacancy pair and upserts rows (deletes when score is 0).
 * Safe to run after seed or when rules change.
 */
export async function syncAllCandidateVacancyMatches(): Promise<number> {
  const [candidates, vacancies] = await Promise.all([
    prisma.candidate.findMany(),
    prisma.vacancy.findMany(),
  ]);

  let written = 0;

  for (const c of candidates) {
    for (const v of vacancies) {
      const computed = computeCandidateVacancyMatch(
        {
          seniority: c.seniority,
          availabilityStatus: c.availabilityStatus,
          role: c.role,
          skills: c.skills,
        },
        {
          seniority: v.seniority,
          title: v.title,
          skills: v.skills,
          roleSummary: v.roleSummary,
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
          seniorityMatch: computed.seniorityMatch,
          availabilityMatch: computed.availabilityMatch,
          skillsMatchNotes: computed.skillsMatchNotes,
          recommendation: computed.recommendation,
        },
        update: {
          score: computed.score,
          seniorityMatch: computed.seniorityMatch,
          availabilityMatch: computed.availabilityMatch,
          skillsMatchNotes: computed.skillsMatchNotes,
          recommendation: computed.recommendation,
        },
      });
      written += 1;
    }
  }

  return written;
}
