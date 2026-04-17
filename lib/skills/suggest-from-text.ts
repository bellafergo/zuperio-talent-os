import type { SkillOption } from "@/lib/skills/queries";

import { normalizeSkillNameForCatalog } from "@/lib/skills/normalize-skill-name";

/**
 * Heuristic token match against the catalog — suggestions only; user must confirm adds.
 * Uses the same normalization as catalog dedupe (accents, case, punctuation, C#/Node.js).
 */
export function suggestSkillsFromText(
  sourceText: string,
  catalog: SkillOption[],
  opts?: { limit?: number },
): SkillOption[] {
  const limit = opts?.limit ?? 18;
  const text = sourceText.trim();
  if (!text || catalog.length === 0) return [];

  const normalized = text.replace(/[·•]/g, ",");
  const tokens = normalized
    .split(/[,;|\n/]+/g)
    .map((t) => normalizeSkillNameForCatalog(t.trim()))
    .filter((t) => t.length >= 2);

  const entries = catalog.map((s) => ({
    s,
    n: normalizeSkillNameForCatalog(s.name),
  }));

  const seen = new Set<string>();
  const out: SkillOption[] = [];

  function consider(skill: SkillOption) {
    if (seen.has(skill.id)) return;
    seen.add(skill.id);
    out.push(skill);
    if (out.length >= limit) return;
  }

  for (const tok of tokens) {
    if (tok.length < 2) continue;
    for (const { s, n } of entries) {
      if (!n) continue;
      if (n === tok || n.includes(tok) || (tok.length >= 4 && tok.includes(n))) {
        consider(s);
        if (out.length >= limit) return out;
      }
    }
  }

  const blob = normalizeSkillNameForCatalog(text);
  for (const { s, n } of entries) {
    if (n.length < 3) continue;
    if (blob.includes(n)) {
      consider(s);
      if (out.length >= limit) return out;
    }
  }

  return out;
}

export function buildCandidateCvTextForSkillSuggest(
  d: Partial<{
    cvSoftSkillsText: string | null;
    cvCertificationsText: string | null;
    cvLanguagesText: string | null;
    cvRawText: string | null;
  }>,
): string {
  const parts = [
    d.cvSoftSkillsText?.trim(),
    d.cvCertificationsText?.trim(),
    d.cvLanguagesText?.trim(),
  ].filter(Boolean) as string[];
  if (parts.length > 0) return parts.join(", ");
  const raw = d.cvRawText?.trim();
  if (raw) return raw.slice(0, 5000);
  return "";
}
