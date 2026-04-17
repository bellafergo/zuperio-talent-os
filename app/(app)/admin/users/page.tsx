import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PageHeader } from "@/components/layout";
import { listUsersForAdmin } from "@/lib/admin-users/queries";
import { canManageUsers } from "@/lib/auth/user-admin-access";
import { cn } from "@/lib/utils";

import { AdminUserNewDialog } from "./_components/admin-user-new-dialog";
import { AdminUsersTable } from "./_components/admin-users-table";

export const dynamic = "force-dynamic";

const filterLinkClass = cn(
  "font-medium text-primary underline-offset-4 hover:underline",
);

type PageProps = {
  searchParams: Promise<{ showRemoved?: string }>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || !canManageUsers(session.user.role)) {
    redirect("/");
  }

  const sp = await searchParams;
  const includeRemoved =
    sp.showRemoved === "1" || sp.showRemoved === "true" || sp.showRemoved === "on";

  const users = await listUsersForAdmin({ includeRemoved });

  return (
    <div className="space-y-8">
      <PageHeader
        variant="list"
        title="Usuarios internos"
        description="Alta y mantenimiento solo para directores. La baja definitiva requiere solicitud de un director y aprobación de otro; el registro se conserva (no es borrado físico)."
        actions={<AdminUserNewDialog />}
      />

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/15 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          {includeRemoved
            ? "Mostrando también cuentas dadas de baja administrativa (auditoría)."
            : "Por defecto se ocultan las cuentas dadas de baja administrativa."}
        </p>
        <div className="flex shrink-0 gap-3">
          {includeRemoved ? (
            <Link href="/admin/users" className={filterLinkClass}>
              Ocultar dados de baja
            </Link>
          ) : (
            <Link href="/admin/users?showRemoved=1" className={filterLinkClass}>
              Mostrar dados de baja
            </Link>
          )}
        </div>
      </div>

      <AdminUsersTable
        users={users}
        currentUserId={session.user.id}
        includeRemoved={includeRemoved}
      />
    </div>
  );
}
