import { EmptyState } from "@/components/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SkillCatalogGroupUi } from "@/lib/skills/types";

export function SkillsCatalog({ groups }: { groups: SkillCatalogGroupUi[] }) {
  if (groups.length === 0) {
    return (
      <EmptyState
        variant="embedded"
        title="Catálogo vacío"
        description="Aún no hay skills en el catálogo. Un director puede agregar el primero."
      />
    );
  }

  // Flatten groups into a single sorted table
  const rows = groups.flatMap((g) => g.skills);
  const total = rows.length;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {total} skill{total !== 1 ? "s" : ""} en el catálogo
      </p>

      <div className="-mx-4 max-w-[calc(100%+2rem)] sm:mx-0 sm:max-w-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-[240px]">Categoría</TableHead>
              <TableHead className="w-[110px] text-right">Candidatos</TableHead>
              <TableHead className="w-[110px] text-right">Vacantes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="text-muted-foreground">{s.category}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {s.candidateCount > 0 ? s.candidateCount : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {s.vacancyCount > 0 ? s.vacancyCount : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
