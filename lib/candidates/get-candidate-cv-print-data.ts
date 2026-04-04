import type { CandidateAvailabilityStatus } from "@/generated/prisma/enums";
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

export async function getCandidateCvPrintData(
  id: string,
): Promise<CandidateCvPrintData | null> {
  const row = await prisma.candidate.findUnique({
    where: { id },
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

  const structuredSkills: CandidateCvSkillRow[] = row.structuredSkills.map(
    (cs) => ({
      name: cs.skill.name,
      category: cs.skill.category?.trim() || "Skills",
      yearsExperience: cs.yearsExperience,
      level: cs.level?.trim() || null,
    }),
  );

  const placements: CandidateCvPlacementRow[] = row.placements.map((p) => ({
    companyName: p.company.name,
    roleTitle: p.vacancy.title,
    startLabel: formatPlacementDate(p.startDate),
    endLabel: p.endDate ? formatPlacementDate(p.endDate) : "Presente",
    statusLabel: placementStatusLabel(p.status),
    highlights: achievementBulletsFromLogs(p.weeklyLogs),
  }));

  const declaredIndustries = parseCvIndustriesText(row.cvIndustriesText);
  const orgsFromPlacements = [
    ...new Set(placements.map((p) => p.companyName)),
  ];
  const industriesMerged = [
    ...new Set([...declaredIndustries, ...orgsFromPlacements]),
  ].slice(0, 14);

  return {
    id: row.id,
    fullName: `${row.firstName} ${row.lastName}`.trim(),
    email: row.email?.trim() || null,
    phone: row.phone?.trim() || null,
    role: row.role,
    seniorityLabel: vacancySeniorityLabel(row.seniority),
    availabilityStatus: row.availabilityStatus,
    availabilityLabel: candidateAvailabilityLabel(row.availabilityStatus),
    currentCompany: row.currentCompany?.trim() || null,
    legacySkillsText: row.skills.trim(),
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
}
