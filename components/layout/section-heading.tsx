import { cn } from "@/lib/utils";

/** In-page section title (under the main page header). */
export function SectionHeading({
  title,
  description,
  className,
  /** Larger title for primary dashboard bands. */
  prominence = "default",
}: {
  title: string;
  description?: string;
  className?: string;
  prominence?: "default" | "lead";
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <h2
        className={cn(
          "font-semibold tracking-tight text-foreground",
          prominence === "lead"
            ? "text-base sm:text-[1.05rem]"
            : "text-sm",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
