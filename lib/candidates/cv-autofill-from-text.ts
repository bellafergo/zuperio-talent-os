import type { CvAutofillSuggestions } from "./cv-autofill-types";
import { CV_RAW_TEXT_MAX, CV_WORK_EXPERIENCE_FIELD_MAX } from "./cv-text-limits";

function normalizeLines(text: string): string[] {
  return text
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

// No /g flag — only the first match is used, and .test() with /g corrupts lastIndex across loop calls
const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

/** Loose phone: international or MX-style digit groups */
const PHONE_RE =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,6}\b/;

const ROLE_HINT_RE =
  /\b(developer|engineer|ingeniero|consultant|consultor|manager|gerente|analyst|analista|architect|arquitecto|lead|scientist|diseñador|designer|product\s*owner|scrum\s*master|devops|sre|full\s*stack|frontend|backend|data)\b/i;

/** Stronger signals for job titles mined from work-history blocks (PDFs often lack a top “Cargo”). */
const WORK_TITLE_KEYWORD_RE =
  /\b(architect|arquitecto|engineer|ingeniero|developer|consultant|consultor|manager|gerente|director|lead|head|cto|vp|vice|principal|specialist|especialista|analyst|analista|scientist|designer|diseñador|blockchain|transformation|officer|ejecutivo)\b/i;

/** Section header: start of employment / work history (Spanish PDF layouts). */
const WORK_HISTORY_HEADER_RE =
  /^(historia\s+laboral|historial\s*laboral|historialaboral|experiencia\s+laboral|experiencia\s+profesional|work\s+experience|employment\s+history|professional\s+experience|employment)\s*:?\s*$/i;

const EDUCATION_SECTION_HEADER_RE =
  /^(educación|education|formación|formacion|academic\s*background|estudios|academic)\s*:?\s*$/i;

/** Text that indicates the line is not a person’s legal/full name. */
const NON_NAME_CONTEXT_RE =
  /universidad|university|instituto|institute|tec\.?\s+de|tecnol[oó]g|monterrey|guadalajara|ciudad\s+de|licenciatura|bachillerato|maestr[ií]a|doctorado|\bmba\b|gpa|promedio|egresad|graduated|email|e-?mail|tel[eé]fono|phone|mobil|celular|linkedin|github|\.com\b|\.mx\b|http|www\.|^\s*cargo\s*:|^\s*puesto\s*:|^\s*fecha\s*:|^\s*título\s*:|periodo|desde\s+\d|hasta\s+\d|^\s*experien|^\s*education|^\s*educaci[oó]n|^\s*certific|^\s*skills\b|competencias\s*técn|ubicaci[oó]n|direcci[oó]n|r[ée]sum[ée]|curriculum|\bcv\b|años\s+de\s+exper|years\s+of\s+experience|logros\s+en|responsible\s+for|where\s+i\s|leading\s+a\s+team|desarroll[ée]\s+(un|el|la)\s|implementaci[oó]n\s+de/iu;

const NARRATIVE_ROLE_RE =
  /responsible\s+for|where\s+i\s|logr[ée]\s|implement[ée]\s+(un|el|la)|desarroll[ée]\s+(un|sistema)|más\s+de\s+\d+\s+años|over\s+\d+\s+years|experiencia\s+(de\s+)?\d+|@|\bwww\./i;

function lineLooksNonNameContext(line: string): boolean {
  return NON_NAME_CONTEXT_RE.test(line);
}

function isPlausiblePersonNameTokens(text: string): boolean {
  const t = text.replace(/,/g, " ").replace(/\s+/g, " ").trim();
  if (t.length < 3 || t.length > 72) return false;
  if (/\d/.test(t)) return false;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 5) return false;
  return words.every((w) => /^[\p{L}]+(?:['-][\p{L}]+)*$/u.test(w));
}

function isPlausibleNameSegment(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  return t.split(/\s+/).every((w) => /^[\p{L}]+(?:['-][\p{L}]+)*$/u.test(w));
}

const SECTION_HEADERS: { key: keyof SectionAcc; pattern: RegExp }[] = [
  { key: "skills", pattern: /^(skills|competencias|technical\s*skills|tech\s*stack|technologies|stack|habilidades\s*técnicas)\s*:?\s*$/i },
  { key: "languages", pattern: /^(languages|idiomas|language\s*skills)\s*:?\s*$/i },
  { key: "certs", pattern: /^(certifications|certificaciones|certificates|licenses)\s*:?\s*$/i },
  { key: "education", pattern: /^(education|educación|formación|academic\s*background)\s*:?\s*$/i },
  {
    key: "experience",
    pattern:
      /^(experience|experiencia|work\s*history|employment|historia\s+laboral|historial\s*laboral|historialaboral|experiencia\s+laboral|experiencia\s+profesional|professional\s+experience)\s*:?\s*$/i,
  },
  {
    key: "softSkills",
    pattern:
      /^(soft\s*skills|habilidades\s*blandas|competencias\s*blandas|people\s*skills|power\s*skills)\s*:?\s*$/i,
  },
  {
    key: "industries",
    pattern: /^(industries|industrias|sectores|vertical(es)?|domains?)\s*:?\s*$/i,
  },
];

type SectionAcc = {
  skills: string[];
  languages: string[];
  certs: string[];
  education: string[];
  experience: string[];
  softSkills: string[];
  industries: string[];
};

function parseSections(lines: string[]): SectionAcc {
  const acc: SectionAcc = {
    skills: [],
    languages: [],
    certs: [],
    education: [],
    experience: [],
    softSkills: [],
    industries: [],
  };
  let current: keyof SectionAcc | null = null;

  for (const line of lines) {
    let matchedHeader = false;
    for (const { key, pattern } of SECTION_HEADERS) {
      if (pattern.test(line)) {
        current = key;
        matchedHeader = true;
        break;
      }
    }
    if (matchedHeader) continue;

    if (!current) continue;

    if (/^[-•·*]\s*/.test(line) || /^\d+[\).\s]/.test(line)) {
      acc[current].push(line.replace(/^[-•·*\d\).\s]+/, "").trim());
    } else if (line.length < 120 && !line.includes("@")) {
      acc[current].push(line);
    } else {
      acc[current].push(line);
    }
  }
  return acc;
}

/** Lone token after a comma that is a generational suffix, not a given name. */
const NAME_SUFFIX_RE = /^(jr\.?|sr\.?|iii|iv|ii|ph\.?d\.?|msc|mba|cpa)$/i;

function splitName(full: string): { firstName: string; lastName: string } {
  const t = full.replace(/\s+/g, " ").trim();
  if (!t) return { firstName: "", lastName: "" };

  if (t.includes(",")) {
    const rawParts = t.split(",").map((s) => s.trim()).filter(Boolean);
    if (rawParts.length === 2) {
      const [a, b] = rawParts;
      const leftTokens = a.split(/\s+/).filter(Boolean);
      const rightTokens = b.split(/\s+/).filter(Boolean);
      const loneSuffix =
        rightTokens.length === 1 && NAME_SUFFIX_RE.test(rightTokens[0] ?? "");
      if (!loneSuffix && leftTokens.length >= 1 && rightTokens.length >= 1) {
        if (leftTokens.length >= 2 && rightTokens.length >= 1) {
          return {
            firstName: rightTokens.join(" ").slice(0, 120),
            lastName: leftTokens.join(" ").slice(0, 120),
          };
        }
        if (leftTokens.length === 1 && rightTokens.length >= 1) {
          return {
            firstName: rightTokens.join(" ").slice(0, 120),
            lastName: leftTokens[0]!.slice(0, 120),
          };
        }
      }
    }
  }

  const parts = t.replace(/,/g, " ").split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts.slice(0, -1).join(" ").slice(0, 120),
    lastName: (parts[parts.length - 1] ?? "").slice(0, 120),
  };
}

function extractLabeledPersonName(lines: string[]): string | null {
  const labeled = extractLabelValue(
    lines,
    /^(name|nombre|full\s*name|nombre\s*completo)\s*:\s*(.+)$/i,
  );
  if (!labeled) return null;
  const v = labeled.trim();
  if (v.length < 3 || v.length > 80) return null;
  if (lineLooksNonNameContext(v)) return null;
  if (!isPlausiblePersonNameTokens(v)) return null;
  return v;
}

/**
 * PDFs often place identity after summary/skills as "Nombre Apellido / …" (even if the rest is truncated).
 * Uses only the first slash segment; skips lines while inside an education block.
 */
function extractNameFromSlashIdentityLines(lines: string[]): string | null {
  let inEducation = false;

  for (const line of lines) {
    if (EDUCATION_SECTION_HEADER_RE.test(line)) {
      inEducation = true;
      continue;
    }
    if (WORK_HISTORY_HEADER_RE.test(line)) {
      inEducation = false;
      continue;
    }
    if (
      /^(resumen|summary|tecnolog|technologies|skills|habilidades\s+blandas|idiomas|certific|competencias)\s*:?\s*$/i.test(
        line,
      )
    ) {
      inEducation = false;
    }

    if (inEducation) continue;

    if (!line.includes("/")) continue;
    if (line.length > 78) continue;

    const segments = line
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean);
    const first = segments[0];
    if (!first || first.length < 4 || first.length > 52) continue;
    if (/\d/.test(first)) continue;
    if (lineLooksNonNameContext(first)) continue;
    if (!isPlausiblePersonNameTokens(first)) continue;
    return first;
  }
  return null;
}

function guessNameFromLines(lines: string[]): string | null {
  const labeled = extractLabeledPersonName(lines);
  if (labeled) return labeled;

  const slashName = extractNameFromSlashIdentityLines(lines);
  if (slashName) return slashName;

  for (const line of lines.slice(0, 10)) {
    if (line.includes("@")) continue;
    if (/^https?:\/\//i.test(line)) continue;
    if (/linkedin\.com/i.test(line)) continue;
    if (PHONE_RE.test(line)) continue;
    if (lineLooksNonNameContext(line)) continue;
    if (line.length < 6 || line.length > 52) continue;
    const wordCount = line.split(/\s+/).length;
    if (wordCount < 2 || wordCount > 4) continue;
    if (!isPlausiblePersonNameTokens(line)) continue;
    return line;
  }
  return null;
}

function extractLabelValue(
  lines: string[],
  labels: RegExp,
): string | undefined {
  for (const line of lines.slice(0, 40)) {
    const m = line.match(labels);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return undefined;
}

function normalizeWorkModality(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const t = raw.toLowerCase();
  if (t.includes("híbrid") || t.includes("hybrid")) return "Híbrido";
  if (
    t.includes("remot") ||
    t.includes("home office") ||
    t.includes("teletrabajo") ||
    t.includes("wfh") ||
    t.includes("work from home")
  ) {
    return "Home office";
  }
  if (
    t.includes("presencial") ||
    t.includes("onsite") ||
    t.includes("on-site") ||
    t.includes("oficina")
  ) {
    return "Presencial";
  }
  return undefined;
}

function isPlausibleRoleTitleValue(raw: string): boolean {
  const t = raw.trim();
  if (t.length < 2 || t.length > 95) return false;
  const wc = t.split(/\s+/).length;
  if (wc > 14) return false;
  const dots = (t.match(/\./g) ?? []).length;
  if (dots >= 2) return false;
  if (NARRATIVE_ROLE_RE.test(t)) return false;
  return true;
}

function shortenJobTitleFromHistory(line: string): string {
  let t = line.trim();
  const forIdx = t.search(/\s+for\s+(?=[A-ZÁÉÍÓÚÑ])/i);
  if (forIdx > 6) t = t.slice(0, forIdx).trim();
  const atIdx = t.search(/\s+at\s+/i);
  if (atIdx > 6) t = t.slice(0, atIdx).trim();
  const pipeIdx = t.indexOf("|");
  if (pipeIdx > 4) t = t.slice(0, pipeIdx).trim();
  return t.slice(0, 120);
}

function isLikelyFirstJobTitleLine(line: string): boolean {
  const t = line.trim();
  if (t.length < 6 || t.length > 100) return false;
  if (/^\d{4}\s*[-–]/.test(t)) return false;
  const wc = t.split(/\s+/).length;
  if (wc < 2 || wc > 14) return false;
  if (NARRATIVE_ROLE_RE.test(t)) return false;
  if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|ene|abr|ago|dic)\b/i.test(t)) {
    return false;
  }
  if (/^\d{4}\s*[-–]\s*(\d{4}|present|actual|act\.?)\s*$/i.test(t)) return false;
  if (/^\d{1,2}\/\d{4}/.test(t)) return false;
  if (/universidad|licenciatura|educaci[oó]n|bachillerato|maestr[ií]a/i.test(t)) {
    return false;
  }
  if (!WORK_TITLE_KEYWORD_RE.test(t) && !ROLE_HINT_RE.test(t)) return false;
  const lowerish = (t.match(/\b[a-záéíóúñ]{4,}\b/g) ?? []).length;
  if (lowerish > 8) return false;
  return true;
}

/**
 * First concise title-like line after a work-history header (PDFs with summary-first layout).
 */
function inferRoleFromWorkHistory(lines: string[]): string | undefined {
  let inWork = false;

  for (const line of lines) {
    if (WORK_HISTORY_HEADER_RE.test(line)) {
      inWork = true;
      continue;
    }

    if (inWork) {
      if (
        /^(education|educación|formación|skills|tecnolog|certific|idiomas|referencias|proyectos|publications)\s*:?\s*$/i.test(
          line,
        )
      ) {
        break;
      }
      if (EDUCATION_SECTION_HEADER_RE.test(line)) break;

      if (!line.trim()) continue;

      if (isLikelyFirstJobTitleLine(line)) {
        const shortened = shortenJobTitleFromHistory(line);
        if (isPlausibleRoleTitleValue(shortened)) return shortened;
      }
    }
  }
  return undefined;
}

function guessRole(lines: string[]): string | undefined {
  const labeled = extractLabelValue(
    lines,
    /^(title|puesto|position|cargo|rol)\s*:\s*(.+)$/i,
  );
  if (labeled) {
    const t = labeled.trim();
    if (!isPlausibleRoleTitleValue(t)) return undefined;
    return t.slice(0, 120);
  }

  const fromWork = inferRoleFromWorkHistory(lines);
  if (fromWork) return fromWork;

  for (const line of lines.slice(0, 18)) {
    if (line.length < 4 || line.length > 78) continue;
    if (lineLooksNonNameContext(line)) continue;
    if (/universidad|licenciatura|educaci[oó]n|certificat|experiencia\s+laboral/i.test(line)) {
      continue;
    }
    if (NARRATIVE_ROLE_RE.test(line)) continue;
    const wc = line.split(/\s+/).length;
    if (wc > 12) continue;
    if (!ROLE_HINT_RE.test(line)) continue;
    return line.slice(0, 120);
  }
  return undefined;
}

function rawAndWorkFallbackFromText(text: string): Pick<
  CvAutofillSuggestions,
  "cvRawText" | "cvWorkExperienceText"
> {
  const capped = text.slice(0, CV_RAW_TEXT_MAX);
  return {
    cvRawText: capped,
    cvWorkExperienceText: capped.slice(0, CV_WORK_EXPERIENCE_FIELD_MAX),
  };
}

/**
 * Deterministic heuristics — no network, no AI. Safe to call on untrusted text.
 * No lanza: errores internos devuelven texto crudo como respaldo de experiencia.
 */
export function parseCvPlainTextForAutofill(raw: string): CvAutofillSuggestions {
  const text = raw.replace(/\0/g, " ").trim();
  if (text.length < 20) return {};

  try {
    const lines = normalizeLines(text);
    const out: CvAutofillSuggestions = {};

    const emailMatch = text.match(EMAIL_RE);
    if (emailMatch?.[0]) {
      out.email = emailMatch[0].toLowerCase();
    }

    const phoneMatch = text.match(PHONE_RE);
    if (phoneMatch?.[0]) {
      const digits = phoneMatch[0].replace(/\D/g, "");
      if (digits.length >= 10) {
        out.phone = phoneMatch[0].trim().slice(0, 40);
      }
    }

    const nameLine = guessNameFromLines(lines);
    if (nameLine) {
      const flat = nameLine.replace(/,/g, " ").replace(/\s+/g, " ").trim();
      if (isPlausiblePersonNameTokens(flat)) {
        const { firstName, lastName } = splitName(nameLine);
        if (firstName && isPlausibleNameSegment(firstName)) {
          out.firstName = firstName.slice(0, 120);
        }
        if (lastName && isPlausibleNameSegment(lastName)) {
          out.lastName = lastName.slice(0, 120);
        }
      }
    }

    const role = guessRole(lines);
    if (role) out.role = role;

    const loc = extractLabelValue(
      lines,
      /^(location|ubicación|ciudad|city)\s*:\s*(.+)$/i,
    );
    if (loc) out.locationCity = loc.slice(0, 200);

    for (const line of lines.slice(0, 30)) {
      const wm = normalizeWorkModality(line);
      if (wm) {
        out.workModality = wm;
        break;
      }
    }

    const sections = parseSections(lines);

    if (sections.skills.length > 0) {
      out.skillsLine = sections.skills.slice(0, 40).join(", ");
    }

    if (sections.languages.length > 0) {
      out.cvLanguagesText = sections.languages.slice(0, 20).join("\n");
    }

    if (sections.certs.length > 0) {
      out.cvCertificationsText = sections.certs.slice(0, 25).join("\n");
    }

    if (sections.education.length > 0) {
      out.cvEducationText = sections.education.slice(0, 15).join("\n").slice(0, 4000);
    }

    if (sections.softSkills.length > 0) {
      out.cvSoftSkillsText = sections.softSkills
        .slice(0, 40)
        .join("\n")
        .slice(0, 6000);
    }

    if (sections.industries.length > 0) {
      out.cvIndustriesText = sections.industries
        .slice(0, 24)
        .join(", ")
        .slice(0, 6000);
    }

    if (sections.experience.length > 0) {
      const body = sections.experience
        .slice(0, 60)
        .join("\n\n")
        .trim()
        .slice(0, CV_WORK_EXPERIENCE_FIELD_MAX);
      if (body) {
        out.cvWorkExperienceText = body;
      }
    }

    out.cvRawText = text.slice(0, CV_RAW_TEXT_MAX);
    if (!out.cvWorkExperienceText?.trim()) {
      out.cvWorkExperienceText = text.slice(0, CV_WORK_EXPERIENCE_FIELD_MAX);
    }

    return out;
  } catch (err) {
    console.error("[parseCvPlainTextForAutofill] failed, using raw fallback", err);
    return rawAndWorkFallbackFromText(text);
  }
}
