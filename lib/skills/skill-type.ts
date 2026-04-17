import type { SkillType } from "@/generated/prisma/enums";

/**
 * Canonical categories that represent methodologies / practices (not stack tools).
 * Aligned with seed + catalog-expansion-map buckets.
 */
export const METHODOLOGY_SKILL_CATEGORIES = new Set<string>([
  "Project Management & Metodologías",
  "Gestión de Procesos (BPM)",
  "Soft Skills Técnicos",
  "ITSM & Operaciones",
]);

export function inferSkillTypeFromCategory(
  category: string | null | undefined,
): SkillType {
  const c = category?.trim();
  if (c && METHODOLOGY_SKILL_CATEGORIES.has(c)) return "METHODOLOGY";
  return "TECHNOLOGY";
}

export function skillTypeShortLabel(t: SkillType): string {
  return t === "METHODOLOGY" ? "Metodología" : "Tecnología";
}
