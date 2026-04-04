import type { ProposalStatus } from "@/generated/prisma/enums";

/**
 * When commercial outcome moves to WON/LOST, record closure time.
 * When leaving WON/LOST, clear so a new cycle can record again.
 */
export function commercialClosedAtPatchForStatusChange(
  previous: ProposalStatus,
  next: ProposalStatus,
): { commercialClosedAt?: Date | null } {
  const nextTerminal = next === "WON" || next === "LOST";
  const prevTerminal = previous === "WON" || previous === "LOST";

  if (nextTerminal) {
    if (!prevTerminal || previous !== next) {
      return { commercialClosedAt: new Date() };
    }
    return {};
  }

  if (prevTerminal && !nextTerminal) {
    return { commercialClosedAt: null };
  }

  return {};
}
