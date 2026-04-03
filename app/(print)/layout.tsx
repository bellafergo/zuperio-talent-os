import type { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-pdf",
});

/**
 * Bare layout for print/PDF capture — no app chrome (sidebar, nav).
 */
export default function PrintLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div
      className={`${inter.className} ${inter.variable} min-h-full bg-white text-foreground antialiased`}
    >
      {children}
    </div>
  );
}
