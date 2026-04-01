"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { canManageWeeklyLogs } from "@/lib/auth/weekly-log-access";
import { prisma } from "@/lib/prisma";

import { parseWeeklyLogForm } from "./validation";

export type WeeklyLogActionState =
  | { ok: true; weeklyLogId?: string }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

export type ReminderActionState =
  | { ok: true }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

async function ensureCanManage(): Promise<
  { ok: true } | { ok: false; state: WeeklyLogActionState }
> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, state: { ok: false, message: "You must be signed in." } };
  }
  if (!canManageWeeklyLogs(session.user.role)) {
    return {
      ok: false,
      state: { ok: false, message: "You do not have permission to change weekly logs." },
    };
  }
  return { ok: true };
}

async function ensureCanManageReminders(): Promise<
  { ok: true } | { ok: false; state: ReminderActionState }
> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, state: { ok: false, message: "You must be signed in." } };
  }
  if (!canManageWeeklyLogs(session.user.role)) {
    return {
      ok: false,
      state: {
        ok: false,
        message: "You do not have permission to manage reminders.",
      },
    };
  }
  return { ok: true };
}

export async function createWeeklyLog(
  _prev: WeeklyLogActionState | null,
  formData: FormData,
): Promise<WeeklyLogActionState> {
  const gate = await ensureCanManage();
  if (!gate.ok) return gate.state;

  const parsed = parseWeeklyLogForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };
  const { data } = parsed;

  const placement = await prisma.placement.findUnique({
    where: { id: data.placementId },
    select: { id: true },
  });
  if (!placement) {
    return { ok: false, fieldErrors: { placementId: "Selected placement was not found." } };
  }

  try {
    const created = await prisma.weeklyLog.create({
      data: {
        placementId: data.placementId,
        weekStart: data.weekStart,
        weekEnd: data.weekEnd,
        summary: data.summary,
        achievements: data.achievements,
        blockers: data.blockers,
        hoursTotal: data.hoursTotal,
        status: data.status,
      },
      select: { id: true },
    });

    revalidatePath("/weekly-logs");
    return { ok: true, weeklyLogId: created.id };
  } catch {
    return { ok: false, message: "Could not create the weekly log. Try again." };
  }
}

export async function updateWeeklyLog(
  _prev: WeeklyLogActionState | null,
  formData: FormData,
): Promise<WeeklyLogActionState> {
  const gate = await ensureCanManage();
  if (!gate.ok) return gate.state;

  const idRaw = formData.get("weeklyLogId");
  const weeklyLogId = typeof idRaw === "string" ? idRaw.trim() : "";
  if (!weeklyLogId) return { ok: false, message: "Missing weekly log id." };

  const existing = await prisma.weeklyLog.findUnique({
    where: { id: weeklyLogId },
    select: { id: true, placementId: true },
  });
  if (!existing) return { ok: false, message: "Weekly log was not found." };

  const parsed = parseWeeklyLogForm(formData);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };
  const { data } = parsed;

  const placement = await prisma.placement.findUnique({
    where: { id: data.placementId },
    select: { id: true },
  });
  if (!placement) {
    return { ok: false, fieldErrors: { placementId: "Selected placement was not found." } };
  }

  try {
    await prisma.weeklyLog.update({
      where: { id: weeklyLogId },
      data: {
        placementId: data.placementId,
        weekStart: data.weekStart,
        weekEnd: data.weekEnd,
        summary: data.summary,
        achievements: data.achievements,
        blockers: data.blockers,
        hoursTotal: data.hoursTotal,
        status: data.status,
      },
    });

    revalidatePath("/weekly-logs");
    return { ok: true, weeklyLogId };
  } catch {
    return { ok: false, message: "Could not update the weekly log. Try again." };
  }
}

export async function markWeeklyLogReminderSent(
  _prev: ReminderActionState | null,
  formData: FormData,
): Promise<ReminderActionState> {
  const gate = await ensureCanManageReminders();
  if (!gate.ok) return gate.state;

  const idRaw = formData.get("weeklyLogId");
  const weeklyLogId = typeof idRaw === "string" ? idRaw.trim() : "";
  if (!weeklyLogId) {
    return { ok: false, fieldErrors: { weeklyLogId: "Missing weekly log id." } };
  }

  const existing = await prisma.weeklyLog.findUnique({
    where: { id: weeklyLogId },
    select: { id: true, reminderCount: true },
  });
  if (!existing) return { ok: false, message: "Weekly log was not found." };

  try {
    await prisma.weeklyLog.update({
      where: { id: weeklyLogId },
      data: {
        reminderLastSentAt: new Date(),
        reminderCount: (existing.reminderCount ?? 0) + 1,
      },
    });
  } catch {
    return { ok: false, message: "Could not mark reminder as sent. Try again." };
  }

  revalidatePath("/weekly-logs");
  return { ok: true };
}

