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
  type CvLanguageEntry,
} from "./cv-print-parsing";
import { candidateAvailabilityLabel } from "./availability-ui";
import { placementStatusLabel } from "./placement-status-ui";
import { vacancySeniorityLabel } from "./seniority-ui";

export type CandidateCvSkillRow = {
  name: string;
  category: string;
  yearsExperience: number | null;
  level: string | null;
};

export type CandidateCvPlacementRow = {
  companyName: string;
  roleTitle: string;
  startLabel: string;
  endLabel: string;
  statusLabel: string;
  /** Impact bullets from recent weekly logs (achievements), curated for PDF. */
  highlights: string[];
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
  notes: string | null;
  structuredSkills: CandidateCvSkillRow[];
  placements: CandidateCvPlacementRow[];
  /** Hero / chips — optional structured fields */
  locationCity: string | null;
  workModality: string | null;
  languages: CvLanguageEntry[];
  certifications: string[];
  /** Industrias declaradas + organizaciones de placements (deduplicado) */
  industries: string[];
  educationBlocks: string[];
  /** Parsed from `cvSoftSkillsText` when present; CV PDF uses this before skill-category heuristics. */
  softSkillsFromCvText: string[];
};

const AVAILABILITY_VALUES = new Set<string>(
  Object.values(AvailabilityEnum),
);

function isCvSkillRow(x: unknown): x is CandidateCvSkillRow {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.name === "string" &&
    typeof o.category === "string" &&
    (o.yearsExperience === null || typeof o.yearsExperience === "number") &&
    (o.level === null || typeof o.level === "string")
  );
}

function isCvPlacementRow(x: unknown): x is CandidateCvPlacementRow {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.companyName === "string" &&
    typeof o.roleTitle === "string" &&
    typeof o.startLabel === "string" &&
    typeof o.endLabel === "string" &&
    typeof o.statusLabel === "string" &&
    Array.isArray(o.highlights) &&
    (o.highlights as unknown[]).every((h) => typeof h === "string")
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
  if (!Array.isArray(data.placements)) return false;
  if (!data.placements.every(isCvPlacementRow)) return false;
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
  return true;
}

function formatPlacementDate(d: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    month: "short",
    year: "numeric",
  }).format(d);
}

function achievementBulletsFromLogs(
  logs: { achievements: string | null }[],
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const log of logs) {
    const raw = log.achievements?.trim();
    if (!raw) continue;
    const parts = raw
      .split(/\r?\n|•/g)
      .map((s) => s.replace(/^[-*\d.)\s]+/, "").trim())
      .filter((s) => s.length > 4);
    for (const p of parts) {
      if (out.length >= 4) break;
      const key = p.slice(0, 96).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(p.length > 160 ? `${p.slice(0, 157)}…` : p);
    }
    if (out.length >= 4) break;
  }
  return out;
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
        structuredSkills: {
          select: {
            yearsExperience: true,
            level: true,
            skill: { select: { name: true, category: true } },
          },
          orderBy: { skill: { name: "asc" } },
        },
        placements: {
          orderBy: { startDate: "desc" },
          take: 8,
          select: {
            startDate: true,
            endDate: true,
            status: true,
            company: { select: { name: true } },
            vacancy: { select: { title: true } },
            weeklyLogs: {
              where: { achievements: { not: null } },
              orderBy: { weekStart: "desc" },
              take: 8,
              select: { achievements: true },
            },
          },
        },
      },
    });

    if (!row) return null;

    const structuredSkills: CandidateCvSkillRow[] = row.structuredSkills
      .map((cs) => ({
        name: cs.skill?.name?.trim() || "",
        category: cs.skill?.category?.trim() || "Skills",
        yearsExperience: cs.yearsExperience,
        level: cs.level?.trim() || null,
      }))
      .filter((s) => s.name.length > 0);

    const placements: CandidateCvPlacementRow[] = [];
    for (const p of row.placements) {
      const companyName = p.company?.name?.trim();
      const roleTitle = p.vacancy?.title?.trim();
      if (!companyName || !roleTitle) continue;
      placements.push({
        companyName,
        roleTitle,
        startLabel: formatPlacementDate(p.startDate),
        endLabel: p.endDate ? formatPlacementDate(p.endDate) : "Presente",
        statusLabel: placementStatusLabel(p.status),
        highlights: achievementBulletsFromLogs(p.weeklyLogs ?? []),
      });
    }

    const declaredIndustries = parseCvIndustriesText(row.cvIndustriesText);
    const orgsFromPlacements = [
      ...new Set(placements.map((p) => p.companyName)),
    ];
    const industriesMerged = [
      ...new Set([...declaredIndustries, ...orgsFromPlacements]),
    ].slice(0, 14);

    const legacySkills =
      typeof row.skills === "string" ? row.skills : "";

    return {
      id: row.id,
      fullName: `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim(),
      email: row.email?.trim() || null,
      phone: row.phone?.trim() || null,
      role: row.role,
      seniorityLabel: vacancySeniorityLabel(row.seniority),
      availabilityStatus: row.availabilityStatus,
      availabilityLabel: candidateAvailabilityLabel(row.availabilityStatus),
      currentCompany: row.currentCompany?.trim() || null,
      legacySkillsText: legacySkills.trim(),
      notes: row.notes?.trim() || null,
      structuredSkills,
      placements,
      locationCity: row.locationCity?.trim() || null,
      workModality: row.workModality?.trim() || null,
      languages: parseCvLanguagesText(row.cvLanguagesText),
      certifications: parseCvCertificationLines(row.cvCertificationsText),
      industries: industriesMerged,
      educationBlocks: parseCvEducationBlocks(row.cvEducationText),
      softSkillsFromCvText: parseCvSoftSkillsLines(row.cvSoftSkillsText),
    };
  } catch (err) {
    console.error("[getCandidateCvPrintData] failed", {
      candidateId: trimmed,
      message: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
