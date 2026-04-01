import type { ProposalStatus } from "@/generated/prisma/enums";

/** Follow-up is due when the client has had the proposal for more than this (deterministic). */
export const FOLLOW_UP_AFTER_SENT_MS = 2 * 24 * 60 * 60 * 1000;

/**
 * True when the proposal is waiting for a commercial follow-up:
 * status is SENT, we know when it was sent, and more than 2 days have passed since sentAt.
 * Not applicable once WON/LOST (those statuses are never SENT).
 */
export function computeIsFollowUpPending(
  status: ProposalStatus,
  sentAt: Date | null,
  nowMs: number = Date.now(),
): boolean {
  if (status !== "SENT") return false;
  if (!sentAt) return false;
  return nowMs - sentAt.getTime() > FOLLOW_UP_AFTER_SENT_MS;
}

export function followUpThresholdDate(nowMs: number = Date.now()): Date {
  return new Date(nowMs - FOLLOW_UP_AFTER_SENT_MS);
}
