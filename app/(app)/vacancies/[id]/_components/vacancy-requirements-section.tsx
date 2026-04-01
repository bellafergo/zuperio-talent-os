import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export function VacancyRequirementsSection({
  requirements,
}: {
  requirements: VacancyRequirementUi[];
}) {
  const required = requirements.filter((r) => r.required);
  const optional = requirements.filter((r) => !r.required);

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-medium">Requirements</CardTitle>
        <CardDescription>
          Structured skills from the catalog. Required vs nice-to-have informs
          future matching; legacy requisition text remains in the summary fields.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {requirements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No structured requirements yet.
          </p>
        ) : (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
