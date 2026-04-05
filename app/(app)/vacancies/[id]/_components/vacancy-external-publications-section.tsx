import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExternalPublicationRowUi } from "@/lib/job-board/queries-safe";
import { externalPublicationStatusLabel } from "@/lib/job-board/publication-status-labels";

function formatDt(d: Date | null): string {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);
  } catch {
    return "—";
  }
}

export function VacancyExternalPublicationsSection({
  rows,
}: {
  rows: ExternalPublicationRowUi[];
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-medium">
          Publicación en bolsas externas
        </CardTitle>
        <CardDescription>
          Registro interno de dónde se publicó la vacante. Las integraciones en
          vivo (OCC, Computrabajo, LinkedIn, etc.) se conectarán aquí.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sin publicaciones externas registradas.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>ID externo</TableHead>
                <TableHead>Publicada</TableHead>
                <TableHead>Última sync</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.providerLabel}
                  </TableCell>
                  <TableCell>
                    {externalPublicationStatusLabel(r.status)}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate text-muted-foreground">
                    {r.externalVacancyRef ?? "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                    {formatDt(r.publishedAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                    {formatDt(r.lastSyncAt)}
                  </TableCell>
                  <TableCell className="max-w-[220px] text-xs text-destructive">
                    {r.lastError ? (
                      <span className="line-clamp-2" title={r.lastError}>
                        {r.lastError}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
