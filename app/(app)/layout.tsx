import { AppShell } from "@/components/app-shell";
import { PageShell } from "@/components/layout/page-shell";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppShell>
      <PageShell>{children}</PageShell>
    </AppShell>
  );
}
