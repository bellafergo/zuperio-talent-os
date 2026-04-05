import type { SkillType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

import {
  mapCandidateSkillToUi,
  mapVacancyRequirementToUi,
  type CandidateSkillWithSkill,
  type VacancyRequirementWithSkill,
} from "./mappers";
import type { CandidateStructuredSkillUi, SkillCatalogGroupUi, SkillCatalogRowUi, VacancyRequirementUi } from "./types";
import { skillTypeShortLabel } from "./skill-type";

const skillSelect = {
  id: true,
  name: true,
  category: true,
  skillType: true,
} as const;

export async function listCandidateStructuredSkillsForUi(
  candidateId: string,
): Promise<CandidateStructuredSkillUi[]> {
  const rows = await prisma.candidateSkill.findMany({
    where: { candidateId },
    include: { skill: { select: skillSelect } },
    orderBy: [
      { skill: { skillType: "asc" } },
      { skill: { category: "asc" } },
      { skill: { name: "asc" } },
    ],
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
      { skill: { skillType: "asc" } },
      { skill: { category: "asc" } },
      { skill: { name: "asc" } },
    ],
  });
  return rows.map((row) =>
    mapVacancyRequirementToUi(row as unknown as VacancyRequirementWithSkill),
  );
}

export type SkillOption = {
  id: string;
  name: string;
  category: string | null;
  skillType: SkillType;
};

/** Flat skills list for vacancy requirement forms. */
export async function listSkillsForVacancyForm(): Promise<SkillOption[]> {
  return prisma.skill.findMany({
    orderBy: [{ skillType: "asc" }, { category: "asc" }, { name: "asc" }],
    select: { id: true, name: true, category: true, skillType: true },
  });
}

/** Catalog grouped by category for /skills page (includes usage counts). */
export async function listSkillsCatalogGroupedForUi(): Promise<
  SkillCatalogGroupUi[]
> {
  const rows = await prisma.skill.findMany({
    orderBy: [{ skillType: "asc" }, { category: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      category: true,
      skillType: true,
      _count: { select: { candidateLinks: true, vacancyNeeds: true } },
    },
  });

  const byCat = new Map<string, SkillCatalogRowUi[]>();
  for (const s of rows) {
    const key = s.category?.trim() || "";
    const label = key || "Sin categoría";
    const list = byCat.get(label) ?? [];
    list.push({
      id: s.id,
      name: s.name,
      category: label,
      skillType: s.skillType,
      skillTypeLabel: skillTypeShortLabel(s.skillType),
      candidateCount: s._count.candidateLinks,
      vacancyCount: s._count.vacancyNeeds,
    });
    byCat.set(label, list);
  }

  return [...byCat.entries()]
    .sort(([a], [b]) => {
      if (a === "Sin categoría") return 1;
      if (b === "Sin categoría") return -1;
      return a.localeCompare(b);
    })
    .map(([categoryLabel, skills]) => ({ categoryLabel, skills }));
}
