import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PageHeader } from "@/components/layout";
import { listUsersForAdmin } from "@/lib/admin-users/queries";
import { canManageUsers } from "@/lib/auth/user-admin-access";

import { AdminUserNewDialog } from "./_components/admin-user-new-dialog";
import { AdminUsersTable } from "./_components/admin-users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.id || !canManageUsers(session.user.role)) {
    redirect("/");
  }

  const users = await listUsersForAdmin();

  return (
    <div className="space-y-8">
      <PageHeader
        variant="list"
        title="Usuarios internos"
        description="Alta y mantenimiento de cuentas solo para directores. No existe registro público: cada usuario se crea aquí con una contraseña temporal."
        actions={<AdminUserNewDialog />}
      />
      <AdminUsersTable users={users} currentUserId={session.user.id} />
    </div>
  );
}
