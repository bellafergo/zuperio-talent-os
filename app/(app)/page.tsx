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
  { name: "Acme Corp", stage: "Negociación", owner: "Tú" },
  { name: "Northwind", stage: "Descubrimiento", owner: "Equipo" },
  { name: "Contoso", stage: "Calificada", owner: "Tú" },
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Oportunidades activas", value: "—" },
          { label: "Vacantes abiertas", value: "—" },
          { label: "Empleados activos", value: "—" },
          { label: "Bitácoras pendientes", value: "—" },
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
          <CardTitle>Resumen</CardTitle>
          <CardDescription>
            Las métricas en vivo aparecerán aquí cuando estén conectadas al
            backend. Usa el menú lateral para ir a cada área de trabajo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex max-w-md flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              className="sm:flex-1"
              placeholder="Buscar (próximamente)"
              type="search"
              aria-label="Buscar"
            />
            <Button type="button" variant="secondary" className="shrink-0">
              Filtrar
            </Button>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tabla de ejemplo
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Responsable</TableHead>
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
