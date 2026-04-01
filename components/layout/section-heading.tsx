import { cn } from "@/lib/utils";

/** In-page section title (under the main page header). */
export function SectionHeading({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <h2 className="text-sm font-semibold tracking-tight text-foreground">
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
