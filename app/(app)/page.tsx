import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SAMPLE_ROWS = [
  { name: "Acme Corp", stage: "Negotiation", owner: "You" },
  { name: "Northwind", stage: "Discovery", owner: "Team" },
  { name: "Contoso", stage: "Qualified", owner: "You" },
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active opportunities", value: "—" },
          { label: "Open vacancies", value: "—" },
          { label: "Active employees", value: "—" },
          { label: "Weekly logs due", value: "—" },
        ].map((item) => (
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

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            Dashboard metrics and activity will appear here once backend data
            is connected. Use the sidebar to navigate to each workspace area.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex max-w-md flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              className="sm:flex-1"
              placeholder="Search (placeholder)"
              type="search"
              aria-label="Search placeholder"
            />
            <Button type="button" variant="secondary" className="shrink-0">
              Filter
            </Button>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Sample table
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SAMPLE_ROWS.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.stage}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.owner}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
