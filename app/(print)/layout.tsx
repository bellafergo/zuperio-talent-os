import type { ReactNode } from "react";

/**
 * Bare layout for print/PDF capture — no app chrome (sidebar, nav).
 */
export default function PrintLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-full bg-white text-foreground antialiased">
      {children}
    </div>
  );
}
