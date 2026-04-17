import {
  CandidateAvailabilityStatus as AvailabilityEnum,
  type CandidateAvailabilityStatus,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

import {
  parseCvCertificationLines,
  parseCvEducationBlocks,
  parseCvIndustriesText,
  parseCvLanguagesText,
  parseCvSoftSkillsLines,
  parseCvWorkExperienceBlocks,
  type CvLanguageEntry,
} from "./cv-print-parsing";
import { candidateAvailabilityLabel } from "./availability-ui";
import { logQuietCandidateLoadFailure } from "./log-candidate-load-error";
import { vacancySeniorityLabel } from "./seniority-ui";

export type CandidateCvSkillRow = {
  name: string;
  category: string;
  yearsExperience: number | null;
  level: string | null;
  /** When absent (legacy payloads), CV template falls back to category heuristics. */
  skillType?: "TECHNOLOGY" | "METHODOLOGY";
};

export type CandidateCvPrintData = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string;
  seniorityLabel: string;
  availabilityStatus: CandidateAvailabilityStatus;
  availabilityLabel: string;
  currentCompany: string | null;
  legacySkillsText: string;
  /** Notas de perfil para "Por qué este perfil" (excluye texto solo de experiencia legada del extractor). */
  notes: string | null;
  structuredSkills: CandidateCvSkillRow[];
  /** Hero / chips — optional structured fields */
  locationCity: string | null;
  workModality: string | null;
  languages: CvLanguageEntry[];
  certifications: string[];
  /** Solo texto de CV persistido (cvIndustriesText), sin asignaciones internas. */
  industries: string[];
  educationBlocks: string[];
  /** Parsed from `cvSoftSkillsText` when present; CV PDF uses this before skill-category heuristics. */
  softSkillsFromCvText: string[];
  /** Experiencia laboral para el CV comercial: cvWorkExperienceText o legado en notas del extractor. */
  workExperienceParagraphs: string[];
};

const AVAILABILITY_VALUES = new Set<string>(
  Object.values(AvailabilityEnum),
);

/** Texto que el extractor antiguo guardaba en `notes`; se usa solo si no hay `cvWorkExperienceText`. */
const LEGACY_CV_EXP_PREFIX = "Resumen experiencia (extraído del CV):";

function coerceAvailabilityStatus(
  raw: unknown,
): CandidateAvailabilityStatus {
  if (typeof raw === "string" && AVAILABILITY_VALUES.has(raw)) {
    return raw as CandidateAvailabilityStatus;
  }
  return AvailabilityEnum.AVAILABLE;
}

function legacyWorkExperienceFromNotes(
  notes: string | null | undefined,
): string | null {
  if (!notes?.trim()) return null;
  const t = notes.trim();
  if (!t.startsWith(LEGACY_CV_EXP_PREFIX)) return null;
  const body = t.slice(LEGACY_CV_EXP_PREFIX.length).trim();
  return body || null;
}

/** Evita duplicar en "Por qué este perfil" el bloque que solo era experiencia del CV. */
function notesForWhyProfile(notes: string | null | undefined): string | null {
  if (!notes?.trim()) return null;
  const t = notes.trim();
  if (t.startsWith(LEGACY_CV_EXP_PREFIX)) return null;
  return t;
}

const WORK_EXP_FROM_RAW_CAP = 100_000;

function resolveWorkExperienceParagraphs(
  cvWorkExperienceText: string | null | undefined,
  notes: string | null | undefined,
  cvRawText: string | null | undefined,
): string[] {
  const fromCv = parseCvWorkExperienceBlocks(cvWorkExperienceText);
  if (fromCv.length > 0) return fromCv;
  const fromLegacy = parseCvWorkExperienceBlocks(
    legacyWorkExperienceFromNotes(notes),
  );
  if (fromLegacy.length > 0) return fromLegacy;
  const raw = cvRawText?.trim();
  if (!raw) return [];
  const fromParsed = parseCvWorkExperienceBlocks(raw);
  if (fromParsed.length > 0) return fromParsed.slice(0, 200);
  return [raw.slice(0, WORK_EXP_FROM_RAW_CAP)];
}

function isCvSkillRow(x: unknown): x is CandidateCvSkillRow {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  const st = o.skillType;
  const skillTypeOk =
    st === undefined ||
    st === "TECHNOLOGY" ||
    st === "METHODOLOGY";
  return (
    typeof o.name === "string" &&
    typeof o.category === "string" &&
    (o.yearsExperience === null || typeof o.yearsExperience === "number") &&
    (o.level === null || typeof o.level === "string") &&
    skillTypeOk
  );
}

function isCvLanguageEntry(x: unknown): boolean {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.name === "string" && typeof o.level === "string";
}

/**
 * True only if `data` has the shape expected by `CandidateCvConsultingDocument` (runtime guard).
 */
