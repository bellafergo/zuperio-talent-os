import { prisma } from "@/lib/prisma";

import type { AdminUserDisplayStatus, AdminUserRow } from "./types";

function formatAt(d: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function actorLabel(name: string | null, email: string): string {
  const n = name?.trim();
  return n || email;
}

function deriveDisplayStatus(r: {
  isDeleted: boolean;
  isActive: boolean;
  deletionRequestedAt: Date | null;
  deletionApprovedAt: Date | null;
}): AdminUserDisplayStatus {
  if (r.isDeleted) return "removed";
  if (r.deletionRequestedAt && !r.deletionApprovedAt) return "pending_removal";
  if (!r.isActive) return "inactive";
  return "active";
}

export async function listUsersForAdmin(options: {
  includeRemoved: boolean;
}): Promise<AdminUserRow[]> {
  const rows = await prisma.user.findMany({
    where: options.includeRemoved ? {} : { isDeleted: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      isDeleted: true,
      createdAt: true,
      deletionRequestedAt: true,
      deletionRequestedById: true,
      deletionApprovedAt: true,
      deletionRequester: {
        select: { name: true, email: true },
      },
      deletionApprover: {
        select: { name: true, email: true },
      },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    isActive: r.isActive,
    isDeleted: r.isDeleted,
    createdAtLabel: formatAt(r.createdAt),
    displayStatus: deriveDisplayStatus({
      isDeleted: r.isDeleted,
      isActive: r.isActive,
      deletionRequestedAt: r.deletionRequestedAt,
      deletionApprovedAt: r.deletionApprovedAt,
    }),
    deletionRequestedById: r.deletionRequestedById,
    deletionRequestedAtLabel: r.deletionRequestedAt
      ? formatAt(r.deletionRequestedAt)
      : null,
    deletionRequesterLabel: r.deletionRequester
      ? actorLabel(r.deletionRequester.name, r.deletionRequester.email)
      : null,
    deletionApprovedAtLabel: r.deletionApprovedAt
      ? formatAt(r.deletionApprovedAt)
      : null,
    deletionApproverLabel: r.deletionApprover
      ? actorLabel(r.deletionApprover.name, r.deletionApprover.email)
      : null,
  }));
}
