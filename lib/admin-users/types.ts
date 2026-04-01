import type { UserRole } from "@/generated/prisma/enums";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAtLabel: string;
};

export type AdminUserActionState =
  | { ok: true }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };
