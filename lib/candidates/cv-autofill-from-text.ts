import type { CvAutofillSuggestions } from "./cv-autofill-types";

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

const SECTION_HEADERS: { key: keyof SectionAcc; pattern: RegExp }[] = [
  { key: "skills", pattern: /^(skills|competencias|technical\s*skills|tech\s*stack|technologies|stack|habilidades\s*técnicas)\s*:?\s*$/i },
  { key: "languages", pattern: /^(languages|idiomas|language\s*skills)\s*:?\s*$/i },
  { key: "certs", pattern: /^(certifications|certificaciones|certificates|licenses)\s*:?\s*$/i },
  { key: "education", pattern: /^(education|educación|formación|academic\s*background)\s*:?\s*$/i },
  { key: "experience", pattern: /^(experience|experiencia|work\s*history|employment)\s*:?\s*$/i },
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

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1] ?? "",
  };
}

function guessNameFromLines(lines: string[]): string | null {
  for (const line of lines.slice(0, 12)) {
    if (line.includes("@")) continue;
    if (PHONE_RE.test(line) && line.length < 36) continue;
    if (line.length < 4 || line.length > 90) continue;
    if (/^https?:\/\//i.test(line)) continue;
    if (/linkedin\.com/i.test(line)) continue;
    const wordCount = line.split(/\s+/).length;
    if (wordCount >= 2 && wordCount <= 5 && !/^\d+$/.test(line)) {
      return line;
    }
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

function guessRole(lines: string[]): string | undefined {
  const labeled = extractLabelValue(
    lines,
    /^(title|puesto|position|cargo|rol)\s*:\s*(.+)$/i,
  );
  if (labeled) return labeled.slice(0, 200);

  for (const line of lines.slice(0, 25)) {
    if (ROLE_HINT_RE.test(line) && line.length < 120) {
      return line.slice(0, 200);
    }
  }
  return undefined;
}

/**
 * Deterministic heuristics — no network, no AI. Safe to call on untrusted text.
 */
export function parseCvPlainTextForAutofill(raw: string): CvAutofillSuggestions {
  const text = raw.replace(/\0/g, " ").trim();
  if (text.length < 20) return {};

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
    const { firstName, lastName } = splitName(nameLine);
    if (firstName) out.firstName = firstName.slice(0, 120);
    if (lastName) out.lastName = lastName.slice(0, 120);
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
    const snippet = sections.experience.slice(0, 8).join("\n").slice(0, 2000);
    if (snippet.trim()) {
      out.notes = `Resumen experiencia (extraído del CV):\n${snippet}`;
    }
  }

  return out;
}
