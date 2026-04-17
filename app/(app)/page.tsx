import { getHomeSummaryMetrics } from "@/lib/dashboard/summary-queries";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const metrics = await getHomeSummaryMetrics();

  const cards = [
    { label: "Oportunidades activas", value: metrics.activeOpportunities },
    { label: "Vacantes abiertas", value: metrics.openVacancies },
    { label: "Empleados activos", value: metrics.activePlacements },
    { label: "Bitácoras pendientes", value: metrics.pendingLogs },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => (
          <Card key={item.label} className="shadow-sm" size="sm">
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {item.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
