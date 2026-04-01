import { prisma } from "@/lib/prisma";

import { mapWeeklyLogToListRowUi, type WeeklyLogWithPlacement } from "./mappers";
import type { WeeklyLogListRowUi, WeeklyLogPlacementOption } from "./types";

const weeklyLogSelect = {
  id: true,
  placementId: true,
  weekStart: true,
  weekEnd: true,
  status: true,
  hoursTotal: true,
  summary: true,
  achievements: true,
  blockers: true,
  placement: {
    select: {
      candidate: { select: { firstName: true, lastName: true } },
      company: { select: { name: true } },
      vacancy: { select: { title: true } },
    },
  },
} as const;

export async function listWeeklyLogsForUi(): Promise<WeeklyLogListRowUi[]> {
  const rows = await prisma.weeklyLog.findMany({
    select: weeklyLogSelect,
    orderBy: [{ weekStart: "desc" }, { updatedAt: "desc" }],
  });
  return rows.map((r) => mapWeeklyLogToListRowUi(r as unknown as WeeklyLogWithPlacement));
}

export async function listPlacementsForWeeklyLogForm(): Promise<
  WeeklyLogPlacementOption[]
> {
  const rows = await prisma.placement.findMany({
    select: {
      id: true,
      candidate: { select: { firstName: true, lastName: true } },
      company: { select: { name: true } },
      vacancy: { select: { title: true } },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
  return rows.map((p) => ({
    id: p.id,
    candidateName: `${p.candidate.firstName} ${p.candidate.lastName}`.trim(),
    companyName: p.company.name,
    vacancyTitle: p.vacancy.title,
  }));
}

