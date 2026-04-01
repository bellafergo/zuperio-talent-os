import {
  WeeklyLogStatus as StatusConst,
  type WeeklyLogStatus,
} from "@/generated/prisma/enums";

const STATUS_SET = new Set<string>(Object.values(StatusConst));

export type WeeklyLogFormParsed = {
  placementId: string;
  weekStart: Date;
  weekEnd: Date;
  summary: string | null;
  achievements: string | null;
  blockers: string | null;
  hoursTotal: number | null;
  status: WeeklyLogStatus;
};

export type WeeklyLogFormValidationResult =
  | { ok: true; data: WeeklyLogFormParsed }
  | { ok: false; fieldErrors: Record<string, string> };

function parseOptionalTrimmed(formData: FormData, key: string): string | null {
  const raw = formData.get(key);
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  return v ? v : null;
}

function parseRequiredTrimmed(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(d.getTime()) ? d : null;
}

export function parseWeeklyLogForm(formData: FormData): WeeklyLogFormValidationResult {
  const fieldErrors: Record<string, string> = {};

  const placementId = parseRequiredTrimmed(formData, "placementId");
  if (!placementId) fieldErrors.placementId = "Placement is required.";

  const weekStartRaw = parseRequiredTrimmed(formData, "weekStart");
  const weekStart = weekStartRaw ? parseDateInput(weekStartRaw) : null;
  if (!weekStart) fieldErrors.weekStart = "Week start is required.";

  const weekEndRaw = parseRequiredTrimmed(formData, "weekEnd");
  const weekEnd = weekEndRaw ? parseDateInput(weekEndRaw) : null;
  if (!weekEnd) fieldErrors.weekEnd = "Week end is required.";

  if (weekStart && weekEnd && weekEnd.getTime() < weekStart.getTime()) {
    fieldErrors.weekEnd = "Week end cannot be before week start.";
  }

  const statusRaw = parseOptionalTrimmed(formData, "status") ?? "";
  if (!statusRaw || !STATUS_SET.has(statusRaw)) {
    fieldErrors.status = "Select a valid status.";
  }

  const hoursRaw = parseOptionalTrimmed(formData, "hoursTotal");
  let hoursTotal: number | null = null;
  if (hoursRaw) {
    const n = Number(hoursRaw);
    if (!Number.isFinite(n) || n < 0) {
      fieldErrors.hoursTotal = "Enter valid hours (0 or higher).";
    } else {
      hoursTotal = n;
    }
  }

  const summary = parseOptionalTrimmed(formData, "summary");
  const achievements = parseOptionalTrimmed(formData, "achievements");
  const blockers = parseOptionalTrimmed(formData, "blockers");

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      placementId,
      weekStart: weekStart!,
      weekEnd: weekEnd!,
      summary,
      achievements,
      blockers,
      hoursTotal,
      status: statusRaw as WeeklyLogStatus,
    },
  };
}

