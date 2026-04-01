"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  navItemsForRole,
  roleLabel,
  type NavItemDef,
} from "@/lib/auth/access";
import type { UserRole } from "@/generated/prisma/enums";

function titleForPath(pathname: string, navItems: NavItemDef[]): string {
  const exact = navItems.find((item) => item.href === pathname);
  if (exact) return exact.label;
  if (/^\/companies\/.+/.test(pathname)) return "Empresa";
  if (/^\/contacts\/.+/.test(pathname)) return "Contacto";
  if (/^\/opportunities\/.+/.test(pathname)) return "Oportunidad";
  if (/^\/vacancies\/.+/.test(pathname)) return "Vacante";
  if (/^\/candidates\/.+/.test(pathname)) return "Candidato";
  if (/^\/proposals\/.+/.test(pathname)) return "Propuesta";
  if (/^\/matching\/compare\/.+/.test(pathname)) return "Comparar match";
  if (pathname === "/matching") return "Matching";
  if (pathname === "/skills") return "Skills";
  if (pathname === "/applications") return "Postulaciones";
  if (pathname.startsWith("/admin/users")) return "Usuarios";
  return "Zuperio Talent OS";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const role = session?.user?.role as UserRole | undefined;
  const navItems = navItemsForRole(role);
  const title = titleForPath(pathname, navItems);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="border-b border-sidebar-border px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Zuperio
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-sidebar-foreground">
            Talent OS
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {status === "loading" ? (
            <p className="px-3 text-sm text-muted-foreground">Cargando…</p>
          ) : (
            <ul className="space-y-0.5">
              {navItems.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border/80 bg-background/85 px-5 py-3.5 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
          <div className="mx-auto flex w-full max-w-[min(100%,90rem)] items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Operación
              </p>
              <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
                {title}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {session?.user ? (
                <>
                  <div className="hidden rounded-full border border-border bg-muted px-3 py-1.5 text-xs sm:block">
                    <span className="font-medium text-foreground">
                      {session.user.name ?? session.user.email}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {roleLabel(session.user.role)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() =>
                      signOut({ callbackUrl: "/login", redirect: true })
                    }
                  >
                    <LogOutIcon className="size-3.5" aria-hidden />
                    Cerrar sesión
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
