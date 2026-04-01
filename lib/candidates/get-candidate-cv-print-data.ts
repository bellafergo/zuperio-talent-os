import { prisma } from "@/lib/prisma";

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
};

export type CandidateCvPrintData = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string;
  seniorityLabel: string;
  availabilityLabel: string;
  currentCompany: string | null;
  legacySkillsText: string;
  notes: string | null;
  structuredSkills: CandidateCvSkillRow[];
  placements: CandidateCvPlacementRow[];
};

function formatPlacementDate(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(d);
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
        take: 10,
        select: {
          startDate: true,
          endDate: true,
          status: true,
          company: { select: { name: true } },
          vacancy: { select: { title: true } },
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
    endLabel: p.endDate ? formatPlacementDate(p.endDate) : "Present",
    statusLabel: placementStatusLabel(p.status),
  }));

  return {
    id: row.id,
    fullName: `${row.firstName} ${row.lastName}`.trim(),
    email: row.email?.trim() || null,
    phone: row.phone?.trim() || null,
    role: row.role,
    seniorityLabel: vacancySeniorityLabel(row.seniority),
    availabilityLabel: candidateAvailabilityLabel(row.availabilityStatus),
    currentCompany: row.currentCompany?.trim() || null,
    legacySkillsText: row.skills.trim(),
    notes: row.notes?.trim() || null,
    structuredSkills,
    placements,
  };
}
