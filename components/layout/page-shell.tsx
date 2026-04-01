import { cn } from "@/lib/utils";

/**
 * Constrains content width and standardizes vertical rhythm for app pages.
 */
export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[min(100%,90rem)] space-y-8 pb-1",
        className,
      )}
    >
      {children}
    </div>
  );
}
