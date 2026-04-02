import type { UserRole } from "@/generated/prisma/enums";

/** Row status for /admin/users (not stored as enum; derived from flags + deletion workflow). */
export type AdminUserDisplayStatus =
  | "active"
  | "inactive"
  | "pending_removal"
  | "removed";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  isActive: boolean;
  isDeleted: boolean;
  createdAtLabel: string;
  displayStatus: AdminUserDisplayStatus;
  deletionRequestedById: string | null;
  deletionRequestedAtLabel: string | null;
  deletionRequesterLabel: string | null;
  deletionApprovedAtLabel: string | null;
  deletionApproverLabel: string | null;
};

export type AdminUserActionState =
  | { ok: true }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };
