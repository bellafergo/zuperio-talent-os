import { SectionCard } from "@/components/layout/section-card";
import { Badge } from "@/components/ui/badge";
import type { VacancyRequirementUi } from "@/lib/skills/types";

function RequirementChip({ req }: { req: VacancyRequirementUi }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
        req.required
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-muted/30"
      }`}
    >
      <span className="font-medium text-foreground">{req.name}</span>
      {req.category ? (
        <span className="text-xs text-muted-foreground">({req.category})</span>
      ) : null}
      {req.minimumYears != null ? (
        <Badge variant="secondary" className="text-xs font-normal">
          {req.minimumYearsLabel}
        </Badge>
      ) : null}
      <Badge
        variant={req.required ? "default" : "outline"}
        className="ml-auto shrink-0 text-xs"
      >
        {req.required ? "Required" : "Nice to have"}
      </Badge>
    </div>
  );
}

function RequirementBlock({
  title,
  rows,
}: {
  title: string;
  rows: VacancyRequirementUi[];
}) {
  const required = rows.filter((r) => r.required);
  const optional = rows.filter((r) => !r.required);
  if (rows.length === 0) return null;
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-foreground">{title}</p>
      {required.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Required
          </p>
          <div className="flex flex-col gap-2">
            {required.map((r) => (
              <RequirementChip key={r.id} req={r} />
            ))}
          </div>
        </div>
      ) : null}
      {optional.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Nice to have
          </p>
          <div className="flex flex-col gap-2">
            {optional.map((r) => (
              <RequirementChip key={r.id} req={r} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function VacancyRequirementsSection({
  requirements,
}: {
  requirements: VacancyRequirementUi[];
}) {
  const tech = requirements.filter((r) => r.skillType !== "METHODOLOGY");
  const meth = requirements.filter((r) => r.skillType === "METHODOLOGY");

  return (
    <SectionCard
      title="Requirements"
      description="Structured skills from the catalog. Tecnologías vs metodologías; required vs nice-to-have informs matching; legacy requisition text remains in the summary fields."
      contentClassName="space-y-6 pt-4"
    >
      {requirements.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No structured requirements yet.
        </p>
      ) : (
        <div className="space-y-8">
          <RequirementBlock title="Tecnologías" rows={tech} />
          <RequirementBlock title="Metodologías" rows={meth} />
        </div>
      )}
    </SectionCard>
  );
}
