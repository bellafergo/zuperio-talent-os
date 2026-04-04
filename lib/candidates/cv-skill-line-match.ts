import type { CandidateSkillDraft } from "@/lib/candidates/validation";
import type { SkillOption } from "@/lib/skills/queries";

/** Split skills line on common CV separators (including slash lists). */
export function tokenizeSkillsLine(line: string): string[] {
  const chunks = line.split(/[,;·|\n]+/);
  const pieces: string[] = [];
  for (const ch of chunks) {
    for (const sub of ch.split(/\s*\/\s*/)) {
      const t = sub.trim();
      if (t) pieces.push(t);
    }
  }

  const out: string[] = [];
  for (let raw of pieces) {
    let t = raw
      .replace(/^[\s•·▪▸►‣⁃\-–—*]+/g, "")
      .replace(/[\s•·]+$/g, "")
      .trim();
    if (!t) continue;
    t = t.replace(/\s*\([^)]{0,60}\)\s*$/g, "").trim();
    t = t.replace(/\s*[-–—]\s*(advanced|intermediate|basic|avanzado|básico)\s*$/i, "").trim();
    t = t.replace(/\s*:\s*\d+\+?\s*(years?|años?)?\s*$/i, "").trim();
    if (t.length >= 2 && t.length <= 90) out.push(t);
  }
  return out;
}

function normalizeForCompare(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\.+$/g, "")
    .trim();
}

function stripVersionSuffix(s: string): string {
  return s.replace(/\s+v?\d+(\.\d+)*(?:\s*(years?|años?|yrs?))?$/i, "").trim();
}

function tokenVariants(token: string): string[] {
  const seen = new Set<string>();
  const add = (x: string) => {
    const n = normalizeForCompare(x);
    if (n.length >= 2) seen.add(n);
  };
  add(token);
  add(stripVersionSuffix(token));
  const noDots = token.replace(/\.(?=\s|$)/g, "").trim();
  if (noDots !== token) {
    add(noDots);
    add(stripVersionSuffix(noDots));
  }
  return [...seen];
}

/**
 * Maps free-text skills line to catalog `CandidateSkillDraft[]`.
 * Case- and punctuation-insensitive; multiple tokenization passes for common CV patterns.
 */
export function matchCatalogSkillsFromSkillsLine(
  line: string | undefined,
  catalog: SkillOption[],
): CandidateSkillDraft[] {
  if (!line?.trim()) return [];

  const catalogNorm = new Map<string, SkillOption>();
  for (const c of catalog) {
    catalogNorm.set(normalizeForCompare(c.name), c);
  }

  const out: CandidateSkillDraft[] = [];
  const seenIds = new Set<string>();

  for (const token of tokenizeSkillsLine(line)) {
    for (const v of tokenVariants(token)) {
      const m = catalogNorm.get(v);
      if (m && !seenIds.has(m.id)) {
        seenIds.add(m.id);
        out.push({ skillId: m.id, yearsExperience: null, level: null });
        break;
      }
    }
  }

  return out;
}
