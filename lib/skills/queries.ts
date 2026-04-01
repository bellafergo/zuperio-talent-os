import { prisma } from "@/lib/prisma";

import {
  mapCandidateSkillToUi,
  mapVacancyRequirementToUi,
  type CandidateSkillWithSkill,
  type VacancyRequirementWithSkill,
} from "./mappers";
import type { CandidateStructuredSkillUi, SkillCatalogGroupUi, VacancyRequirementUi } from "./types";

const skillSelect = {
  id: true,
  name: true,
  category: true,
} as const;

export async function listCandidateStructuredSkillsForUi(
  candidateId: string,
): Promise<CandidateStructuredSkillUi[]> {
  const rows = await prisma.candidateSkill.findMany({
    where: { candidateId },
    include: { skill: { select: skillSelect } },
    orderBy: [{ skill: { category: "asc" } }, { skill: { name: "asc" } }],
  });
  return rows.map((row) =>
    mapCandidateSkillToUi(row as unknown as CandidateSkillWithSkill),
  );
}

export async function listVacancyRequirementsForUi(
  vacancyId: string,
): Promise<VacancyRequirementUi[]> {
  const rows = await prisma.vacancyRequirement.findMany({
    where: { vacancyId },
    include: { skill: { select: skillSelect } },
    orderBy: [
      { required: "desc" },
      { skill: { category: "asc" } },
      { skill: { name: "asc" } },
    ],
  });
  return rows.map((row) =>
    mapVacancyRequirementToUi(row as unknown as VacancyRequirementWithSkill),
  );
}

/** Catalog grouped by category for /skills page. */
export async function listSkillsCatalogGroupedForUi(): Promise<
  SkillCatalogGroupUi[]
> {
  const rows = await prisma.skill.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { id: true, name: true, category: true },
  });

  const byCat = new Map<string, { id: string; name: string }[]>();
  for (const s of rows) {
    const key = s.category?.trim() || "";
    const label = key || "Uncategorized";
    const list = byCat.get(label) ?? [];
    list.push({ id: s.id, name: s.name });
    byCat.set(label, list);
  }

  return [...byCat.entries()]
    .sort(([a], [b]) => {
      if (a === "Uncategorized") return 1;
      if (b === "Uncategorized") return -1;
      return a.localeCompare(b);
    })
    .map(([categoryLabel, skills]) => ({ categoryLabel, skills }));
}
