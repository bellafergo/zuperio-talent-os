import { prisma } from "@/lib/prisma";

export type VacancyTemplateContext = {
  title: string;
  skillsLine: string | null;
  roleSummary: string | null;
  seniority: string;
  requirementNamesLine: string | null;
};

/**
 * Loads vacancy fields used for interview template resolution (best-effort; never throws to caller).
 */
export async function getVacancyTemplateContext(
  vacancyId: string,
): Promise<VacancyTemplateContext | null> {
  const id = typeof vacancyId === "string" ? vacancyId.trim() : "";
  if (!id) return null;
  try {
    const row = await prisma.vacancy.findUnique({
      where: { id },
      select: {
        title: true,
        skills: true,
        roleSummary: true,
        seniority: true,
        skillRequirements: {
          select: { skill: { select: { name: true } } },
        },
      },
    });
    if (!row) return null;
    const names = row.skillRequirements
      .map((r) => r.skill.name?.trim())
      .filter(Boolean) as string[];
    return {
      title: row.title.trim() || "—",
      skillsLine: row.skills?.trim() || null,
      roleSummary: row.roleSummary?.trim() || null,
      seniority: row.seniority,
      requirementNamesLine: names.length > 0 ? names.join(", ") : null,
    };
  } catch (err) {
    console.warn("[getVacancyTemplateContext] failed", {
      vacancyId: id,
      message: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
