import { createHash } from "node:crypto";

import { normalizeSkillNameForCatalog } from "../lib/skills/normalize-skill-name";
import { inferSkillTypeFromCategory } from "../lib/skills/skill-type";
import type { PrismaClient } from "../generated/prisma/client";

import catalog from "./catalog-expansion.json";
import { mapExpansionRow } from "./catalog-expansion-map";
import { SEED_SKILLS } from "./seed-skills";

type ExpansionRow = { name: string; userCategory: string };

function stableExpansionId(normalizedName: string): string {
  const h = createHash("sha256")
    .update(normalizedName)
    .digest("hex")
    .slice(0, 12);
  return `skill_e_${h}`;
}

/**
 * Inserts catalog expansion rows not already present (case-insensitive name),
 * skipping seed skills and duplicate normalized keys in the JSON iteration order.
 */
export async function runCatalogExpansion(prisma: PrismaClient): Promise<{
  added: number;
  skippedExisting: number;
  skippedDuplicate: number;
}> {
  const rows = catalog as ExpansionRow[];
  const seedNorm = new Set(
    SEED_SKILLS.map((s) => normalizeSkillNameForCatalog(s.name)),
  );
  const consumed = new Set<string>();
  let skippedDuplicate = 0;
  let skippedExisting = 0;
  let added = 0;

  for (const row of rows) {
    const key = normalizeSkillNameForCatalog(row.name);
    if (consumed.has(key)) {
      skippedDuplicate++;
      continue;
    }
    consumed.add(key);

    if (seedNorm.has(key)) {
      skippedExisting++;
      continue;
    }

    const exists = await prisma.skill.findFirst({
      where: { name: { equals: row.name, mode: "insensitive" } },
      select: { id: true },
    });
    if (exists) {
      skippedExisting++;
      continue;
    }

    const category = mapExpansionRow(row.name, row.userCategory);
    const skillType = inferSkillTypeFromCategory(category);
    const id = stableExpansionId(key);
    await prisma.skill.create({
      data: {
        id,
        name: row.name,
        category,
        skillType,
      },
    });
    added++;
  }

  console.info(
    `[catalog expansion] added=${added} skippedDuplicate=${skippedDuplicate} skippedExisting=${skippedExisting}`,
  );
  return { added, skippedExisting, skippedDuplicate };
}
