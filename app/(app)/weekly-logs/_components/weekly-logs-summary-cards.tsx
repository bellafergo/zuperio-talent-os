import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WeeklyLogsSummaryCards({
  total,
  overdue,
  submitted,
  approved,
}: {
  total: number;
  overdue: number;
  submitted: number;
  approved: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard label="Total logs" value={total} />
      <SummaryCard label="Overdue" value={overdue} />
      <SummaryCard label="Submitted" value={submitted} />
      <SummaryCard label="Approved" value={approved} />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

