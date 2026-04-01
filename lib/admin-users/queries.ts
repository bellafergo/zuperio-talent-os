import { prisma } from "@/lib/prisma";

import type { AdminUserRow } from "./types";

function formatCreatedAt(d: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export async function listUsersForAdmin(): Promise<AdminUserRow[]> {
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    isActive: r.isActive,
    createdAtLabel: formatCreatedAt(r.createdAt),
  }));
}