export function isSafeCandidateCvPrintData(
  data: CandidateCvPrintData | null | undefined,
): data is CandidateCvPrintData {
  if (!data || typeof data !== "object") return false;
  if (typeof data.id !== "string" || !data.id.trim()) return false;
  if (typeof data.fullName !== "string") return false;
  if (typeof data.role !== "string") return false;
  if (typeof data.seniorityLabel !== "string") return false;
  if (
    !data.availabilityStatus ||
    !AVAILABILITY_VALUES.has(String(data.availabilityStatus))
  ) {
    return false;
  }
  if (typeof data.availabilityLabel !== "string") return false;
  if (typeof data.legacySkillsText !== "string") return false;
  if (data.email !== null && typeof data.email !== "string") return false;
  if (data.phone !== null && typeof data.phone !== "string") return false;
  if (data.currentCompany !== null && typeof data.currentCompany !== "string")
    return false;
  if (data.notes !== null && typeof data.notes !== "string") return false;
  if (data.locationCity !== null && typeof data.locationCity !== "string")
    return false;
  if (data.workModality !== null && typeof data.workModality !== "string")
    return false;
  if (!Array.isArray(data.structuredSkills)) return false;
  if (!data.structuredSkills.every(isCvSkillRow)) return false;
  if (!Array.isArray(data.languages)) return false;
  if (!data.languages.every(isCvLanguageEntry)) return false;
  if (!Array.isArray(data.certifications)) return false;
  if (!data.certifications.every((c) => typeof c === "string")) return false;
  if (!Array.isArray(data.industries)) return false;
  if (!data.industries.every((c) => typeof c === "string")) return false;
  if (!Array.isArray(data.educationBlocks)) return false;
  if (!data.educationBlocks.every((c) => typeof c === "string")) return false;
  if (!Array.isArray(data.softSkillsFromCvText)) return false;
  if (!data.softSkillsFromCvText.every((c) => typeof c === "string"))
    return false;
  if (!Array.isArray(data.workExperienceParagraphs)) return false;
  if (!data.workExperienceParagraphs.every((c) => typeof c === "string"))
    return false;
  return true;
}

const MAX_CANDIDATE_ID_LEN = 128;

/**
 * Loads normalized data for the consulting CV PDF / in-app preview.
 * Never throws: invalid ids, missing rows, DB/client drift, and Prisma errors yield `null`.
 */
export async function getCandidateCvPrintData(
  id: string,
): Promise<CandidateCvPrintData | null> {
  const trimmed =
    typeof id === "string" ? id.trim() : "";
  if (!trimmed || trimmed.length > MAX_CANDIDATE_ID_LEN) {
    return null;
  }

  try {
    const row = await prisma.candidate.findUnique({
      where: { id: trimmed },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        seniority: true,
        skills: true,
        availabilityStatus: true,
        currentCompany: true,
        notes: true,
        locationCity: true,
        workModality: true,
        cvLanguagesText: true,
        cvCertificationsText: true,
        cvIndustriesText: true,
        cvEducationText: true,
        cvSoftSkillsText: true,
        cvWorkExperienceText: true,
        cvRawText: true,
        structuredSkills: {
          select: {
            yearsExperience: true,
            level: true,
            skill: { select: { name: true, category: true, skillType: true } },
          },
          /** Scalar order only — relation sort can make Prisma omit joins and return empty skills. */
          orderBy: { id: "asc" },
        },
      },
    });

    if (!row) return null;

    const structuredSkills: CandidateCvSkillRow[] = row.structuredSkills
      .map((cs) => {
        let years: number | null = cs.yearsExperience ?? null;
        if (years != null && typeof years !== "number") {
          const n = Number(years);
          years = Number.isFinite(n) ? Math.floor(n) : null;
        }
        const catRaw = cs.skill?.category;
        const category =
          typeof catRaw === "string" && catRaw.trim()
            ? catRaw.trim()
            : "Skills";
        const lv = cs.level;
        const level =
          lv == null
            ? null
            : (() => {
                const t = String(lv).trim();
                return t || null;
              })();
        return {
          name: cs.skill?.name?.trim() || "",
          category,
          yearsExperience: years,
          level,
          skillType: cs.skill?.skillType,
        };
      })
      .filter((s) => s.name.length > 0);

    let workExperienceParagraphs: string[];
    try {
      workExperienceParagraphs = resolveWorkExperienceParagraphs(
        row.cvWorkExperienceText,
        row.notes,
        row.cvRawText,
      );
    } catch {
      workExperienceParagraphs = [];
    }

    const declaredIndustries = parseCvIndustriesText(row.cvIndustriesText);
    const industriesMerged = declaredIndustries.slice(0, 14);

    const legacySkills =
      typeof row.skills === "string" ? row.skills : "";

    const availabilityStatus = coerceAvailabilityStatus(row.availabilityStatus);

    try {
      return {
        id: row.id,
        fullName:
          `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim() || "—",
        email: row.email?.trim() || null,
        phone: row.phone?.trim() || null,
        role: (row.role ?? "").trim() || "—",
        seniorityLabel: vacancySeniorityLabel(row.seniority),
        availabilityStatus,
        availabilityLabel: candidateAvailabilityLabel(availabilityStatus),
        currentCompany: row.currentCompany?.trim() || null,
        legacySkillsText: legacySkills.trim(),
        notes: notesForWhyProfile(row.notes),
        structuredSkills,
        locationCity: row.locationCity?.trim() || null,
        workModality: row.workModality?.trim() || null,
        languages: parseCvLanguagesText(row.cvLanguagesText),
        certifications: parseCvCertificationLines(row.cvCertificationsText),
        industries: industriesMerged,
        educationBlocks: parseCvEducationBlocks(row.cvEducationText),
        softSkillsFromCvText: parseCvSoftSkillsLines(row.cvSoftSkillsText),
        workExperienceParagraphs,
      };
    } catch (mapErr) {
      logQuietCandidateLoadFailure(
        "getCandidateCvPrintData/map",
        trimmed,
        mapErr,
      );
      return null;
    }
  } catch (err) {
    logQuietCandidateLoadFailure("getCandidateCvPrintData", trimmed, err);
    return null;
  }
}
