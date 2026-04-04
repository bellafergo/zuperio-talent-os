/** Parse optional multiline / comma-separated CV PDF fields (deterministic, no AI). */

export type CvLanguageEntry = { name: string; level: string };

export function parseCvLanguagesText(
  raw: string | null | undefined,
): CvLanguageEntry[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const split = line.split(/\s*[–—:|]\s+/);
      if (split.length >= 2) {
        return {
          name: split[0].trim(),
          level: split.slice(1).join(" ").trim(),
        };
      }
      return { name: line, level: "" };
    });
}

export function parseCvCertificationLines(
  raw: string | null | undefined,
): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** One soft skill per line (same rules as certifications). */
export function parseCvSoftSkillsLines(
  raw: string | null | undefined,
): string[] {
  return parseCvCertificationLines(raw);
}

export function parseCvIndustriesText(
  raw: string | null | undefined,
): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseCvEducationBlocks(
  raw: string | null | undefined,
): string[] {
  if (!raw?.trim()) return [];
  const blocks = raw.split(/\r?\n\r?\n/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length > 1) return blocks;
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Bloques/párrafos para la sección Experiencia laboral del CV Zuperio (texto persistido del CV). */
export function parseCvWorkExperienceBlocks(
  raw: string | null | undefined,
): string[] {
  if (!raw?.trim()) return [];
  const t = raw.trim();
  const paras = t.split(/\r?\n\r?\n+/).map((b) => b.trim()).filter(Boolean);
  if (paras.length > 1) return paras.slice(0, 60);
  return t
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 200);
}
