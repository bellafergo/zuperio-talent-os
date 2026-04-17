/**
 * Canonical normalization for skill names across:
 * - catalog JSON build (mirrored in prisma/scripts/build-catalog-expansion-json.py)
 * - seed dedupe / stable ids
 * - suggest-from-text matching
 *
 * Order matters: tech aliases before punctuation stripping (e.g. C#, Node.js).
 */
export function normalizeSkillNameForCatalog(input: string): string {
  let s = input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();

  s = s.replace(/node\.js/gi, "nodejs");
  s = s.replace(/c\s*#/gi, "csharp");

  s = s.replace(/[^\p{L}\p{N}]+/gu, " ");
  return s.replace(/\s+/g, " ").trim();
}
